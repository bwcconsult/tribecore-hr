import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SuccessionPlanningService } from '../services/succession-planning.service';

@ApiTags('Internal Recruitment - Succession Planning')
@Controller('api/v1/internal-recruitment/succession')
export class SuccessionPlanningController {
  constructor(private readonly successionService: SuccessionPlanningService) {}

  @Post()
  @ApiOperation({ summary: 'Create succession plan' })
  async createPlan(@Body() data: any) {
    return this.successionService.createPlan(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get succession plan' })
  async getPlan(@Param('id') id: string) {
    return this.successionService.getPlanById(id);
  }

  @Get('organization/:orgId')
  @ApiOperation({ summary: 'Get organization succession plans' })
  async getOrganizationPlans(@Param('orgId') orgId: string) {
    return this.successionService.getOrganizationPlans(orgId);
  }

  @Get('organization/:orgId/critical')
  @ApiOperation({ summary: 'Get critical succession plans' })
  async getCriticalPlans(@Param('orgId') orgId: string) {
    return this.successionService.getCriticalPlans(orgId);
  }

  @Post(':id/successors')
  @ApiOperation({ summary: 'Add successor to plan' })
  async addSuccessor(@Param('id') id: string, @Body() successor: any) {
    return this.successionService.addSuccessor(id, successor);
  }

  @Get('organization/:orgId/stats')
  @ApiOperation({ summary: 'Get succession statistics' })
  async getStats(@Param('orgId') orgId: string) {
    return this.successionService.getSuccessionStats(orgId);
  }
}
