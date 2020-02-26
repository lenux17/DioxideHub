import React, { useEffect } from "react";
import styled from "styled-components";
import { Chart } from "react-google-charts";

const Wrapper = styled.div`
  text-align: center;
`;

const App: React.FC = () => {
  useEffect(() => {
    const fetchData = async () => {
      const result = await fetch(
        `https://api.airvisual.com/v2/city?city=Paris&state=Ile-de-France&country=France&key=${process.env.REACT_APP_AIR_VISUAL}`,
        {
          method: "GET",
          redirect: "follow"
        }
      );

      const resultText = await result.json();

      console.log(resultText);
    };

    fetchData();
  }, []);

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
