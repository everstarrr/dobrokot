import { MapSection } from "./ui/MapSection";

export function MapPage() {
  return (
    <main className="flex flex-col gap-5 bg-background rounded-t-3xl p-1 sm:p-10 sm:mx-auto sm:max-w-[calc(100%-16px)]">
      <MapSection />
    </main>
  );
}

export default MapPage;
