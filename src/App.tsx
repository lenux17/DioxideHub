import React from "react";
import styled from "styled-components";
import { Chart } from "react-google-charts";

const Wrapper = styled.div`
  text-align: center;
`;

const App: React.FC = () => {
  return (
    <Wrapper>
      <Chart
        chartType="GeoChart"
        data={[["Country"], ["Poland"]]}
        width="100vw"
        height="100vh"
      />
    </Wrapper>
  );
};

export default App;
