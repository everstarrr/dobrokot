import type { Donor } from "@dobrokot/shared";
import { Droplet } from "lucide-react";
import { Badge } from "@/shared/ui";
import { cn } from "@/app/shared/lib/utils";

interface DonorCardProps {
  donor: Donor;
  isActive: boolean;
  onSelect: (donorId: string) => void;
}

export function DonorCard({ donor, isActive, onSelect }: DonorCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(donor.id)}
      aria-pressed={isActive}
      className={cn(
        "flex w-full gap-4 rounded-[20px] bg-white p-4 text-left transition-all"
      )}
    >
      <img
        src={donor.imageUrl}
        alt={donor.title}
        className="size-12.5 shrink-0 rounded-full object-cover"
      />
      <div className="min-w-0 flex-1 flex flex-col gap-1">
        <p>{donor.title}</p>
        <p className="text-sm text-foreground/70">{donor.address}</p>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Badge size="sm">
              <Droplet />
              <span className="text-white/70">Цельная кровь</span>
            </Badge>
            <span className="text-sm text-foreground/70">
              {donor.bloodDonations}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="sky" size="sm">
              <Droplet />
              <span className="text-foreground/70">Плазма</span>
            </Badge>
            <span className="text-sm text-foreground/70">
              {donor.plasmaDonations}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
