import { Droplet } from "lucide-react";
import Image from "next/image";
import { PartnerRank } from "@dobrokot/shared";
import { Badge } from "@/shared/ui";

type ResultCardProps = {
  img: string;
  title: string;
  description: string;
  rank: PartnerRank;
  bloodCount: number;
  plasmaCount: number;
};

const rankLabel: Record<PartnerRank, string> = {
  [PartnerRank.LEGENDARY_DONOR]: "Легендарный донор",
  [PartnerRank.RELIABLE_ASSISTANT]: "Надежный помощник",
};

export const ResultCard = ({
  img,
  title,
  description,
  rank,
  bloodCount,
  plasmaCount,
}: ResultCardProps) => {
  const isLegendary = rank === PartnerRank.LEGENDARY_DONOR;

  return (
    <article className="rounded-2xl bg-white flex flex-col gap-5 p-5">
      <div className="relative flex flex-col items-center gap-3">
        <Badge variant={isLegendary ? "default" : "sky"}>{rankLabel[rank]}</Badge>
        <div className="flex h-32 w-full items-center justify-center">
          <Image
            src={img}
            alt={title}
            width={208}
            height={104}
            className="max-h-full w-auto object-contain h-26 w-68"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center gap-3">
          <p className="font-medium text-lg">{title}</p>
          <p className="text-sm text-foreground/70">{description}</p>
        </div>
        <div className="flex gap-2.5">
          <div className="flex items-center gap-1">
            <div className="rounded-full bg-accent-orange size-5 flex justify-center items-center text-white">
              <Droplet size={9} fill="currentColor" />
            </div>
            <p className="text-foreground/70 text-sm">{bloodCount}</p>
          </div>
          <div className="flex items-center gap-1">
            <div className="rounded-full bg-accent-sky size-5 flex justify-center items-center text-foreground">
              <Droplet size={9} fill="currentColor" />
            </div>
            <p className="text-foreground/70 text-sm">{plasmaCount}</p>
          </div>
        </div>
      </div>
    </article>
  );
};
