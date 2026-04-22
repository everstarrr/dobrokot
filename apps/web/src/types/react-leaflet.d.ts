declare module "react-leaflet" {
  import * as React from "react";

  export interface MapContainerProps {
    center: [number, number];
    zoom: number;
    scrollWheelZoom?: boolean;
    className?: string;
    children?: React.ReactNode;
  }

  export interface TileLayerProps {
    attribution?: string;
    url: string;
  }

  export interface MarkerProps {
    position: [number, number];
    icon?: unknown;
    children?: React.ReactNode;
  }

  export interface PopupProps {
    children?: React.ReactNode;
  }

  export const MapContainer: React.ComponentType<MapContainerProps>;
  export const TileLayer: React.ComponentType<TileLayerProps>;
  export const Marker: React.ComponentType<MarkerProps>;
  export const Popup: React.ComponentType<PopupProps>;
}
