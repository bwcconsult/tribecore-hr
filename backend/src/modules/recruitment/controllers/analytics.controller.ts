import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AnalyticsService } from '../services/analytics.service';

@Controller('api/v1/recruitment/analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  /**
   * Get recruitment funnel metrics
   * GET /api/v1/recruitment/analytics/funnel
   */
  @Get('funnel')
  async getFunnel(@Query() query: any, @Req() req: any) {
    return await this.analyticsService.getFunnelMetrics({
      organizationId: req.user.organizationId,
      requisitionId: query.requisitionId,
      departmentId: query.departmentId,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
    });
  }

  /**
   * Get time-to-hire metrics
   * GET /api/v1/recruitment/analytics/time-to-hire
   */
  @Get('time-to-hire')
  async getTimeToHire(@Query() query: any, @Req() req: any) {
    return await this.analyticsService.getTimeToHireMetrics({
      organizationId: req.user.organizationId,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
    });
  }

  /**
   * Get source of hire metrics
   * GET /api/v1/recruitment/analytics/source-of-hire
   */
  @Get('source-of-hire')
  async getSourceOfHire(@Query() query: any, @Req() req: any) {
    return await this.analyticsService.getSourceOfHireMetrics({
      organizationId: req.user.organizationId,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
    });
  }

  /**
   * Get offer acceptance metrics
   * GET /api/v1/recruitment/analytics/offer-acceptance
   */
  @Get('offer-acceptance')
  async getOfferAcceptance(@Query() query: any, @Req() req: any) {
    return await this.analyticsService.getOfferAcceptanceMetrics({
      organizationId: req.user.organizationId,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
    });
  }

  /**
   * Get recruiter performance metrics
   * GET /api/v1/recruitment/analytics/recruiter-performance
   */
  @Get('recruiter-performance')
  async getRecruiterPerformance(@Query() query: any, @Req() req: any) {
    return await this.analyticsService.getRecruiterMetrics({
      organizationId: req.user.organizationId,
      recruiterId: query.recruiterId,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
    });
  }

  /**
   * Get cost per hire
   * GET /api/v1/recruitment/analytics/cost-per-hire
   */
  @Get('cost-per-hire')
  async getCostPerHire(@Query() query: any, @Req() req: any) {
    return await this.analyticsService.getCostPerHire({
      organizationId: req.user.organizationId,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
    });
  }

  /**
   * Get interview to offer ratio
   * GET /api/v1/recruitment/analytics/interview-to-offer-ratio
   */
  @Get('interview-to-offer-ratio')
  async getInterviewToOfferRatio(@Query() query: any, @Req() req: any) {
    return await this.analyticsService.getInterviewToOfferRatio({
      organizationId: req.user.organizationId,
      fromDate: query.fromDate ? new Date(query.fromDate) : undefined,
      toDate: query.toDate ? new Date(query.toDate) : undefined,
    });
  }

  /**
   * Get forecast accuracy
   * GET /api/v1/recruitment/analytics/forecast-accuracy
   */
  @Get('forecast-accuracy')
  async getForecastAccuracy(@Query() query: any, @Req() req: any) {
    return await this.analyticsService.getForecastAccuracy({
      organizationId: req.user.organizationId,
      year: Number(query.year),
      quarter: query.quarter ? Number(query.quarter) : undefined,
    });
  }

  /**
   * Get requisition aging report
   * GET /api/v1/recruitment/analytics/requisition-aging
   */
  @Get('requisition-aging')
  async getRequisitionAging(@Req() req: any) {
    return await this.analyticsService.getRequisitionAging({
      organizationId: req.user.organizationId,
    });
  }

  /**
   * Get dashboard summary (all metrics)
   * GET /api/v1/recruitment/analytics/dashboard
   */
  @Get('dashboard')
  async getDashboard(@Query() query: any, @Req() req: any) {
    const fromDate = query.fromDate ? new Date(query.fromDate) : undefined;
    const toDate = query.toDate ? new Date(query.toDate) : undefined;

    const [
      funnel,
      timeToHire,
      sourceOfHire,
      offerAcceptance,
      interviewToOfferRatio,
      requisitionAging,
    ] = await Promise.all([
      this.analyticsService.getFunnelMetrics({
        organizationId: req.user.organizationId,
        fromDate,
        toDate,
      }),
      this.analyticsService.getTimeToHireMetrics({
        organizationId: req.user.organizationId,
        fromDate,
        toDate,
      }),
      this.analyticsService.getSourceOfHireMetrics({
        organizationId: req.user.organizationId,
        fromDate,
        toDate,
      }),
      this.analyticsService.getOfferAcceptanceMetrics({
        organizationId: req.user.organizationId,
        fromDate,
        toDate,
      }),
      this.analyticsService.getInterviewToOfferRatio({
        organizationId: req.user.organizationId,
        fromDate,
        toDate,
      }),
      this.analyticsService.getRequisitionAging({
        organizationId: req.user.organizationId,
      }),
    ]);

    return {
      funnel,
      timeToHire,
      sourceOfHire,
      offerAcceptance,
      interviewToOfferRatio,
      requisitionAging: requisitionAging.slice(0, 10), // Top 10 aging reqs
    };
  }
}
