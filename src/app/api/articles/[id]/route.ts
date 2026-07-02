import { NextResponse } from "next/server";
import { ArticleService } from "@/kaos/services/ArticleService";
import { ArticleRepository } from "@/kaos/repositories/ArticleRepository";
import { EventDispatcher } from "@/kaos/core/events";

const articleRepo = new ArticleRepository();
const eventDispatcher = new EventDispatcher();
const articleService = new ArticleService(articleRepo, eventDispatcher);

export async function GET(request: Request, context: any) {
  try {
    const { id } = await context.params;
    const article = await articleService.getArticleDetails(id);
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }
    return NextResponse.json(article, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function PUT(request: Request, context: any) {
  try {
    const { id } = await context.params;
    const article = await articleService.incrementViews(id);
    return NextResponse.json(article, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
