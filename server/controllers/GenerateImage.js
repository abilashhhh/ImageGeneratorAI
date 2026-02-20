import * as dotenv from "dotenv";
import { createError } from "../error.js";
import OpenAI from "openai";
import { InferenceClient } from "@huggingface/inference";

dotenv.config();

// Setup OpenAI client (new SDK)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Setup Hugging Face Inference client if token present
const hfClient = process.env.HF_TOKEN
  ? new InferenceClient({ apiKey: process.env.HF_TOKEN })
  : null;

// normalize HF token (accept string or common token objects)
function normalizeToken(t) {
  if (!t) return null;
  if (typeof t === "string") return t;
  if (typeof t === "object") {
    if (typeof t.accessToken === "string") return t.accessToken;
    if (typeof t.token === "string") return t.token;
    if (typeof t.access_token === "string") return t.access_token;
    // fallback to toString
    try {
      return String(t);
    } catch (e) {
      return null;
    }
  }
  return String(t);
}

// helper: convert various blob/arraybuffer/stream-like results to base64
async function toBase64(blobLike) {
  if (!blobLike) return null;
  // Blob or Response-like with arrayBuffer()
  if (typeof blobLike.arrayBuffer === "function") {
    const buf = await blobLike.arrayBuffer();
    return Buffer.from(buf).toString("base64");
  }
  // ArrayBuffer
  if (blobLike instanceof ArrayBuffer) {
    return Buffer.from(new Uint8Array(blobLike)).toString("base64");
  }
  // Uint8Array or Buffer
  if (blobLike instanceof Uint8Array || Buffer.isBuffer(blobLike)) {
    return Buffer.from(blobLike).toString("base64");
  }
  // axios-like { data: ArrayBuffer|Uint8Array }
  if (blobLike.data) {
    const data = blobLike.data;
    if (data instanceof ArrayBuffer)
      return Buffer.from(new Uint8Array(data)).toString("base64");
    if (data instanceof Uint8Array || Buffer.isBuffer(data))
      return Buffer.from(data).toString("base64");
  }
  // readable stream (Node.js)
  if (blobLike.readable === true || typeof blobLike.on === "function") {
    const chunks = [];
    for await (const chunk of blobLike) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString("base64");
  }
  return null;
}

// Controller to generate Image
export const generateImage = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    let generatedImage = null;

    // Prefer Leonardo if API key provided
    const leonardoKey = process.env.LEONARDO_API_KEY;
    if (leonardoKey) {
      // Create generation job
      const createBody = {
        // minimal request: ask for one image using the provided prompt
        prompt,
        num_images: 1,
        width: 1024,
        height: 1024,
        ultra: false,
        alchemy: false,
      };

      const createRes = await fetch(
        "https://cloud.leonardo.ai/api/rest/v1/generations",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${leonardoKey}`,
          },
          body: JSON.stringify(createBody),
        },
      );

      if (!createRes.ok) {
        const text = await createRes.text();
        throw new Error(`Leonardo create error ${createRes.status}: ${text}`);
      }

      const createJson = await createRes.json();
      const generationId =
        createJson?.sdGenerationJob?.generationId || createJson?.id;
      if (!generationId) {
        throw new Error("Leonardo response missing generation id");
      }

      // Poll for completion
      const pollUrl = `https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`;
      let pollAttempts = 0;
      let finalJson = null;
      while (pollAttempts < 30) {
        const pollRes = await fetch(pollUrl, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${leonardoKey}`,
          },
        });
        if (!pollRes.ok) {
          const t = await pollRes.text();
          throw new Error(`Leonardo poll error ${pollRes.status}: ${t}`);
        }
        const j = await pollRes.json();
        finalJson = j?.generations_by_pk || j;
        const status = finalJson?.status;
        if (!status || status === "COMPLETE" || status === "complete") break;
        // Wait before next poll
        await new Promise((r) => setTimeout(r, 1000));
        pollAttempts += 1;
      }

      if (!finalJson)
        throw new Error("Leonardo: failed to retrieve generation result");

      // Extract image URL from known response shapes
      const imgs =
        finalJson?.generated_images || finalJson?.generatedImages || [];
      const finalUrl =
        imgs && imgs.length > 0 ? imgs[0]?.url || imgs[0]?.uri || null : null;
      if (!finalUrl) throw new Error("Leonardo: no image URL returned");

      const imgRes = await fetch(finalUrl);
      if (!imgRes.ok) {
        const t = await imgRes.text();
        throw new Error(`Leonardo image fetch error ${imgRes.status}: ${t}`);
      }
      const arrayBuffer = await imgRes.arrayBuffer();
      generatedImage = Buffer.from(arrayBuffer).toString("base64");
      return res.status(200).json({ photo: generatedImage });
    }

    if (hfClient) {
      // Prefer calling the Fal router directly and include accessToken in the body
      const token = normalizeToken(process.env.HF_TOKEN);
      if (!token) throw new Error("Invalid HF_TOKEN");

      const url =
        "https://router.huggingface.co/fal-ai/fal-ai/qwen-image?_subdomain=queue";

      const bodyPayload = {
        inputs: prompt,
        model: "Qwen/Qwen-Image",
        provider: "fal-ai",
        parameters: { num_inference_steps: 5 },
        accessToken: token, // router expects accessToken in body for queue endpoints
      };

      const hfRouterRes = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyPayload),
      });

      if (!hfRouterRes.ok) {
        let text = await hfRouterRes.text();
        try {
          const j = JSON.parse(text);
          text = j?.message || JSON.stringify(j);
        } catch (e) {
          // leave text as-is
        }
        throw new Error(`HF router error ${hfRouterRes.status}: ${text}`);
      }

      const arrayBuffer = await hfRouterRes.arrayBuffer();
      const b64 = Buffer.from(arrayBuffer).toString("base64");
      generatedImage = b64;
    } else {
      // Fallback to OpenAI images API
      const response = await openai.images.generate({
        model: "gpt-image-1",
        prompt,
        n: 1,
        size: "1024x1024",
      });
      // New SDK returns an array at response.data; first item holds b64 JSON
      generatedImage = response?.data?.[0]?.b64_json;
    }
    res.status(200).json({ photo: generatedImage });
  } catch (error) {
    next(
      createError(
        error.status,
        error?.response?.data?.error.message || error.message,
      ),
    );
  }
};
