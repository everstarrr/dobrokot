import Link from "next/link";
import { Badge } from "@/shared/ui";
import { ArticleCard } from "./ui/ArticleCard";
import { articles } from "./articles";

function BlogPage() {
  return (
    <main className="flex flex-col gap-5 sm:px-8 sm:gap-15 rounded-t-3xl bg-background pt-5 sm:max-w-[calc(100%-16px)] sm:mx-auto">
      <div className="flex flex-col items-center gap-2.5 text-center">
        <div className="flex flex-col items-center">
          <Badge>Блог</Badge>
          <h1 className="text-4xl font-semibold">Наши статьи</h1>
        </div>
        <p className="text-sm text-foreground/70">
          Узнайте больше в наших статьях о переливании крови и работе платформы
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 max-w-8xl mx-auto">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={`/blog/${article.id}`}
            className="block transition-transform hover:scale-[1.01]"
          >
            <ArticleCard
              type={article.tag}
              img={article.img}
              title={article.title}
              description={article.description}
            />
          </Link>
        ))}
      </div>
    </main>
  );
}

export default BlogPage;
