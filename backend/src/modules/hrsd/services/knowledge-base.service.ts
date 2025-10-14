import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { KnowledgeArticle, ArticleStatus, ArticleFeedback } from '../entities/knowledge-article.entity';
import {
  CreateKnowledgeArticleDto,
  UpdateKnowledgeArticleDto,
  PublishArticleDto,
  RateArticleDto,
  SearchArticlesDto,
} from '../dto/hrsd.dto';

@Injectable()
export class KnowledgeBaseService {
  constructor(
    @InjectRepository(KnowledgeArticle)
    private readonly articleRepository: Repository<KnowledgeArticle>,
    @InjectRepository(ArticleFeedback)
    private readonly feedbackRepository: Repository<ArticleFeedback>,
  ) {}

  async createArticle(dto: CreateKnowledgeArticleDto): Promise<KnowledgeArticle> {
    // Generate article number
    const count = await this.articleRepository.count({ where: { organizationId: dto.organizationId } });
    const articleNumber = `KB-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    // Flatten content for search
    const searchableText = this.stripHtml(dto.content);

    const article = this.articleRepository.create({
      ...dto,
      articleNumber,
      searchableText,
      status: ArticleStatus.DRAFT,
    });

    return this.articleRepository.save(article);
  }

  async updateArticle(id: string, dto: UpdateKnowledgeArticleDto): Promise<KnowledgeArticle> {
    const article = await this.articleRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Update searchable text if content changed
    if (dto.content) {
      dto['searchableText'] = this.stripHtml(dto.content);
    }

    Object.assign(article, dto);
    article.lastEditedAt = new Date();

    return this.articleRepository.save(article);
  }

  async publishArticle(dto: PublishArticleDto): Promise<KnowledgeArticle> {
    const article = await this.articleRepository.findOne({ where: { id: dto.articleId } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    article.status = ArticleStatus.PUBLISHED;
    article.publishedAt = new Date();
    article.publishedBy = dto.publishedBy;

    return this.articleRepository.save(article);
  }

  async archiveArticle(articleId: string, archivedBy: string): Promise<KnowledgeArticle> {
    const article = await this.articleRepository.findOne({ where: { id: articleId } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    article.status = ArticleStatus.ARCHIVED;
    article.archivedAt = new Date();
    article.archivedBy = archivedBy;

    return this.articleRepository.save(article);
  }

  async getArticle(id: string): Promise<KnowledgeArticle> {
    const article = await this.articleRepository.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Increment view count
    article.viewCount += 1;
    await this.articleRepository.save(article);

    return article;
  }

  async searchArticles(dto: SearchArticlesDto): Promise<{
    data: KnowledgeArticle[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { organizationId, query, category, page = 1, limit = 20 } = dto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.articleRepository
      .createQueryBuilder('article')
      .where('article.organizationId = :organizationId', { organizationId })
      .andWhere('article.status = :status', { status: ArticleStatus.PUBLISHED });

    // Search in title, content, keywords
    if (query) {
      queryBuilder.andWhere(
        '(article.title ILIKE :query OR article.searchableText ILIKE :query OR :query = ANY(article.keywords))',
        { query: `%${query}%` },
      );
    }

    if (category) {
      queryBuilder.andWhere('article.category = :category', { category });
    }

    const [data, total] = await queryBuilder
      .orderBy('article.viewCount', 'DESC') // Popular first
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getArticlesByCategory(organizationId: string, category: string): Promise<KnowledgeArticle[]> {
    return this.articleRepository.find({
      where: {
        organizationId,
        category,
        status: ArticleStatus.PUBLISHED,
      },
      order: { viewCount: 'DESC' },
    });
  }

  async getPopularArticles(organizationId: string, limit: number = 10): Promise<KnowledgeArticle[]> {
    return this.articleRepository.find({
      where: {
        organizationId,
        status: ArticleStatus.PUBLISHED,
      },
      order: { viewCount: 'DESC' },
      take: limit,
    });
  }

  async getMostHelpfulArticles(organizationId: string, limit: number = 10): Promise<KnowledgeArticle[]> {
    return this.articleRepository.find({
      where: {
        organizationId,
        status: ArticleStatus.PUBLISHED,
      },
      order: { helpfulCount: 'DESC' },
      take: limit,
    });
  }

  async rateArticle(dto: RateArticleDto): Promise<ArticleFeedback> {
    const article = await this.articleRepository.findOne({ where: { id: dto.articleId } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Check if user already rated
    const existingFeedback = await this.feedbackRepository.findOne({
      where: { articleId: dto.articleId, userId: dto.userId },
    });

    let feedback: ArticleFeedback;

    if (existingFeedback) {
      // Update existing feedback
      Object.assign(existingFeedback, dto);
      feedback = await this.feedbackRepository.save(existingFeedback);
    } else {
      // Create new feedback
      feedback = this.feedbackRepository.create(dto);
      feedback = await this.feedbackRepository.save(feedback);
    }

    // Update article stats
    await this.updateArticleStats(dto.articleId);

    return feedback;
  }

  async recordDeflection(articleId: string): Promise<void> {
    const article = await this.articleRepository.findOne({ where: { id: articleId } });
    if (article) {
      article.deflectionCount += 1;
      await this.articleRepository.save(article);
    }
  }

  async getArticleFeedback(articleId: string): Promise<ArticleFeedback[]> {
    return this.feedbackRepository.find({
      where: { articleId },
      order: { submittedAt: 'DESC' },
    });
  }

  async getDeflectionMetrics(organizationId: string): Promise<any> {
    const articles = await this.articleRepository.find({
      where: { organizationId, status: ArticleStatus.PUBLISHED },
    });

    const totalDeflections = articles.reduce((sum, a) => sum + a.deflectionCount, 0);
    const totalViews = articles.reduce((sum, a) => sum + a.viewCount, 0);
    const avgRating = articles.length > 0
      ? articles.reduce((sum, a) => sum + (a.averageRating || 0), 0) / articles.length
      : 0;

    const topArticles = articles
      .sort((a, b) => b.deflectionCount - a.deflectionCount)
      .slice(0, 10)
      .map(a => ({
        id: a.id,
        title: a.title,
        category: a.category,
        deflectionCount: a.deflectionCount,
        viewCount: a.viewCount,
        avgRating: a.averageRating,
      }));

    return {
      totalArticles: articles.length,
      totalDeflections,
      totalViews,
      deflectionRate: totalViews > 0 ? (totalDeflections / totalViews) * 100 : 0,
      avgRating,
      topArticles,
    };
  }

  // Helper methods
  private async updateArticleStats(articleId: string): Promise<void> {
    const article = await this.articleRepository.findOne({ where: { id: articleId } });
    if (!article) return;

    const feedback = await this.feedbackRepository.find({ where: { articleId } });

    article.helpfulCount = feedback.filter(f => f.helpful).length;
    article.notHelpfulCount = feedback.filter(f => !f.helpful).length;
    article.ratingCount = feedback.filter(f => f.rating).length;

    if (article.ratingCount > 0) {
      const totalRating = feedback.reduce((sum, f) => sum + (f.rating || 0), 0);
      article.averageRating = totalRating / article.ratingCount;
    }

    await this.articleRepository.save(article);
  }

  private stripHtml(html: string): string {
    // Remove HTML tags for searchable text
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
}
