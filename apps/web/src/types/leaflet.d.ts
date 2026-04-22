declare module "leaflet" {
  export interface IconOptions {
    iconUrl: string;
    iconRetinaUrl?: string;
    iconSize?: [number, number];
    iconAnchor?: [number, number];
    popupAnchor?: [number, number];
    className?: string;
  }

  export interface Icon<T = unknown> {
    options?: T;
  }

  export function icon(options: IconOptions): Icon<IconOptions>;

  const L: {
    icon: typeof icon;
  };

  export default L;
}
