// Article Repository - Abstraction of database operations on Articles for KAOS
import { Article } from "../core/types";
import { supabase } from "@/lib/supabase";

export interface IArticleRepository {
  getById(id: string): Promise<Article | null>;
  getAll(): Promise<Article[]>;
  create(article: Omit<Article, 'id' | 'publishedAt' | 'views' | 'commentsCount' | 'reactions' | 'userReaction'>): Promise<Article>;
  update(id: string, article: Partial<Article>): Promise<Article>;
}

export class ArticleRepository implements IArticleRepository {
  async getById(id: string): Promise<Article | null> {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;
    return this.mapToDomain(data);
  }

  async getAll(): Promise<Article[]> {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("published_at", { ascending: false });

    if (error || !data) return [];
    return data.map(d => this.mapToDomain(d));
  }

  async create(article: Omit<Article, 'id' | 'publishedAt' | 'views' | 'commentsCount' | 'reactions' | 'userReaction'>): Promise<Article> {
    const newArticle = {
      title: article.title,
      title_en: article.titleEn,
      category: article.category,
      category_en: article.categoryEn,
      source_name: article.sourceName,
      source_verified: article.sourceVerified,
      summary: article.summary,
      summary_en: article.summaryEn,
      content: JSON.stringify(article.content),
      content_en: article.contentEn ? JSON.stringify(article.contentEn) : null,
      image_url: article.imageUrl,
      additional_images: article.additionalImages ? JSON.stringify(article.additionalImages) : null,
      video_url: article.videoUrl,
      corrections: JSON.stringify([]),
      comments_count: 0,
      comments_disabled: article.commentsDisabled || false,
      reactions: JSON.stringify({ like: 0, love: 0, bravo: 0, surprise: 0, sad: 0, important: 0 }),
      continent: article.continent || "Monde",
      views: 0
    };

    const { data, error } = await supabase
      .from("articles")
      .insert(newArticle)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to create article: ${error?.message}`);
    }

    return this.mapToDomain(data);
  }

  async update(id: string, article: Partial<Article>): Promise<Article> {
    const mappedUpdates: any = {};
    if (article.title !== undefined) mappedUpdates.title = article.title;
    if (article.titleEn !== undefined) mappedUpdates.title_en = article.titleEn;
    if (article.category !== undefined) mappedUpdates.category = article.category;
    if (article.summary !== undefined) mappedUpdates.summary = article.summary;
    if (article.summaryEn !== undefined) mappedUpdates.summary_en = article.summaryEn;
    if (article.content !== undefined) mappedUpdates.content = JSON.stringify(article.content);
    if (article.contentEn !== undefined) mappedUpdates.content_en = JSON.stringify(article.contentEn);
    if (article.views !== undefined) mappedUpdates.views = article.views;
    if (article.commentsCount !== undefined) mappedUpdates.comments_count = article.commentsCount;
    if (article.reactions !== undefined) mappedUpdates.reactions = JSON.stringify(article.reactions);
    if (article.corrections !== undefined) mappedUpdates.corrections = JSON.stringify(article.corrections);

    const { data, error } = await supabase
      .from("articles")
      .update(mappedUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update article ${id}: ${error?.message}`);
    }

    return this.mapToDomain(data);
  }

  private mapToDomain(dbArticle: any): Article {
    return {
      id: dbArticle.id,
      title: dbArticle.title,
      titleEn: dbArticle.title_en,
      category: dbArticle.category,
      categoryEn: dbArticle.category_en,
      sourceName: dbArticle.source_name,
      sourceVerified: dbArticle.source_verified,
      publishedAt: dbArticle.published_at || dbArticle.created_at,
      readTime: dbArticle.read_time || "3 min",
      views: dbArticle.views || 0,
      summary: dbArticle.summary || "",
      summaryEn: dbArticle.summary_en,
      content: typeof dbArticle.content === "string" ? JSON.parse(dbArticle.content) : dbArticle.content || [],
      contentEn: typeof dbArticle.content_en === "string" ? JSON.parse(dbArticle.content_en) : dbArticle.content_en,
      imageUrl: dbArticle.image_url || "",
      additionalImages: typeof dbArticle.additional_images === "string" ? JSON.parse(dbArticle.additional_images) : dbArticle.additional_images,
      videoUrl: dbArticle.video_url,
      corrections: typeof dbArticle.corrections === "string" ? JSON.parse(dbArticle.corrections) : dbArticle.corrections || [],
      commentsCount: dbArticle.comments_count || 0,
      commentsDisabled: dbArticle.comments_disabled || false,
      reactions: typeof dbArticle.reactions === "string" ? JSON.parse(dbArticle.reactions) : dbArticle.reactions || { like: 0, love: 0, bravo: 0, surprise: 0, sad: 0, important: 0 },
      userReaction: null,
      continent: dbArticle.continent
    };
  }
}
