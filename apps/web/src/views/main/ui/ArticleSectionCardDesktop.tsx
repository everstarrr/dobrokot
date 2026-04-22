import { cn } from "@/app/shared/lib/utils";
import { Button } from "@/shared/ui";
import { ArrowUpRight, Droplet } from "lucide-react";
import Image from "next/image";

type ArticleSectionCardProps = {
  title: string;
  img: string;
  color: string;
  description: string;
};

export const ArticleSectionCardDesktop = ({
  title,
  img,
  color,
  description,
}: ArticleSectionCardProps) => {
  return (
    <article
      className="rounded-2xl p-7.5 flex gap-10 w-196 h-112.5"
      style={{ background: color }}
    >
      <Image src={img} alt="" width={370} height={390} className="rounded-xl" />
      <div className="flex flex-col justify-between">
        <div className="relative z-10 flex gap-2.5">
          <Button size="iconLg" variant="outlineWhite">
            <Droplet />
          </Button>
          <Button size="iconLg" variant="outlineWhite">
            <ArrowUpRight />
          </Button>
        </div>
        <div className="flex flex-col gap-5">
          <p className="text-secondary font-semibold text-[32px] leading-9.5">
            {title}
          </p>
          <p className="text-secondary/60 font-medium text-2xl leading-7">
            {description}
          </p>
        </div>
      </div>
    </article>
  );
};
