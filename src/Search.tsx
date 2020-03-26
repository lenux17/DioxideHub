import React, { useEffect } from "react";
import styled from "styled-components";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng
} from "react-places-autocomplete";
import { withGoogleMap, GoogleMap, Marker } from "react-google-maps";

const MapWrapper = styled.div`
  width: auto;
  height: 100vh;
`;
const Index = styled.div<{ aqius?: string }>`
  background-color: ${({ aqius }) => {
    if (!aqius) return "white";
    const numberAqius = parseInt(aqius, 10);
    return numberAqius < 50
      ? "green"
      : numberAqius < 100
      ? "yellow"
      : numberAqius < 150
      ? "orange"
      : numberAqius < 200
      ? "red"
      : numberAqius < 300
      ? "mediumorchid"
      : numberAqius < 500
      ? "maroon"
      : "white";
  }};
`;

interface CoordinatesState {
  lat: number | null;
  lng: number | null;
}

export default function Search() {
  const [address, setAddress] = React.useState("");
  const [pollutionData, setPollutionData] = React.useState<{
    data?: { city: string; current?: { pollution: { aqius: string } } };
  } | null>(null);
  const [coordinates, setCoordinates] = React.useState<CoordinatesState>({
    lat: null,
    lng: null
  });

  const handleSelect = async (value: any) => {
    const results = await geocodeByAddress(value);
    const latLng = await getLatLng(results[0]);
    setAddress(value);
    setCoordinates(latLng);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (coordinates.lat === null || coordinates.lng === null) {
          return;
        }

        const result = await fetch(
          `https://api.airvisual.com/v2/nearest_city?lat=${coordinates.lat.toFixed(
            2
          )}&lon=${coordinates.lng.toFixed(2)}&key=${
            process.env.REACT_APP_AIR_VISUAL
          }`,
          {
            method: "GET",
            redirect: "follow"
          }
        );

        const response = await result.json();
        setPollutionData(response);
      } catch (e) {
        console.error(e);
      }
    };

    fetchData();
  }, [coordinates]);

  const Map = withGoogleMap(props => (
    <GoogleMap
      defaultZoom={2.5}
      defaultCenter={{ lat: 0, lng: 0 }}
      center={{ lat: coordinates.lat || 0, lng: coordinates.lng || 0 }}
      zoom={coordinates.lat && coordinates.lng ? 7 : 2.5}
    >
      {coordinates.lat && coordinates.lng && (
        <Marker position={{ lat: coordinates.lat, lng: coordinates.lng }} />
      )}
    </GoogleMap>
  ));

  return (
    <div>
      <PlacesAutocomplete
        value={address}
        onChange={setAddress}
        onSelect={handleSelect}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div>
            <p>Latitude: {coordinates.lat}</p>
            <p>Longitude: {coordinates.lng}</p>
            <input {...getInputProps({ placeholder: "Type adress" })} />

            <div>
              {loading ? <div>...loading</div> : null}

              {suggestions.map(suggestion => {
                const style = {
                  backgroundColor: suggestion.active ? "#41b6e6" : "#fff"
                };

                return (
                  <div {...getSuggestionItemProps(suggestion, { style })}>
                    {suggestion.description}
                  </div>
                );
              })}
            </div>

            <Index aqius={pollutionData?.data?.current?.pollution?.aqius}>
              <p>City: {pollutionData?.data?.city}</p>
              <p>
                AQI quality:{" "}
                {pollutionData && pollutionData.data?.current?.pollution?.aqius}
              </p>
            </Index>
            <Map
              containerElement={<MapWrapper />}
              mapElement={<MapWrapper />}
            />
          </div>
        )}
      </PlacesAutocomplete>
    </div>
  );
}
