import { cn } from "@/app/shared/lib/utils";
import { Button } from "@/shared/ui";
import { ArrowUpRight, Droplet } from "lucide-react";

type ArticleSectionCardProps = {
  title: string;
  img: string;
};

export const ArticleSectionCard = ({ title, img }: ArticleSectionCardProps) => {
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl p-7.5 w-67 h-84 flex flex-col justify-between",
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: `url(${img})` }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-foreground/40"
      />
      <div className="relative z-10 flex gap-2.5">
        <Button size="iconLg" variant="outlineWhite">
          <Droplet />
        </Button>
        <Button size="iconLg" variant="outlineWhite">
          <ArrowUpRight />
        </Button>
      </div>
      <p className="relative z-10 text-2xl leading-7 font-medium text-secondary">
        {title}
      </p>
    </article>
  );
};
