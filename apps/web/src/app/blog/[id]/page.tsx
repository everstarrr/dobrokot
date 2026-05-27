import Link from "next/link";
import { Badge, Button } from "@/shared/ui";

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="flex flex-col gap-6 pb-10 sm:pb-15 rounded-t-3xl bg-background pt-5 sm:pt-12 sm:mx-auto sm:max-w-[calc(100%-16px)] px-1 sm:px-10">
      <div className="flex items-center flex-col gap-2.5 text-center">
        <Badge>Статья</Badge>
        <h1 className="text-3xl sm:text-5xl font-semibold">Статья #{id}</h1>
        <p className="text-foreground/70 text-sm max-w-md">
          Полный текст статьи скоро появится здесь.
        </p>
      </div>
      <div className="self-center">
        <Link href="/blog">
          <Button variant="outline">Назад к блогу</Button>
        </Link>
      </div>
    </main>
  );
}
