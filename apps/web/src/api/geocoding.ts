import axios from "axios";
import { useQuery } from "@tanstack/react-query";

interface NominatimSearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

export interface GeocodedAddress {
  latitude: number;
  longitude: number;
  label: string;
}

const geocodingClient = axios.create({
  baseURL: "https://nominatim.openstreetmap.org",
  headers: {
    "Accept-Language": "ru",
  },
});

export const geocodingQueryKey = (address: string) => ["geocoding", address] as const;

export async function geocodeAddress(address: string): Promise<GeocodedAddress | null> {
  const response = await geocodingClient.get<NominatimSearchResult[]>("/search", {
    params: {
      q: address,
      format: "jsonv2",
      limit: 1,
    },
  });

  const [result] = response.data;
  if (!result) {
    return null;
  }

  return {
    latitude: Number(result.lat),
    longitude: Number(result.lon),
    label: result.display_name,
  };
}

export function useGeocodingQuery(address?: string | null) {
  return useQuery({
    queryKey: geocodingQueryKey(address ?? ""),
    queryFn: () => geocodeAddress(address!),
    enabled: Boolean(address),
    staleTime: 1000 * 60 * 60,
  });
}
