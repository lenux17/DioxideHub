import React, { useEffect } from "react";
import styled from "styled-components";
import { withGoogleMap, GoogleMap, Marker } from "react-google-maps";
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
