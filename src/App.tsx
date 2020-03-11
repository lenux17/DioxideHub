import React, { useEffect } from "react";
import styled from "styled-components";
import { Chart } from "react-google-charts";
import Search from "./Search";

const Wrapper = styled.div`
  text-align: center;
`;

const App: React.FC = () => (
  <Wrapper>
    <Search />
    <Chart
      chartType="GeoChart"
      data={[["Country"], ["Poland"]]}
      width="100vw"
      height="100vh"
    />
  </Wrapper>
);

export default App;
