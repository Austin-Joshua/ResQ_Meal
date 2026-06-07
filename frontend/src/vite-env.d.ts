/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace google.maps {
  class Map {
    constructor(el: HTMLElement, opts?: unknown);
    fitBounds(bounds: LatLngBounds): void;
  }
  class LatLng {
    constructor(lat: number, lng: number);
  }
  class LatLngBounds {
    extend(point: LatLng): void;
  }
  class Marker {
    constructor(opts?: unknown);
    setMap(map: Map | null): void;
  }
  class DirectionsService {
    route(request: unknown, callback: (result: unknown, status: string) => void): void;
  }
  class DirectionsRenderer {
    constructor(opts?: unknown);
    setMap(map: Map | null): void;
    setDirections(result: unknown): void;
  }
  enum TravelMode {
    DRIVING,
  }
  enum DirectionsStatus {
    OK,
  }
}

interface Window {
  google?: {
    maps: typeof google.maps;
  };
}
