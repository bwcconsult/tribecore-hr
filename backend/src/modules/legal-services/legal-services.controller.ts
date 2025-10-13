import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { LegalServicesService } from './legal-services.service';

@Controller('legal-services')
export class LegalServicesController {
  constructor(private readonly service: LegalServicesService) {}

  // === LEGAL ADVICE ===
  @Post('advice-requests')
  async createAdviceRequest(@Body() data: any) {
    return this.service.createAdviceRequest(data);
  }

  @Get('advice-requests')
  async getAllAdviceRequests(@Query('organizationId') orgId: string) {
    return this.service.findAllAdviceRequests(orgId);
  }

  @Put('advice-requests/:id/respond')
  async respondToAdvice(
    @Param('id') id: string,
    @Body() data: { response: string; respondedBy: string },
  ) {
    return this.service.respondToAdvice(id, data.response, data.respondedBy);
  }

  // === DOCUMENT TEMPLATES ===
  @Post('templates')
  async createTemplate(@Body() data: any) {
    return this.service.createTemplate(data);
  }

  @Get('templates')
  async getAllTemplates(@Query('category') category?: string) {
    return this.service.findAllTemplates(category);
  }

  @Get('templates/:id')
  async getTemplate(@Param('id') id: string) {
    return this.service.getTemplate(id);
  }

  @Post('templates/:id/generate')
  async generateDocument(@Param('id') id: string, @Body() data: any) {
    const content = await this.service.generateDocument(id, data);
    return { content };
  }

  // === HR INSURANCE ===
  @Post('claims')
  async createClaim(@Body() data: any) {
    return this.service.createClaim(data);
  }

  @Get('claims')
  async getAllClaims(@Query('organizationId') orgId: string) {
    return this.service.findAllClaims(orgId);
  }

  @Put('claims/:id/status')
  async updateClaimStatus(@Param('id') id: string, @Body() data: { status: any }) {
    return this.service.updateClaimStatus(id, data.status);
  }

  // === ANALYTICS ===
  @Get('analytics')
  async getAnalytics(@Query('organizationId') orgId: string) {
    return this.service.getAnalytics(orgId);
  }
}
