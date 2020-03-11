import React, { useEffect } from "react";
import PlacesAutocomplete, {
  geocodeByAddress,
  getLatLng
} from "react-places-autocomplete";

interface CoordinatesState {
  lat: number | null;
  lng: number | null;
}

export default function Search() {
  const [address, setAddress] = React.useState("");
  const [pollutionData, setPollutionData] = React.useState(null);
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
          </div>
        )}
      </PlacesAutocomplete>
    </div>
  );
}
