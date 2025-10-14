import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { KnowledgeBaseService } from '../services/knowledge-base.service';
import {
  CreateKnowledgeArticleDto,
  UpdateKnowledgeArticleDto,
  PublishArticleDto,
  RateArticleDto,
  SearchArticlesDto,
} from '../dto/hrsd.dto';

@ApiTags('HR Service Delivery - Knowledge Base')
@Controller('hrsd/knowledge')
export class KnowledgeBaseController {
  constructor(private readonly knowledgeService: KnowledgeBaseService) {}

  @Post('articles')
  @ApiOperation({ summary: 'Create knowledge article' })
  @ApiResponse({ status: 201, description: 'Article created successfully' })
  async createArticle(@Body() dto: CreateKnowledgeArticleDto) {
    return this.knowledgeService.createArticle(dto);
  }

  @Put('articles/:id')
  @ApiOperation({ summary: 'Update article' })
  async updateArticle(@Param('id') id: string, @Body() dto: UpdateKnowledgeArticleDto) {
    return this.knowledgeService.updateArticle(id, dto);
  }

  @Post('articles/publish')
  @ApiOperation({ summary: 'Publish article' })
  async publishArticle(@Body() dto: PublishArticleDto) {
    return this.knowledgeService.publishArticle(dto);
  }

  @Post('articles/:id/archive')
  @ApiOperation({ summary: 'Archive article' })
  async archiveArticle(@Param('id') id: string, @Body('archivedBy') archivedBy: string) {
    return this.knowledgeService.archiveArticle(id, archivedBy);
  }

  @Get('articles/:id')
  @ApiOperation({ summary: 'Get article details' })
  async getArticle(@Param('id') id: string) {
    return this.knowledgeService.getArticle(id);
  }

  @Post('articles/search')
  @ApiOperation({ summary: 'Search articles' })
  async searchArticles(@Body() dto: SearchArticlesDto) {
    return this.knowledgeService.searchArticles(dto);
  }

  @Get('articles/category/:organizationId/:category')
  @ApiOperation({ summary: 'Get articles by category' })
  async getArticlesByCategory(
    @Param('organizationId') organizationId: string,
    @Param('category') category: string,
  ) {
    return this.knowledgeService.getArticlesByCategory(organizationId, category);
  }

  @Get('articles/popular/:organizationId')
  @ApiOperation({ summary: 'Get popular articles' })
  async getPopularArticles(
    @Param('organizationId') organizationId: string,
    @Query('limit') limit?: number,
  ) {
    return this.knowledgeService.getPopularArticles(organizationId, limit);
  }

  @Get('articles/helpful/:organizationId')
  @ApiOperation({ summary: 'Get most helpful articles' })
  async getMostHelpfulArticles(
    @Param('organizationId') organizationId: string,
    @Query('limit') limit?: number,
  ) {
    return this.knowledgeService.getMostHelpfulArticles(organizationId, limit);
  }

  @Post('articles/rate')
  @ApiOperation({ summary: 'Rate article' })
  async rateArticle(@Body() dto: RateArticleDto) {
    return this.knowledgeService.rateArticle(dto);
  }

  @Post('articles/:id/deflection')
  @ApiOperation({ summary: 'Record case deflection (KB article prevented case)' })
  async recordDeflection(@Param('id') id: string) {
    return this.knowledgeService.recordDeflection(id);
  }

  @Get('articles/:id/feedback')
  @ApiOperation({ summary: 'Get article feedback' })
  async getArticleFeedback(@Param('id') id: string) {
    return this.knowledgeService.getArticleFeedback(id);
  }

  @Get('metrics/:organizationId')
  @ApiOperation({ summary: 'Get deflection metrics' })
  async getDeflectionMetrics(@Param('organizationId') organizationId: string) {
    return this.knowledgeService.getDeflectionMetrics(organizationId);
  }
}
