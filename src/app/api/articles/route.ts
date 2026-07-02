import { NextResponse } from "next/server";
import { ArticleService } from "@/kaos/services/ArticleService";
import { ArticleRepository } from "@/kaos/repositories/ArticleRepository";
import { EventDispatcher } from "@/kaos/core/events";

const articleRepo = new ArticleRepository();
const eventDispatcher = new EventDispatcher();
const articleService = new ArticleService(articleRepo, eventDispatcher);

export async function GET() {
  try {
    const articles = await articleRepo.getAll();
    return NextResponse.json(articles, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, category, summary, content, imageUrl, sourceName, additionalImages, videoUrl, continent } = body;
    const article = await articleService.publishArticle(
      title,
      category,
      summary,
      content,
      imageUrl,
      sourceName,
      additionalImages,
      videoUrl,
      continent
    );
    return NextResponse.json(article, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
