import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SkillsTrainingService } from './skills-training.service';
import {
  CreateSkillDto,
  CreatePersonSkillDto,
  CreateEducationDto,
  CreateQualificationDto,
  CreateLanguageDto,
  CreateLicenseDto,
  CreateTrainingActivityDto,
  UpdateTrainingActivityDto,
  CreateDevelopmentPlanDto,
  CreateDevelopmentNeedDto,
} from './dto/skills-training.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Skills & Training')
@Controller('skills-training')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SkillsTrainingController {
  constructor(private readonly service: SkillsTrainingService) {}

  // ==================== SKILLS ====================

  @Post('skills')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Create skill' })
  createSkill(@Body() dto: CreateSkillDto, @CurrentUser() user: any) {
    return this.service.createSkill(dto, user);
  }

  @Get('skills')
  @ApiOperation({ summary: 'Get all skills' })
  getAllSkills() {
    return this.service.getAllSkills();
  }

  @Post('person-skills')
  @ApiOperation({ summary: 'Add skill to person' })
  addPersonSkill(@Body() dto: CreatePersonSkillDto, @CurrentUser() user: any) {
    return this.service.addPersonSkill(dto, user);
  }

  @Get('person-skills/:personId')
  @ApiOperation({ summary: 'Get person skills' })
  getPersonSkills(@Param('personId') personId: string) {
    return this.service.getPersonSkills(personId);
  }

  @Patch('person-skills/:id/validate')
  @Roles(UserRole.MANAGER, UserRole.HR_MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Validate person skill' })
  validateSkill(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.validateSkill(id, user);
  }

  @Get('skills-matrix/:personId')
  @ApiOperation({ summary: 'Get skills matrix' })
  getSkillsMatrix(@Param('personId') personId: string) {
    return this.service.getSkillsMatrix(personId);
  }

  // ==================== EDUCATION ====================

  @Post('education')
  @ApiOperation({ summary: 'Add education history' })
  addEducation(@Body() dto: CreateEducationDto, @CurrentUser() user: any) {
    return this.service.addEducation(dto, user);
  }

  @Get('education/:personId')
  @ApiOperation({ summary: 'Get education history' })
  getEducationHistory(@Param('personId') personId: string) {
    return this.service.getEducationHistory(personId);
  }

  // ==================== QUALIFICATIONS ====================

  @Post('qualifications')
  @ApiOperation({ summary: 'Add qualification' })
  addQualification(@Body() dto: CreateQualificationDto, @CurrentUser() user: any) {
    return this.service.addQualification(dto, user);
  }

  @Get('qualifications/:personId')
  @ApiOperation({ summary: 'Get qualifications' })
  getQualifications(@Param('personId') personId: string) {
    return this.service.getQualifications(personId);
  }

  @Get('qualifications/expiring')
  @Roles(UserRole.HR_MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get expiring qualifications' })
  getExpiringQualifications(@Query('days') days?: number) {
    return this.service.getExpiringQualifications(days ? +days : 90);
  }

  // ==================== LANGUAGES ====================

  @Post('languages')
  @ApiOperation({ summary: 'Add language' })
  addLanguage(@Body() dto: CreateLanguageDto, @CurrentUser() user: any) {
    return this.service.addLanguage(dto, user);
  }

  @Get('languages/:personId')
  @ApiOperation({ summary: 'Get languages' })
  getLanguages(@Param('personId') personId: string) {
    return this.service.getLanguages(personId);
  }

  // ==================== LICENSES ====================

  @Post('licenses')
  @ApiOperation({ summary: 'Add license' })
  addLicense(@Body() dto: CreateLicenseDto, @CurrentUser() user: any) {
    return this.service.addLicense(dto, user);
  }

  @Get('licenses/:personId')
  @ApiOperation({ summary: 'Get licenses' })
  getLicenses(@Param('personId') personId: string) {
    return this.service.getLicenses(personId);
  }

  @Get('licenses/expiring')
  @Roles(UserRole.HR_MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get expiring licenses' })
  getExpiringLicenses(@Query('days') days?: number) {
    return this.service.getExpiringLicenses(days ? +days : 90);
  }

  // ==================== TRAINING ====================

  @Post('training')
  @ApiOperation({ summary: 'Create training activity' })
  createTrainingActivity(
    @Body() dto: CreateTrainingActivityDto,
    @CurrentUser() user: any,
  ) {
    return this.service.createTrainingActivity(dto, user);
  }

  @Patch('training/:id')
  @ApiOperation({ summary: 'Update training activity' })
  updateTrainingActivity(
    @Param('id') id: string,
    @Body() dto: UpdateTrainingActivityDto,
    @CurrentUser() user: any,
  ) {
    return this.service.updateTrainingActivity(id, dto, user);
  }

  @Get('training/:personId')
  @ApiOperation({ summary: 'Get training activities' })
  getTrainingActivities(@Param('personId') personId: string) {
    return this.service.getTrainingActivities(personId);
  }

  @Get('training/:personId/summary')
  @ApiOperation({ summary: 'Get training summary' })
  getTrainingSummary(@Param('personId') personId: string) {
    return this.service.getTrainingSummary(personId);
  }

  // ==================== DEVELOPMENT PLANS ====================

  @Post('development-plans')
  @ApiOperation({ summary: 'Create development plan' })
  createDevelopmentPlan(
    @Body() dto: CreateDevelopmentPlanDto,
    @CurrentUser() user: any,
  ) {
    return this.service.createDevelopmentPlan(dto, user);
  }

  @Get('development-plans/:personId')
  @ApiOperation({ summary: 'Get development plans' })
  getDevelopmentPlans(@Param('personId') personId: string) {
    return this.service.getDevelopmentPlans(personId);
  }

  // ==================== DEVELOPMENT NEEDS ====================

  @Post('development-needs')
  @ApiOperation({ summary: 'Create development need' })
  createDevelopmentNeed(
    @Body() dto: CreateDevelopmentNeedDto,
    @CurrentUser() user: any,
  ) {
    return this.service.createDevelopmentNeed(dto, user);
  }

  @Get('development-needs/:personId')
  @ApiOperation({ summary: 'Get development needs' })
  getDevelopmentNeeds(@Param('personId') personId: string) {
    return this.service.getDevelopmentNeeds(personId);
  }
}
