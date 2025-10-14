import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SkillsCloudService } from '../services/skills-cloud.service';

@ApiTags('Skills Cloud & Talent Marketplace')
@Controller('skills-cloud')
export class SkillsCloudController {
  constructor(private readonly skillsService: SkillsCloudService) {}

  @Post('skills')
  @ApiOperation({ summary: 'Create skill' })
  async createSkill(@Body() data: any) {
    return this.skillsService.createSkill(data);
  }

  @Post('employee-skills')
  @ApiOperation({ summary: 'Add skill to employee' })
  async addEmployeeSkill(@Body() data: any) {
    return this.skillsService.addEmployeeSkill(data);
  }

  @Get('employee-skills/:employeeId')
  @ApiOperation({ summary: 'Get employee skills' })
  async getEmployeeSkills(@Param('employeeId') employeeId: string) {
    return this.skillsService.getEmployeeSkills(employeeId);
  }

  @Get('skill-gaps/:organizationId')
  @ApiOperation({ summary: 'Get skill gaps' })
  async getSkillGaps(@Param('organizationId') organizationId: string) {
    return this.skillsService.getSkillGaps(organizationId);
  }

  @Post('opportunities')
  @ApiOperation({ summary: 'Create marketplace opportunity' })
  async createOpportunity(@Body() data: any) {
    return this.skillsService.createOpportunity(data);
  }

  @Get('opportunities/:organizationId')
  @ApiOperation({ summary: 'Get open opportunities' })
  async getOpportunities(@Param('organizationId') organizationId: string) {
    return this.skillsService.getOpenOpportunities(organizationId);
  }

  @Get('opportunities/:opportunityId/matches')
  @ApiOperation({ summary: 'Match employees to opportunity' })
  async matchEmployees(@Param('opportunityId') opportunityId: string) {
    return this.skillsService.matchEmployeesToOpportunity(opportunityId);
  }
}
