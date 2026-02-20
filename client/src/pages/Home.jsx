import React from "react";
import styled from "styled-components";
import SearchBar from "../components/SearchBar";
import ImageCard from "../components/ImageCard";

const Container = styled.div`
  min-height: 100vh;
  overflow-y: auto;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text_primary};
  padding: 30px;
  padding-bottom: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const Headline = styled.div`
  font-size: 34px;
  font-weight: 500;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: ${({ theme }) => theme.text_primary};

  @media (max-width: 768px) {
    font-size: 22px;
  }
`;

const Span = styled.div`
  font-size: 30px;
  font-weight: 500;
  color: ${({ theme }) => theme.primary};

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const Wrapper = styled.div`
  width: 100%;
  max-width: 1600px;
  padding: 32px 0;
`;

const Masonry = styled.div`
  width: 100%;
  column-count: 5;
  column-gap: 20px;

  @media (max-width: 1400px) {
    column-count: 4;
  }

  @media (max-width: 1100px) {
    column-count: 3;
  }

  @media (max-width: 768px) {
    column-count: 2;
  }

  @media (max-width: 480px) {
    column-count: 1;
  }
`;

const items = [
  {
    photo: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    prompt: "Football player running on the field",
    author: "John Doe",
  },
  {
    photo: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d",
    prompt: "Wide stadium shot",
    author: "Alex",
  },
  {
    photo: "https://images.unsplash.com/photo-1517649763962-0c623066013b",
    prompt: "Tall portrait football shot",
    author: "Mike",
  },
  {
    photo: "https://images.unsplash.com/photo-1502877338535-766e1452684a",
    prompt: "Action moment",
    author: "Sarah",
  },
  {
    photo: "https://images.unsplash.com/photo-1551958219-acbc608c6377",
    prompt: "Celebration scene",
    author: "Chris",
  },
  {
    photo: "https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf",
    prompt: "Goal attempt",
    author: "Emma",
  },
];

const Home = () => {
  return (
    <Container>
      <Headline>
        Explore popular posts in the community!
        <Span>Generated with AI</Span>
      </Headline>

      <SearchBar />

      <Wrapper>
        <Masonry>
          {items.map((item, index) => (
            <ImageCard key={index} item={item} />
          ))}
        </Masonry>
      </Wrapper>
    </Container>
  );
};

export default Home;
