import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { OnboardingCaseService } from '../services/onboarding-case.service';
import { CreateOnboardingCaseDto } from '../dto/create-onboarding-case.dto';
import { OnboardingStatus } from '../entities/onboard-case.entity';

@Controller('api/v1/onboarding/cases')
export class OnboardingCaseController {
  constructor(private readonly caseService: OnboardingCaseService) {}

  @Post()
  async createCase(@Body() dto: CreateOnboardingCaseDto) {
    return this.caseService.createCase(dto);
  }

  @Get()
  async getCases(
    @Query('organizationId') organizationId: string,
    @Query('status') status?: string,
    @Query('ownerId') ownerId?: string,
    @Query('department') department?: string,
    @Query('country') country?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.caseService.getCases({
      organizationId,
      status: status as OnboardingStatus,
      ownerId,
      department,
      country,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(':id')
  async getCase(@Param('id') id: string) {
    return this.caseService.getCaseWithTasks(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: OnboardingStatus,
  ) {
    return this.caseService.updateCaseStatus(id, status);
  }

  @Patch(':id')
  async updateCase(@Param('id') id: string, @Body() updates: any) {
    return this.caseService.updateCase(id, updates);
  }

  @Delete(':id')
  async deleteCase(@Param('id') id: string) {
    await this.caseService.deleteCase(id);
    return { message: 'Case deleted successfully' };
  }

  @Get(':id/readiness')
  async checkDay1Readiness(@Param('id') id: string) {
    return this.caseService.checkDay1Readiness(id);
  }

  @Get(':id/overdue-tasks')
  async getOverdueTasks(@Param('id') id: string) {
    return this.caseService.getOverdueTasks(id);
  }

  @Get(':id/blocked-tasks')
  async getBlockedTasks(@Param('id') id: string) {
    return this.caseService.getBlockedTasks(id);
  }
}
