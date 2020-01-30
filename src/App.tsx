import React from "react";
import styled from "styled-components";
import { withGoogleMap, GoogleMap, Marker } from "react-google-maps";

const Wrapper = styled.div`
  text-align: center;
`;
const MapWrapper = styled.div`
  width: auto;
  height: 100vh;
`;

const Map = withGoogleMap(props => (
  <GoogleMap defaultZoom={8} defaultCenter={{ lat: -34.397, lng: 150.644 }}>
    <Marker position={{ lat: -34.397, lng: 150.644 }} />
  </GoogleMap>
));

const App: React.FC = () => {
  return (
    <Wrapper>
      <Map containerElement={<MapWrapper />} mapElement={<MapWrapper />} />
    </Wrapper>
  );
};

export default App;
