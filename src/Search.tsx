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
`;
const Conditions = styled.div`
  background: linear-gradient(
    to right,
    green,
    yellow,
    orange,
    red,
    purple,
    maroon
  );
  p {
    display: inline;
    padding: 0 120px;
  }
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
      zoom={coordinates.lat && coordinates.lng ? 11 : 2.8}
    >
      {highlight.length > 1 && region()}
      {coordinates.lat && coordinates.lng && (
        <Marker position={{ lat: coordinates.lat, lng: coordinates.lng }} />
      )}
    </GoogleMap>
  ));

  return (
    <div>
      <PlacesAutocomplete
        searchOptions={{ types: ["(cities)"] }}
        value={address}
        onChange={setAddress}
        onSelect={handleSelect}
      >
        {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
          <div>
            <p>Latitude: {coordinates.lat}</p>
            <p>Longitude: {coordinates.lng}</p>
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
          </div>
        )}
      </PlacesAutocomplete>
      <Index aqius={pollutionData?.data?.current?.pollution?.aqius}>
        <p>City: {pollutionData?.data?.city}</p>
        <p>
          AQI quality:{" "}
          {pollutionData && pollutionData.data?.current?.pollution?.aqius}
        </p>
        <p>Time: {formatedData}</p>
      </Index>
      <Conditions>
        <p title="Good"></p>
        <p title="Moderate"></p>
        <p title="Unhealthy for Sensitive Groups"></p>
        <p title="Unhealthy"></p>
        <p title="Very Unhealthy"></p>
        <p title="Hazardous"></p>
      </Conditions>
      <Map containerElement={<MapWrapper />} mapElement={<MapWrapper />}></Map>
    </div>
  );
}
