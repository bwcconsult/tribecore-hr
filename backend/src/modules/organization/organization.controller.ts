import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Organization')
@Controller('organization')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Create organization' })
  create(@Body() createDto: CreateOrganizationDto) {
    return this.organizationService.create(createDto);
  }

  @Get()
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Get all organizations' })
  findAll() {
    return this.organizationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID' })
  findOne(@Param('id') id: string) {
    return this.organizationService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update organization' })
  update(@Param('id') id: string, @Body() updateDto: UpdateOrganizationDto) {
    return this.organizationService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPERADMIN)
  @ApiOperation({ summary: 'Delete organization' })
  remove(@Param('id') id: string) {
    return this.organizationService.remove(id);
  }

  // Settings Endpoints
  @Get(':id/settings')
  @ApiOperation({ summary: 'Get organization settings' })
  getSettings(@Param('id') id: string) {
    return this.organizationService.getSettings(id);
  }

  @Patch(':id/settings')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update organization settings' })
  updateSettings(@Param('id') id: string, @Body() settings: any) {
    return this.organizationService.updateSettings(id, settings);
  }

  @Get(':id/settings/work-locations')
  @ApiOperation({ summary: 'Get configured work locations' })
  getWorkLocations(@Param('id') id: string) {
    return this.organizationService.getWorkLocations(id);
  }

  @Get(':id/settings/departments')
  @ApiOperation({ summary: 'Get configured departments' })
  getDepartments(@Param('id') id: string) {
    return this.organizationService.getDepartments(id);
  }

  @Get(':id/settings/job-levels')
  @ApiOperation({ summary: 'Get configured job levels' })
  getJobLevels(@Param('id') id: string) {
    return this.organizationService.getJobLevels(id);
  }

  @Get(':id/settings/onboarding-checklist')
  @ApiOperation({ summary: 'Get onboarding checklist' })
  getOnboardingChecklist(@Param('id') id: string) {
    return this.organizationService.getOnboardingChecklist(id);
  }
}
