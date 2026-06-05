import { BlogArticlePage } from "@/views/blog/BlogArticlePage";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BlogArticlePage id={id} />;
}
