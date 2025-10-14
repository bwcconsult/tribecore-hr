import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PositionManagementService } from '../services/position-management.service';
import { Position } from '../entities/position.entity';
import { OrgScenario } from '../entities/org-scenario.entity';

@ApiTags('Position Management & Workforce Planning')
@Controller('positions')
export class PositionManagementController {
  constructor(private readonly positionService: PositionManagementService) {}

  @Post()
  @ApiOperation({ summary: 'Create position' })
  async createPosition(@Body() data: Partial<Position>) {
    return this.positionService.createPosition(data);
  }

  @Get('org/:organizationId')
  @ApiOperation({ summary: 'Get all positions for organization' })
  async getPositions(@Param('organizationId') organizationId: string) {
    return this.positionService.getPositionsByOrg(organizationId);
  }

  @Get('org/:organizationId/vacant')
  @ApiOperation({ summary: 'Get vacant positions' })
  async getVacantPositions(@Param('organizationId') organizationId: string) {
    return this.positionService.getVacantPositions(organizationId);
  }

  @Get('org/:organizationId/chart')
  @ApiOperation({ summary: 'Get org chart' })
  async getOrgChart(@Param('organizationId') organizationId: string) {
    return this.positionService.getOrgChart(organizationId);
  }

  @Get('org/:organizationId/metrics')
  @ApiOperation({ summary: 'Get workforce planning metrics' })
  async getMetrics(@Param('organizationId') organizationId: string) {
    return this.positionService.getWorkforcePlanningMetrics(organizationId);
  }

  @Post('scenarios')
  @ApiOperation({ summary: 'Create what-if scenario' })
  async createScenario(@Body() data: Partial<OrgScenario>) {
    return this.positionService.createScenario(data);
  }

  @Get('scenarios/:organizationId')
  @ApiOperation({ summary: 'Get scenarios' })
  async getScenarios(@Param('organizationId') organizationId: string) {
    return this.positionService.getScenarios(organizationId);
  }
}
