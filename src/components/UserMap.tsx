
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { LatLngTuple } from 'leaflet'; // Imported LatLngTuple
import 'leaflet/dist/leaflet.css';

// Custom walking icon
const walkingIcon = new L.Icon({
  iconUrl: '/icons/walking.png', // Adjust path if needed
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Example user data
interface UserMapData {
  id: number;
  name: string;
  position: LatLngTuple; // Explicitly typed as LatLngTuple
}

const users: UserMapData[] = [
  { id: 1, name: 'Alice', position: [51.505, -0.09] },
  { id: 2, name: 'Bob', position: [51.51, -0.1] },
  { id: 3, name: 'Charlie', position: [51.49, -0.08] },
];

export default function UserMap() {
  return (
    <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {users.map(user => (
        <Marker key={user.id} position={user.position} icon={walkingIcon}>
          <Popup>{user.name} is walking/running here!</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
