import * as dotenv from "dotenv";
import { createError } from "../error.js";
import OpenAI from "openai";

dotenv.config();

// Setup OpenAI client (new SDK)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Controller to generate Image
export const generateImage = async (req, res, next) => {
  try {
    const { prompt } = req.body;

    // Use the new images.generate method and the newer model name
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: "1024x1024",
    });
    // New SDK returns an array at response.data; first item holds b64 JSON
    const generatedImage = response?.data?.[0]?.b64_json;
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
