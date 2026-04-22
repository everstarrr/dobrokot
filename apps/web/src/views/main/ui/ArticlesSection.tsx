"use client";

import { Button, ScrollArea, ScrollBar } from "@/shared/ui";
import { ArrowDownRight, ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { ArticleSectionCard } from "./ArticleSectionCard";
import { ArticleSectionCardDesktop } from "./ArticleSectionCardDesktop";

const articles = [
  {
    title: "Почему с нами найти донора легче",
    img: "/article1.png",
    description:
      "Объясняем, как сервис помогает быстрее подобрать донора, сверить важные параметры и сократить время до первой полезной консультации.",
    color: "var(--foreground)",
  },
  {
    title: "Разбор кейсов с реальными историями",
    img: "/article2.png",
    description:
      "Собрали понятные истории хозяев и врачей: что сработало лучше всего, какие шаги были критичны и как избежать лишнего стресса для питомца.",
    color: "var(--accent-orange)",
  },
  {
    title: "Как работает наша платформа",
    img: "/article3.png",
    description:
      "Показываем, как ориентироваться в карте, на что смотреть при выборе клиники и как быстро перейти от поиска к записи на прием.",
    color: "var(--foreground)",
  },
];

export const ArticlesSection = () => {
  const [activeArticleIndex, setActiveArticleIndex] = useState(0);

  const activeArticle = articles[activeArticleIndex];
  const carouselArticles = useMemo(
    () =>
      articles
        .map((article, index) => ({ ...article, index }))
        .filter(({ index }) => index !== activeArticleIndex)
        .sort((left, right) => {
          const leftOffset =
            (left.index - activeArticleIndex + articles.length) % articles.length;
          const rightOffset =
            (right.index - activeArticleIndex + articles.length) % articles.length;

          return leftOffset - rightOffset;
        }),
    [activeArticleIndex],
  );

  return (
    <section className="flex w-full max-w-8xl mx-auto flex-col gap-5 overflow-x-auto rounded-3xl bg-white pt-5 pb-1 sm:rounded-[40px] sm:px-10 sm:py-12">
      <div className="flex justify-center sm:justify-between">
        <h2 className="text-center text-4xl font-semibold leading-12.5">
          Наши статьи
        </h2>
        <div className="hidden sm:flex">
          <Button variant="outline">Смотреть все</Button>
          <Button variant="outline" size="icon">
            <ArrowRight />
          </Button>
        </div>
      </div>

      <ScrollArea className="sm:hidden">
        <div className="flex gap-2.5 px-1">
          {articles.map((item) => (
            <ArticleSectionCard key={item.title} img={item.img} title={item.title} />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <div className="hidden gap-5 sm:flex">
        <div
          key={activeArticle.title}
          className="article-card-reveal translate-x-0 opacity-100 motion-reduce:transition-none"
        >
          <ArticleSectionCardDesktop
            color={activeArticle.color}
            description={activeArticle.description}
            img={activeArticle.img}
            title={activeArticle.title}
          />
        </div>

        <div className="flex min-w-0 flex-col justify-between">
          <div className="flex gap-5">
            {carouselArticles.map((item, position) => (
              <div
                key={item.title}
                role="button"
                tabIndex={0}
                onClick={() => setActiveArticleIndex(item.index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setActiveArticleIndex(item.index);
                  }
                }}
                className="group cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:ring-offset-4"
                aria-label={`Открыть статью: ${item.title}`}
              >
                <div
                  className="transition-all duration-500 ease-out motion-reduce:transition-none"
                  style={{
                    transform: `translateX(-${position * 10}px)`,
                  }}
                >
                  <div className="transition-transform duration-300 ease-out group-hover:-translate-x-2 group-hover:scale-[1.01] motion-reduce:transition-none">
                    <ArticleSectionCard img={item.img} title={item.title} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden px-1 sm:flex">
            <Button className="max-sm:flex-1">Найти донора</Button>
            <Button variant="outline" size="icon">
              <ArrowDownRight />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex px-1 sm:hidden">
        <Button className="max-sm:flex-1">Найти донора</Button>
        <Button variant="outline" size="icon">
          <ArrowDownRight />
        </Button>
      </div>
    </section>
  );
};
