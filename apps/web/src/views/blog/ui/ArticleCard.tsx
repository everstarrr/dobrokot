import { Badge } from "@/shared/ui";
import Image from "next/image";

type ArticleCardProps = {
  type: "novice";
  img: string;
  title: string;
  description: string;
};

export const ArticleCard = ({
  description,
  img,
  title,
  type,
}: ArticleCardProps) => {
  return (
    <article className="bg-white rounded-2xl p-5 flex flex-col gap-5">
      <div className="relative ">
        <Image src={img} alt={title} width={388} height={300} className="object-cover object-center w-full rounded-lg" />
        <Badge
          className="absolute top-3 left-3"
          variant={type === "novice" ? "biege" : "default"}
        >
          {type === "novice" && "Для новичков"}
        </Badge>
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-medium">{title}</p>
        <p className="text-foreground/70 text-sm line-clamp-2">{description}</p>
      </div>
    </article>
  );
};
