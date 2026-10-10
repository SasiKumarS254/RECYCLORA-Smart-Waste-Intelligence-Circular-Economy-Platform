import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapMarker {
  id: string | number;
  lat: number;
  lng: number;
  title: string;
  category?: string;
  status?: string;
  popupText?: string;
}

interface LeafletMapProps {
  markers?: MapMarker[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onLocationSelect?: (lat: number, lng: number) => void;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  markers = [],
  center = [28.6139, 77.2090], // Default New Delhi center
  zoom = 12,
  height = "350px",
  onLocationSelect
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!leafletInstance.current) {
      const map = L.map(mapRef.current).setView(center, zoom);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      if (onLocationSelect) {
        map.on('click', (e: L.LeafletMouseEvent) => {
          onLocationSelect(e.latlng.lat, e.latlng.lng);
        });
      }

      leafletInstance.current = map;
    } else {
      leafletInstance.current.setView(center, zoom);
    }

    // Clear existing markers
    leafletInstance.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        leafletInstance.current?.removeLayer(layer);
      }
    });

    // Add markers
    markers.forEach(m => {
      if (!m.lat || !m.lng) return;
      const marker = L.marker([m.lat, m.lng]).addTo(leafletInstance.current!);
      marker.bindPopup(`
        <div class="p-1 font-sans text-xs">
          <strong class="text-sm block font-bold text-slate-800">${m.title}</strong>
          ${m.category ? `<span class="inline-block bg-emerald-100 text-emerald-800 rounded px-1.5 py-0.5 mt-1 font-medium">${m.category}</span>` : ''}
          ${m.status ? `<div class="text-slate-600 mt-1">Status: <b>${m.status}</b></div>` : ''}
          ${m.popupText ? `<div class="text-slate-500 mt-1">${m.popupText}</div>` : ''}
        </div>
      `);
    });

  }, [markers, center, zoom, onLocationSelect]);

  return (
    <div 
      ref={mapRef} 
      style={{ height }} 
      className="w-full rounded-xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-700 z-10"
    />
  );
};
