import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui";
import { getArticleById } from "./articles";

type Props = {
  id: string;
};

export function BlogArticlePage({ id }: Props) {
  const article = getArticleById(id);
  if (!article) {
    notFound();
  }

  return (
    <main className="flex flex-col gap-5 rounded-t-3xl sm:mx-auto sm:max-w-[calc(100%-16px)]">
      <section className="relative overflow-hidden rounded-3xl bg-accent-orange text-white px-5 py-8 sm:px-15 sm:py-15">
        <Link href="/blog">
          <Button variant="outlineWhite" className="h-10 px-4 text-sm">
            <ArrowLeft size={16} />
            Назад
          </Button>
        </Link>

        <h1 className="mt-8 sm:mt-12 max-w-2xl text-3xl sm:text-5xl font-semibold leading-tight">
          {article.title}
        </h1>

        <Image
          src="/logo_white.svg"
          alt=""
          width={260}
          height={150}
          className="pointer-events-none select-none absolute right-6 top-6 hidden sm:block opacity-90"
          priority
        />
      </section>

      <article className="rounded-t-3xl bg-background px-5 py-8 sm:px-15 sm:py-12 flex flex-col gap-6 text-base sm:text-lg leading-relaxed text-foreground">
        {article.content.map((block, index) => {
          if (block.kind === "heading") {
            return (
              <h2
                key={index}
                className="text-xl sm:text-2xl font-semibold text-foreground"
              >
                {block.text}
              </h2>
            );
          }
          if (block.kind === "list") {
            return (
              <ol
                key={index}
                className="flex flex-col gap-2.5 list-decimal pl-5 marker:text-accent-orange marker:font-semibold"
              >
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="pl-1">
                    {item}
                  </li>
                ))}
              </ol>
            );
          }
          return (
            <p key={index} className="text-foreground/80">
              {block.text}
            </p>
          );
        })}
      </article>
    </main>
  );
}
