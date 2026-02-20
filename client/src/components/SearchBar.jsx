import { SearchOutlined } from "@mui/icons-material";
import React from "react";
import styled from "styled-components";

const SearchBarContainer = styled.div`
  width: 90%;
  max-width: 550px;
  margin: 20px auto;
  display: flex;
  border: 1px solid ${({ theme }) => theme.text_secondary + 90};
  color: ${({ theme }) => theme.text_primary};
  border-radius: 8px;
  padding: 12px 16px;
  cursor: pointer;
  gap: 6px;
  align-items: center;
`;

const SearchBar = () => {
  return (
    <SearchBarContainer>
      <SearchOutlined />
      <input
        type="text"
        placeholder="Search with prompts..."
        style={{
          width: "100%",
          border: "none",
          outline: "none",
          color: "inherit",
          fontSize: "18px",
          background: "transparent"
        }}
      />
    </SearchBarContainer>
  );
};

export default SearchBar;
