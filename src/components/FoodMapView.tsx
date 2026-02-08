import React, { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { AvailableFoodItem } from '@/components/AvailableFoodCarousel';

// Fix default marker icons in react-leaflet (webpack/vite)
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const DEFAULT_CENTER: [number, number] = [13.0827, 80.2707]; // Chennai
const DEFAULT_ZOOM = 11;

function getItemCoords(item: AvailableFoodItem): [number, number] | null {
  const lat = item.location?.latitude;
  const lng = item.location?.longitude;
  if (typeof lat === 'number' && typeof lng === 'number' && !Number.isNaN(lat) && !Number.isNaN(lng)) {
    return [lat, lng];
  }
  return null;
}

function MapBounds({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 0) {
      try {
        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds, { padding: [24, 24], maxZoom: 14 });
      } catch {}
    }
  }, [map, coords]);
  return null;
}

interface FoodMapViewProps {
  items: AvailableFoodItem[];
  darkMode?: boolean;
  onSelectItem?: (item: AvailableFoodItem) => void;
  className?: string;
}

export function FoodMapView({ items, darkMode, onSelectItem, className = '' }: FoodMapViewProps) {
  const markers = useMemo(() => {
    return items
      .map((item) => ({ item, coords: getItemCoords(item) }))
      .filter((m): m is { item: AvailableFoodItem; coords: [number, number] } => m.coords !== null);
  }, [items]);

  const coordsList = useMemo(() => markers.map((m) => m.coords), [markers]);
  const center = useMemo(() => {
    if (markers.length === 0) return DEFAULT_CENTER;
    const sum = markers.reduce(
      (acc, m) => [acc[0] + m.coords[0], acc[1] + m.coords[1]],
      [0, 0]
    );
    return [sum[0] / markers.length, sum[1] / markers.length] as [number, number];
  }, [markers]);

  if (typeof window === 'undefined') return null;

  return (
    <div className={`rounded-xl overflow-hidden border border-blue-200 ${className}`} style={{ minHeight: 320 }}>
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        className="h-[320px] w-full"
        scrollWheelZoom
        style={{ background: darkMode ? '#1e293b' : '#e2e8f0' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {coordsList.length > 0 && <MapBounds coords={coordsList} />}
        {markers.map(({ item, coords }) => (
          <Marker key={item.id} position={coords} icon={defaultIcon}>
            <Popup>
              <div className="text-left min-w-[180px]">
                <p className="font-semibold text-slate-900">{item.food_name}</p>
                <p className="text-sm text-slate-600">{item.quantity_servings} servings · {item.food_type}</p>
                {item.location?.address && (
                  <p className="text-xs text-slate-500 mt-1">{item.location.address}</p>
                )}
                {onSelectItem && (
                  <button
                    type="button"
                    className="mt-2 text-sm text-emerald-600 hover:underline"
                    onClick={() => onSelectItem(item)}
                  >
                    View details
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
