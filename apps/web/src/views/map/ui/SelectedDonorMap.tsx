"use client";

import type { Donor } from "@dobrokot/shared";
import L from "leaflet";
import { Droplet } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { cn } from "@/app/shared/lib/utils";

interface SelectedDonorMapProps {
  donor: Donor;
  latitude: number;
  longitude: number;
  resolvedAddress: string;
  className?: string;
}

function createDonorIcon(imageUrl: string) {
  return L.icon({
    iconUrl: imageUrl,
    iconRetinaUrl: imageUrl,
    iconSize: [56, 56],
    iconAnchor: [28, 56],
    popupAnchor: [0, -48],
    className: "donor-marker-icon",
  });
}

export function SelectedDonorMap({
  donor,
  latitude,
  longitude,
  resolvedAddress,
  className,
}: SelectedDonorMapProps) {
  const position: [number, number] = [latitude, longitude];

  return (
    <div className={cn("h-76 sm:h-189 w-full", className)}>
      <MapContainer
        key={`${donor.id}-${latitude}-${longitude}`}
        center={position}
        zoom={14}
        scrollWheelZoom
        className="w-full! h-full! relative!"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} icon={createDonorIcon(donor.imageUrl)}>
          <Popup>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-foreground">{donor.title}</p>
                <p className="text-xs text-foreground/70">{resolvedAddress}</p>
              </div>
              <div className="flex gap-2.5">
                <div className="flex gap-1">
                  <div className="flex size-5 items-center justify-center rounded-full bg-accent-orange text-white">
                    <Droplet size={9} />
                  </div>
                  <p className="text-sm text-foreground/70">
                    {donor.bloodDonations}
                  </p>
                </div>
                <div className="flex gap-1">
                  <div className="flex size-5 items-center justify-center rounded-full bg-accent-sky text-foreground">
                    <Droplet size={9} />
                  </div>
                  <p className="text-sm text-foreground/70">
                    {donor.plasmaDonations}
                  </p>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
        <div className="h-3 w-5 absolute bg-white bottom-1.25 right-51 z-9000"></div>
      </MapContainer>
    </div>
  );
}
