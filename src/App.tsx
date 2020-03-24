import React from "react";
import styled from "styled-components";
import Search from "./Search";

const Wrapper = styled.div`
  text-align: center;
`;

const App: React.FC = () => (
  <Wrapper>
    <Search />
  </Wrapper>
);

export default App;
