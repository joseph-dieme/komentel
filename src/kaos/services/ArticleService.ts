// Article Service - Business logic orchestration for Articles
import { IArticleRepository } from "../repositories/ArticleRepository";
import { IEventDispatcher } from "../core/events";
import { Article } from "../core/types";

export class ArticleService {
  constructor(
    private articleRepo: IArticleRepository,
    private eventDispatcher: IEventDispatcher
  ) {}

  async publishArticle(
    title: string,
    category: string,
    summary: string,
    content: string[],
    imageUrl?: string,
    sourceName?: string,
    additionalImages?: string[],
    videoUrl?: string,
    continent?: string
  ): Promise<Article> {
    // 1. Enforce business validations
    if (!title.trim() || !category.trim() || !summary.trim() || content.length === 0) {
      throw new Error("Missing required fields for publishing article");
    }

    // 2. Persist to repository
    const article = await this.articleRepo.create({
      title,
      category,
      sourceName: sourceName || "Komentel",
      sourceVerified: true,
      readTime: "3 min",
      summary,
      content,
      imageUrl: imageUrl || "/images/placeholder.jpg",
      additionalImages: additionalImages || [],
      videoUrl,
      commentsDisabled: false,
      corrections: [],
      continent: continent || "Monde"
    });

    // 3. Dispatch ArticlePublished domain event
    await this.eventDispatcher.dispatch("ArticlePublished", {
      articleId: article.id,
      title: article.title,
      category: article.category,
      publishedAt: article.publishedAt
    });

    return article;
  }

  async getArticleDetails(id: string): Promise<Article | null> {
    return this.articleRepo.getById(id);
  }

  async incrementViews(id: string): Promise<Article> {
    const article = await this.articleRepo.getById(id);
    if (!article) throw new Error("Article not found");
    return this.articleRepo.update(id, { views: article.views + 1 });
  }
}
