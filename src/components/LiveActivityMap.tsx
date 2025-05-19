
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl, { Map as MapboxMap, Marker } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin } from '@/components/icons'; // For marker icon

interface LiveActivityMapProps {
  accessToken: string;
}

const LiveActivityMap: React.FC<LiveActivityMapProps> = ({ accessToken }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxMap | null>(null);
  const marker = useRef<Marker | null>(null);
  const [lng, setLng] = useState(-73.985130); // Default: Times Square
  const [lat, setLat] = useState(40.758896);  // Default: Times Square
  const [zoom, setZoom] = useState(14);
  const [mapStyleLoaded, setMapStyleLoaded] = useState(false);

  mapboxgl.accessToken = accessToken;

  useEffect(() => {
    if (map.current || !mapContainer.current) return; // Initialize map only once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12', // or use a sporty style like 'mapbox://styles/mapbox/outdoors-v12'
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.on('load', () => {
      setMapStyleLoaded(true);
      map.current?.resize(); // Ensure map resizes correctly after container is ready
       // Add navigation controls (zoom, rotate)
      map.current?.addControl(new mapboxgl.NavigationControl(), 'top-right');
    });
    
    // Attempt to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          const newLng = position.coords.longitude;
          const newLat = position.coords.latitude;
          setLng(newLng);
          setLat(newLat);
          if (map.current) {
            map.current.setCenter([newLng, newLat]);
            if (marker.current) {
              marker.current.setLngLat([newLng, newLat]);
            } else {
               // Create a custom marker element
              const el = document.createElement('div');
              el.className = 'custom-marker';
              const iconEl = document.createElement('span');
              iconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-eco-accent, #00F5D4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
              el.appendChild(iconEl);

              marker.current = new mapboxgl.Marker(el)
                .setLngLat([newLng, newLat])
                .addTo(map.current);
            }
          }
        },
        (error) => {
          console.warn("Error getting geolocation: ", error.message);
          // Fallback to default marker if geolocation fails or is denied
          if (map.current && !marker.current && mapStyleLoaded) {
             const el = document.createElement('div');
              el.className = 'custom-marker';
              const iconEl = document.createElement('span');
              iconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-eco-accent, #00F5D4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
              el.appendChild(iconEl);
            marker.current = new mapboxgl.Marker(el)
              .setLngLat([lng, lat]) // Use default lng/lat
              .addTo(map.current);
          }
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      console.warn("Geolocation is not supported by this browser.");
       // Fallback to default marker if geolocation is not supported
      if (map.current && !marker.current && mapStyleLoaded) {
         const el = document.createElement('div');
          el.className = 'custom-marker';
          const iconEl = document.createElement('span');
          iconEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-eco-accent, #00F5D4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`;
          el.appendChild(iconEl);
        marker.current = new mapboxgl.Marker(el)
          .setLngLat([lng, lat]) // Use default lng/lat
          .addTo(map.current);
      }
    }
    
    // Cleanup on unmount
    return () => {
      map.current?.remove();
      map.current = null;
      marker.current = null;
    };
  }, [accessToken, mapStyleLoaded]); // Rerun effect if accessToken changes or map style loaded

  // Add style for custom marker if needed
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `.custom-marker svg { filter: drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.5)); }`;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);


  return <div ref={mapContainer} className="h-64 w-full rounded-md" />;
};

export default LiveActivityMap;
