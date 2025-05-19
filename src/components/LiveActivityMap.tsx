
import React, { useEffect, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

interface LiveActivityMapProps {
  accessToken: string;
}

const LiveActivityMap: React.FC<LiveActivityMapProps> = ({ accessToken }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const marker = useRef<any>(null);
  const [lng, setLng] = useState(-73.985130); // Default: Times Square
  const [lat, setLat] = useState(40.758896);  // Default: Times Square
  const [zoom, setZoom] = useState(14);
  const [mapStyleLoaded, setMapStyleLoaded] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Dynamically import mapbox-gl to avoid SSR issues
  useEffect(() => {
    const loadMapbox = async () => {
      try {
        const mapboxgl = await import('mapbox-gl');
        mapboxgl.default.accessToken = accessToken;
        
        if (mapContainer.current && !map.current) {
          const mapInstance = new mapboxgl.default.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: [lng, lat],
            zoom: zoom,
          });
          
          map.current = mapInstance;
          
          mapInstance.on('load', () => {
            setMapStyleLoaded(true);
            mapInstance.resize();
            mapInstance.addControl(new mapboxgl.default.NavigationControl(), 'top-right');
            setMapLoaded(true);
          });
          
          // Create location tracking function
          const trackLocation = () => {
            if (navigator.geolocation) {
              navigator.geolocation.watchPosition(
                (position) => {
                  const newLng = position.coords.longitude;
                  const newLat = position.coords.latitude;
                  
                  setLng(newLng);
                  setLat(newLat);
                  
                  if (mapInstance) {
                    mapInstance.flyTo({
                      center: [newLng, newLat],
                      essential: true,
                      speed: 0.5
                    });
                    
                    if (marker.current) {
                      marker.current.setLngLat([newLng, newLat]);
                    } else {
                      // Create a custom marker element
                      const el = document.createElement('div');
                      el.className = 'custom-marker';
                      el.innerHTML = `<div class="pulse-dot"></div>`;
                      
                      marker.current = new mapboxgl.default.Marker(el)
                        .setLngLat([newLng, newLat])
                        .addTo(mapInstance);
                    }
                  }
                },
                (error) => {
                  console.warn("Error getting geolocation: ", error.message);
                  // Fallback to default marker if geolocation fails or is denied
                  if (mapInstance && !marker.current && mapStyleLoaded) {
                    const el = document.createElement('div');
                    el.className = 'custom-marker';
                    el.innerHTML = `<div class="pulse-dot"></div>`;
                    
                    marker.current = new mapboxgl.default.Marker(el)
                      .setLngLat([lng, lat])
                      .addTo(mapInstance);
                  }
                },
                {
                  enableHighAccuracy: true,
                  timeout: 5000,
                  maximumAge: 0
                }
              );
            } else {
              console.warn("Geolocation is not supported by this browser.");
              // Fallback to default marker if geolocation is not supported
              if (mapInstance && !marker.current && mapStyleLoaded) {
                const el = document.createElement('div');
                el.className = 'custom-marker';
                el.innerHTML = `<div class="pulse-dot"></div>`;
                
                marker.current = new mapboxgl.default.Marker(el)
                  .setLngLat([lng, lat])
                  .addTo(mapInstance);
              }
            }
          };
          
          // Start tracking location once the map is loaded
          mapInstance.on('load', trackLocation);
        }
      } catch (error) {
        console.error('Error loading Mapbox:', error);
      }
    };
    
    loadMapbox();
    
    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        marker.current = null;
      }
    };
  }, [accessToken, lng, lat, zoom]);

  // Add style for custom marker and pulse effect
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      .custom-marker {
        width: 20px;
        height: 20px;
        position: relative;
      }
      .pulse-dot {
        background: var(--color-eco-accent, #00F5D4);
        border-radius: 50%;
        height: 14px;
        width: 14px;
        position: absolute;
        top: 3px;
        left: 3px;
        box-shadow: 0 0 0 rgba(0, 245, 212, 0.4);
        animation: pulse 2s infinite;
      }
      
      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(0, 245, 212, 0.4);
        }
        70% {
          box-shadow: 0 0 0 10px rgba(0, 245, 212, 0);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(0, 245, 212, 0);
        }
      }
    `;
    document.head.appendChild(styleSheet);
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <div className="relative h-64 w-full rounded-md">
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-eco-dark-secondary rounded-md">
          <div className="text-eco-accent animate-pulse">Loading map...</div>
        </div>
      )}
      <div ref={mapContainer} className="h-full w-full rounded-md" />
    </div>
  );
};

export default LiveActivityMap;
