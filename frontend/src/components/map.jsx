import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import axios from 'axios';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 38.423733,
  lng: 27.142826
};
const infoWindowStyle = {
  width: '22vw',
  textAlign: 'center'
};
const infoWindowelmnt = {
  fontSize: '1.2rem',
  marginBottom: '0.7rem',
  
}
const linkstyle = {
  fontSize: '1.1rem',
  fontWeight: 'bol',
  textDecoration: 'none',
  color: 'blueviolet',
  border: 'none',
  backgroundColor: 'white',
  marginTop: '0.5rem',

}
const availableIcon = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'; 
const unavailableIcon = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';

function Map() {
  const [locations, setLocations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [directions, setDirections] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/parkingspots/')
      .then(res => {
        setLocations(res.data);
      })
      .catch(err => {
        console.log(err);
      });
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            console.error("Error getting user's location: ", error);
          }
        );
      }
  }, []); 


  const handleDirections = (destination) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const origin = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        const DirectionsServiceInstance = new window.google.maps.DirectionsService();
        DirectionsServiceInstance.route(
          {
            origin,
            destination: { lat: destination.lat, lng: destination.lng },
            travelMode: window.google.maps.TravelMode.DRIVING
          },
          (result, status) => {
            if (status === window.google.maps.DirectionsStatus.OK) {
              setDirections(result);
            } else {
              console.error(`error fetching directions ${result}`);
            }
          }
        );
      });
    }
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyBE-mDsBoegqcG9BfFw207nJm8Owhf_2W8">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={11}
      >
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={{ lat: location.lat, lng: location.lng }}
            onClick={() => setSelected(location)}
            icon={location.capacity > 0 ? availableIcon : unavailableIcon}
          />
        ))}

        {userLocation && (
          <Marker
            position={userLocation}
            icon='http://maps.google.com/mapfiles/ms/icons/blue-dot.png' 
            label={{
              text: "ME",
              fontSize: "1.2rem",
              color: "Black",
              fontWeight: "bold",
            }}
          />
        )}

        {selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => setSelected(null)}
          >
            <div style={infoWindowStyle}>
              <h2 style={infoWindowelmnt}>{selected.name}</h2>
              <h4 style={infoWindowelmnt}>Capacity:{selected.capacity}</h4>
              <h3 style={infoWindowelmnt}>Hourly rate: {selected.hourlyrate}</h3>
              <a style={linkstyle} href={`http://localhost:5173/parkspot/${selected.id}`}>Detail page</a> <br />
              <button style={linkstyle} onClick={() => handleDirections(selected)}>Get Directions</button>
            </div>
          </InfoWindow>
        )}

        {directions && (
          <DirectionsRenderer
            directions={directions}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
}

export default Map;