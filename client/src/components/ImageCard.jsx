import React, { useState } from "react";
import styled from "styled-components";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { DownloadRounded } from "@mui/icons-material";
import FileSaver from "file-saver";

const Card = styled.div`
  break-inside: avoid;
  page-break-inside: avoid;
  margin-bottom: 20px;
  width: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  background: #000;
  cursor: pointer;
  display: inline-block;
  /* Fixed shadow - no transition to prevent layout shift */
  box-shadow: 1px 2px 40px 8px ${({ theme }) => theme.black + 60};
`;

const CardInner = styled.div`
  position: relative;
  width: 100%;
  /* This wrapper handles the hover effect without affecting column layout */
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform: ${({ $isHovered }) => ($isHovered ? "scale(1.02)" : "scale(1)")};
  transform-origin: center center;
  will-change: transform;
`;

const ImageWrapper = styled.div`
  width: 100%;
  display: block;
  position: relative;
  background: #000;
  overflow: hidden;
  border-radius: 20px;
`;

const Image = styled(LazyLoadImage)`
  width: 100%;
  height: auto;
  display: block;
  object-fit: cover;
`;

const HoverOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    transparent 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 16px;
  gap: 8px;
  opacity: ${({ $isHovered }) => ($isHovered ? 1 : 0)};
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: ${({ $isHovered }) => ($isHovered ? "auto" : "none")};
`;

const Prompt = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  line-height: 1.4;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const BottomRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

const Author = styled.div`
  font-size: 12px;
  color: #cccccc;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

const AuthorName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Avatar = styled.div`
  width: 22px;
  height: 22px;
  min-width: 22px;
  border-radius: 50%;
  background: ${({ theme }) => theme.primary};
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;

const DownloadIcon = styled(DownloadRounded)`
  font-size: 22px !important;
  cursor: pointer;
  color: white;
  transition: color 0.2s ease;
  flex-shrink: 0;

  &:hover {
    color: ${({ theme }) => theme.primary};
  }
`;

const ImageCard = ({ item }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleDownload = (e) => {
    e.stopPropagation();
    FileSaver.saveAs(item?.photo, `${item?.prompt || "image"}.jpg`);
  };

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardInner $isHovered={isHovered}>
        <ImageWrapper>
          <Image
            src={item?.photo}
            alt={item?.prompt || "Generated image"}
            effect="blur"
            wrapperProps={{
              style: { display: "block" },
            }}
          />

          <HoverOverlay $isHovered={isHovered}>
            <Prompt>{item?.prompt}</Prompt>

            <BottomRow>
              <Author>
                <Avatar>{item?.author?.[0] || "?"}</Avatar>
                <AuthorName>{item?.author}</AuthorName>
              </Author>

              <DownloadIcon onClick={handleDownload} />
            </BottomRow>
          </HoverOverlay>
        </ImageWrapper>
      </CardInner>
    </Card>
  );
};

export default ImageCard;