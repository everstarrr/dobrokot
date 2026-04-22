import { Droplet } from "lucide-react";
import Image from "next/image";

type ResultCardProps = {
  img: string;
  title: string;
  description: string;
  bloodCount: number;
  plasmaCount: number;
};

export const ResultCard = ({
  img,
  title,
  description,
  bloodCount,
  plasmaCount,
}: ResultCardProps) => {
  return (
    <article className="rounded-2xl bg-white flex flex-col gap-5 p-5">
      <div className="relative w-full py-5">
        <Image src={img} alt={title} width={208} height={104} />
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center">
          <p className="font-medium">{title}</p>
          <p className="text-sm text-foreground/70">{description}</p>
        </div>
        <div className="flex gap-2.5">
          <div className="flex gap-1">
            <div className="rounded-full bg-accent-orange size-5 flex justify-center items-center text-white">
              <Droplet size={9} />
            </div>
            <p className="text-foreground/70 text-sm">{bloodCount}</p>
          </div>
          <div className="flex gap-1">
            <div className="rounded-full bg-accent-sky size-5 flex justify-center items-center text-foreground">
              <Droplet size={9} />
            </div>
            <p className="text-foreground/70 text-sm">{plasmaCount}</p>
          </div>
        </div>
      </div>
    </article>
  );
};
