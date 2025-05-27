
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Default Leaflet icon setup to prevent issues with image paths in Vite/React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface StaticChallengeMapProps {
  center: LatLngTuple;
  locationName?: string;
  zoom?: number;
  className?: string; 
}

const StaticChallengeMap: React.FC<StaticChallengeMapProps> = ({ 
  center, 
  locationName, 
  zoom = 13,
  className = "h-32 w-full rounded-md" // Default height and styling
}) => {
  if (!center || center.length !== 2 || typeof center[0] !== 'number' || typeof center[1] !== 'number') {
    console.error("StaticChallengeMap: Invalid center coordinates provided.", center);
    return <div className={`flex items-center justify-center bg-gray-200 ${className}`}>Invalid map coordinates.</div>;
  }

  return (
    <MapContainer 
      center={center} 
      zoom={zoom} 
      style={{ height: '100%', width: '100%' }} // Fill the container
      scrollWheelZoom={false} 
      dragging={false} 
      zoomControl={false} 
      doubleClickZoom={false}
      attributionControl={false}
      className="rounded-md" // Ensure map container itself is rounded
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={center}>
        {locationName && <Popup>{locationName}</Popup>}
      </Marker>
    </MapContainer>
  );
};

export default StaticChallengeMap;
