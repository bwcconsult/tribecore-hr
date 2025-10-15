import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ResumeParserService } from '../services/resume-parser.service';
import { CandidateSourcingService } from '../services/candidate-sourcing.service';
import { ChatbotService } from '../services/chatbot.service';
import { VideoScreeningService } from '../services/video-screening.service';
import { WebhookService, WebhookEvent } from '../services/webhook.service';

@Controller('api/v1/recruitment/advanced')
@UseGuards(JwtAuthGuard)
export class AdvancedController {
  constructor(
    private readonly resumeParserService: ResumeParserService,
    private readonly sourcingService: CandidateSourcingService,
    private readonly chatbotService: ChatbotService,
    private readonly videoService: VideoScreeningService,
    private readonly webhookService: WebhookService,
  ) {}

  // ==================== RESUME PARSING ====================

  /**
   * Parse resume from uploaded file
   * POST /api/v1/recruitment/advanced/parse-resume
   */
  @Post('parse-resume')
  @UseInterceptors(FileInterceptor('file'))
  async parseResume(
    @UploadedFile() file: any,
    @Query('useAI') useAI: string,
  ) {
    if (useAI === 'true') {
      return await this.resumeParserService.parseResumeWithAI({
        fileBuffer: file.buffer,
        fileName: file.originalname,
      });
    }

    return await this.resumeParserService.parseResume({
      fileBuffer: file.buffer,
      fileName: file.originalname,
      mimeType: file.mimetype,
    });
  }

  // ==================== CANDIDATE SOURCING ====================

  /**
   * Generate Boolean search string
   * POST /api/v1/recruitment/advanced/generate-search
   */
  @Post('generate-search')
  async generateSearch(@Body() criteria: any) {
    return {
      booleanString: this.sourcingService.generateBooleanSearch(criteria),
    };
  }

  /**
   * Search candidates across multiple platforms
   * POST /api/v1/recruitment/advanced/source-candidates
   */
  @Post('source-candidates')
  async sourceCandidates(@Body() criteria: any) {
    return await this.sourcingService.multiSourceSearch(criteria);
  }

  /**
   * Search LinkedIn for candidates
   * POST /api/v1/recruitment/advanced/source/linkedin
   */
  @Post('source/linkedin')
  async searchLinkedIn(@Body() criteria: any) {
    return await this.sourcingService.searchLinkedIn(criteria);
  }

  /**
   * Search GitHub for developers
   * POST /api/v1/recruitment/advanced/source/github
   */
  @Post('source/github')
  async searchGitHub(@Body() criteria: any) {
    return await this.sourcingService.searchGitHub(criteria);
  }

  /**
   * Find email addresses for candidate
   * POST /api/v1/recruitment/advanced/find-email
   */
  @Post('find-email')
  async findEmail(@Body() params: { name: string; company?: string; linkedinUrl?: string }) {
    return await this.sourcingService.findEmail(params);
  }

  /**
   * Enrich candidate profile
   * POST /api/v1/recruitment/advanced/enrich-profile
   */
  @Post('enrich-profile')
  async enrichProfile(@Body() candidate: any) {
    return await this.sourcingService.enrichProfile(candidate);
  }

  // ==================== CHATBOT ====================

  /**
   * Initialize chat session
   * POST /api/v1/recruitment/advanced/chat/init
   */
  @Post('chat/init')
  async initChat(@Body() params: any) {
    return await this.chatbotService.initializeSession(params);
  }

  /**
   * Send message to chatbot
   * POST /api/v1/recruitment/advanced/chat/message
   */
  @Post('chat/message')
  async sendChatMessage(@Body() params: { sessionId: string; message: string }) {
    return await this.chatbotService.sendMessage(params);
  }

  /**
   * Get chat session
   * GET /api/v1/recruitment/advanced/chat/:sessionId
   */
  @Get('chat/:sessionId')
  async getChatSession(@Param('sessionId') sessionId: string) {
    return this.chatbotService.getSession(sessionId);
  }

  /**
   * End chat session
   * POST /api/v1/recruitment/advanced/chat/:sessionId/end
   */
  @Post('chat/:sessionId/end')
  async endChat(@Param('sessionId') sessionId: string) {
    await this.chatbotService.endSession(sessionId);
    return { success: true };
  }

  /**
   * Get suggested questions
   * POST /api/v1/recruitment/advanced/chat/suggestions
   */
  @Post('chat/suggestions')
  async getSuggestions(@Body() context: any) {
    return this.chatbotService.getSuggestedQuestions(context);
  }

  // ==================== VIDEO SCREENING ====================

  /**
   * Create one-way video interview
   * POST /api/v1/recruitment/advanced/video/one-way
   */
  @Post('video/one-way')
  async createOneWayInterview(@Body() params: any, @Req() req: any) {
    return await this.videoService.createOneWayInterview({
      ...params,
      organizationId: req.user.organizationId,
    });
  }

  /**
   * Schedule live video interview
   * POST /api/v1/recruitment/advanced/video/live
   */
  @Post('video/live')
  async scheduleLiveInterview(@Body() params: any, @Req() req: any) {
    return await this.videoService.scheduleLiveInterview({
      ...params,
      organizationId: req.user.organizationId,
    });
  }

  /**
   * Analyze video interview with AI
   * POST /api/v1/recruitment/advanced/video/:interviewId/analyze
   */
  @Post('video/:interviewId/analyze')
  async analyzeVideo(
    @Param('interviewId') interviewId: string,
    @Body('recordingUrl') recordingUrl: string,
  ) {
    return await this.videoService.analyzeVideoInterview({
      interviewId,
      recordingUrl,
    });
  }

  /**
   * Get video recording
   * GET /api/v1/recruitment/advanced/video/:interviewId/recording
   */
  @Get('video/:interviewId/recording')
  async getRecording(@Param('interviewId') interviewId: string) {
    return await this.videoService.getRecording(interviewId);
  }

  /**
   * Cancel video interview
   * POST /api/v1/recruitment/advanced/video/:interviewId/cancel
   */
  @Post('video/:interviewId/cancel')
  async cancelVideo(
    @Param('interviewId') interviewId: string,
    @Body('reason') reason: string,
  ) {
    await this.videoService.cancelInterview({ interviewId, reason });
    return { success: true };
  }

  /**
   * Generate questions for role
   * POST /api/v1/recruitment/advanced/video/generate-questions
   */
  @Post('video/generate-questions')
  async generateQuestions(@Body() params: any) {
    return this.videoService.generateQuestionsForRole(params);
  }

  // ==================== WEBHOOKS (API MARKETPLACE) ====================

  /**
   * Create webhook subscription
   * POST /api/v1/recruitment/advanced/webhooks
   */
  @Post('webhooks')
  async createWebhook(@Body() params: any, @Req() req: any) {
    return await this.webhookService.createSubscription({
      ...params,
      organizationId: req.user.organizationId,
    });
  }

  /**
   * List webhook subscriptions
   * GET /api/v1/recruitment/advanced/webhooks
   */
  @Get('webhooks')
  async listWebhooks(@Req() req: any) {
    return this.webhookService.listSubscriptions(req.user.organizationId);
  }

  /**
   * Get webhook subscription
   * GET /api/v1/recruitment/advanced/webhooks/:id
   */
  @Get('webhooks/:id')
  async getWebhook(@Param('id') id: string) {
    return this.webhookService.getSubscription(id);
  }

  /**
   * Update webhook subscription
   * POST /api/v1/recruitment/advanced/webhooks/:id
   */
  @Post('webhooks/:id')
  async updateWebhook(@Param('id') id: string, @Body() params: any) {
    return await this.webhookService.updateSubscription({
      subscriptionId: id,
      ...params,
    });
  }

  /**
   * Delete webhook subscription
   * POST /api/v1/recruitment/advanced/webhooks/:id/delete
   */
  @Post('webhooks/:id/delete')
  async deleteWebhook(@Param('id') id: string) {
    await this.webhookService.deleteSubscription(id);
    return { success: true };
  }

  /**
   * Test webhook endpoint
   * POST /api/v1/recruitment/advanced/webhooks/:id/test
   */
  @Post('webhooks/:id/test')
  async testWebhook(@Param('id') id: string) {
    const success = await this.webhookService.testWebhook(id);
    return { success };
  }

  /**
   * Get webhook delivery history
   * GET /api/v1/recruitment/advanced/webhooks/:id/deliveries
   */
  @Get('webhooks/:id/deliveries')
  async getDeliveries(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.webhookService.getDeliveryHistory(id, limit ? parseInt(limit) : 50);
  }

  /**
   * Get available webhook events
   * GET /api/v1/recruitment/advanced/webhooks/events
   */
  @Get('webhooks-events/list')
  async getWebhookEvents() {
    return {
      events: Object.values(WebhookEvent),
      categories: {
        requisition: Object.values(WebhookEvent).filter(e => e.startsWith('requisition')),
        application: Object.values(WebhookEvent).filter(e => e.startsWith('application')),
        interview: Object.values(WebhookEvent).filter(e => e.startsWith('interview')),
        scorecard: Object.values(WebhookEvent).filter(e => e.startsWith('scorecard')),
        offer: Object.values(WebhookEvent).filter(e => e.startsWith('offer')),
        check: Object.values(WebhookEvent).filter(e => e.startsWith('check')),
        candidate: Object.values(WebhookEvent).filter(e => e.startsWith('candidate')),
      },
    };
  }
}
