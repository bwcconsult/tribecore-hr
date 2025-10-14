import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ISO30414Service } from '../services/iso30414.service';
import { MetricCategory } from '../entities/hc-metric.entity';

@ApiTags('ISO 30414 - Human Capital Reporting')
@Controller('iso30414')
export class ISO30414Controller {
  constructor(private readonly iso30414Service: ISO30414Service) {}

  @Post('metrics/calculate')
  @ApiOperation({ summary: 'Calculate all ISO 30414 metrics for period' })
  @ApiResponse({ status: 201, description: 'Metrics calculated successfully' })
  async calculateMetrics(
    @Body('organizationId') organizationId: string,
    @Body('periodStart') periodStart: Date,
    @Body('periodEnd') periodEnd: Date,
  ) {
    return this.iso30414Service.calculateAllMetrics(organizationId, periodStart, periodEnd);
  }

  @Post('reports/board')
  @ApiOperation({ summary: 'Generate board-grade HC report' })
  async generateBoardReport(
    @Body('organizationId') organizationId: string,
    @Body('periodStart') periodStart: Date,
    @Body('periodEnd') periodEnd: Date,
  ) {
    return this.iso30414Service.generateBoardReport(organizationId, periodStart, periodEnd);
  }

  @Get('metrics/:organizationId/category/:category')
  @ApiOperation({ summary: 'Get metrics by category' })
  async getMetricsByCategory(
    @Param('organizationId') organizationId: string,
    @Param('category') category: MetricCategory,
  ) {
    return this.iso30414Service.getMetricsByCategory(organizationId, category);
  }

  @Get('metrics/:organizationId/trend/:metricCode')
  @ApiOperation({ summary: 'Get metric trend over time' })
  async getMetricTrend(
    @Param('organizationId') organizationId: string,
    @Param('metricCode') metricCode: string,
    @Query('periods') periods?: number,
  ) {
    return this.iso30414Service.getMetricTrend(organizationId, metricCode, periods);
  }

  @Get('dashboard/:organizationId')
  @ApiOperation({ summary: 'Get ISO 30414 dashboard data' })
  async getDashboardData(@Param('organizationId') organizationId: string) {
    return this.iso30414Service.getDashboardData(organizationId);
  }
}
