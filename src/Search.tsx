import React, { useEffect } from "react";
import styled from "styled-components";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-places-autocomplete";
import { withGoogleMap, GoogleMap, Marker, Polygon } from "react-google-maps";

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
      ? "purple"
      : numberAqius < 500
      ? "maroon"
      : "white";
  }};
  position: absolute;
  z-index: 5;
  width: 15rem;
  left: 4rem;
  top: 25rem;
  border-radius: 10px;
`;
const Conditions = styled.div`
  background: linear-gradient(
    to bottom,
    rgba(0, 128, 0, 60%),
    rgba(255, 255, 0, 60%),
    rgba(255, 165, 0, 80%),
    rgba(255, 0, 0, 60%),
    rgba(128, 0, 128, 60%),
    rgba(128, 0, 0, 80%)
  );
  position: absolute;
  z-index: 5;
  height: 45rem;
  left: 88rem;
  box-shadow: 0 0 15px;
  p {
    padding: 40px 0px 17px 0px;
    font-size: 15px;
    font-weight: 500;
  }
`;

const StyledSearchWrapper = styled.div`
  position: absolute;
  z-index: 5;
  top: 4rem;
  left: 4rem;
  input {
    padding: 7px 20px 7px 20px;
    border-radius: 20px;
    border: 1px solid;
    font-size: 1rem;
  }
`;

const Frame = styled.div`
  position: absolute;
  z-index: 5;
  background: rgba(179, 179, 179, 50%);
  width: 23rem;
  height: 45rem;
  box-shadow: 0 0 15px;
`;

interface CoordinatesState {
  lat: number | null;
  lng: number | null;
}

interface AirVisualPollution {
  data?: {
    city: string;
    current?: { pollution: { aqius: string; ts: string } };
  };
}

interface OpenStreetMapResponseObject {
  geojson: {
    type: string;
    coordinates: Array<Array<[number, number]>>;
  };
}

type OpenStreetMapResponse = OpenStreetMapResponseObject[];

export default function Search() {
  const [address, setAddress] = React.useState("");
  const [highlight, setHighlight] = React.useState<OpenStreetMapResponse>([]);
  const [
    pollutionData,
    setPollutionData,
  ] = React.useState<AirVisualPollution | null>(null);
  const [coordinates, setCoordinates] = React.useState<CoordinatesState>({
    lat: null,
    lng: null,
  });

  const formatedData = pollutionData?.data?.current?.pollution?.ts
    ? new Date(
        pollutionData?.data?.current?.pollution?.ts
      ).toLocaleString("en-GB", { timeZone: "UTC" })
    : "";

  const handleSelect = async (value: any) => {
    const results = await geocodeByAddress(value);
    const latLng = await getLatLng(results[0]);
    setAddress(value);
    setCoordinates(latLng);
  };

  const region = () => {
    const polygon = highlight.find(
      (element) => element.geojson.type === "Polygon"
    );
    if (!polygon) return null;
    const coordArr = polygon.geojson.coordinates[0].map((data) => ({
      lat: data[1],
      lng: data[0],
    }));

    return (
      <Polygon
        path={coordArr}
        options={{
          strokeColor: "#fc1e0d",
          strokeOpacity: 1,
          strokeWeight: 2,
        }}
      />
    );
  };

  useEffect(() => {
    const fetchPolygonData = async () => {
      try {
        if (coordinates.lat === null || coordinates.lng === null || !address) {
          return;
        }

        const result = await fetch(
          `https://nominatim.openstreetmap.org/search.php?q=${address}&polygon_geojson=1&format=json`
        );
        const response = await result.json();

        setHighlight(response);
      } catch (e) {
        console.error(e);
      }
    };
    fetchPolygonData();
  }, [coordinates]);

  useEffect(() => {
    const fetchAirVisual = async () => {
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
            redirect: "follow",
          }
        );

        const response = await result.json();
        setPollutionData(response);
      } catch (e) {
        console.error(e);
      }
    };

    fetchAirVisual();
  }, [coordinates]);

  const Map = withGoogleMap((props) => (
    <GoogleMap
      options={{
        gestureHandling: "greedy",
        mapTypeId: "hybrid",
        streetViewControl: false,
        clickableIcons: false,
        minZoom: 2.8,
        fullscreenControl: false,
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        rotateControl: false,
        restriction: {
          latLngBounds: {
            north: 85,
            south: -85,
            west: -180,
            east: 180,
          },
        },
      }}
      defaultZoom={2.8}
      defaultCenter={{ lat: 43.71, lng: 7.26 }}
      center={{
        lat: coordinates.lat || 43.71,
        lng: coordinates.lng || 7.26,
      }}
      zoom={coordinates.lat && coordinates.lng ? 10 : 2.6}
    >
      {highlight.length > 1 && region()}
      {coordinates.lat && coordinates.lng && (
        <Marker position={{ lat: coordinates.lat, lng: coordinates.lng }} />
      )}
    </GoogleMap>
  ));

  return (
    <div>
      <Frame></Frame>
      <PlacesAutocomplete
        searchOptions={{ types: ["(cities)"] }}
        value={address}
        onChange={setAddress}
        onSelect={handleSelect}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <StyledSearchWrapper>
            <input {...getInputProps({ placeholder: "Type address" })} />

            <div>
              {loading ? <div>...loading</div> : null}

              {suggestions.map((suggestion) => {
                const style = {
                  backgroundColor: suggestion.active ? "#41b6e6" : "#fff",
                };

                return (
                  <div {...getSuggestionItemProps(suggestion, { style })}>
                    {suggestion.description}
                  </div>
                );
              })}
            </div>
          </StyledSearchWrapper>
        )}
      </PlacesAutocomplete>
      <Index aqius={pollutionData?.data?.current?.pollution?.aqius}>
        <p>City: {pollutionData?.data?.city}</p>
        <p>
          US AQI:{" "}
          {pollutionData && pollutionData.data?.current?.pollution?.aqius}
        </p>
        <p>Time: {formatedData}</p>
      </Index>
      <Conditions>
        <p title="Good">Good(0 to 50)</p>
        <p title="Moderate">Moderate(51 to 100)</p>
        <p title="Unhealthy for Sensitive Groups">
          Unhealthy for Sensitive Groups(101 to 150)
        </p>
        <p title="Unhealthy">Unhealthy(151 to 200)</p>
        <p title="Very Unhealthy">Very Unhealthy(201 to 300)</p>
        <p title="Hazardous">Hazardous(301 and higher)</p>
      </Conditions>
      <Map containerElement={<MapWrapper />} mapElement={<MapWrapper />}></Map>
    </div>
  );
}
