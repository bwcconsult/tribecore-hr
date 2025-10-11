import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import {
  UpdateProfileDto,
  UpdateEmploymentDto,
  CreateEmploymentActivityDto,
  CreateWorkScheduleDto,
  CreateEmergencyContactDto,
  CreateDependantDto,
} from './dto/profile-update.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Profile')
@Controller('profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  // Personal Profile

  @Get('me')
  @ApiOperation({ summary: 'Get my profile' })
  async getMyProfile(@CurrentUser() user: any) {
    return this.profileService.getProfile(user.employeeId || user.id, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee profile by ID' })
  async getProfile(@Param('id') id: string, @CurrentUser() user: any) {
    return this.profileService.getProfile(id, user);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update my profile' })
  async updateMyProfile(
    @Body() dto: UpdateProfileDto,
    @CurrentUser() user: any,
  ) {
    return this.profileService.updateProfile(user.employeeId || user.id, dto, user);
  }

  @Patch(':id')
  @Roles(UserRole.HR_MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update employee profile' })
  async updateProfile(
    @Param('id') id: string,
    @Body() dto: UpdateProfileDto,
    @CurrentUser() user: any,
  ) {
    return this.profileService.updateProfile(id, dto, user);
  }

  // Employment

  @Patch(':id/employment')
  @Roles(UserRole.HR_MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update employment details' })
  async updateEmployment(
    @Param('id') id: string,
    @Body() dto: UpdateEmploymentDto,
    @CurrentUser() user: any,
  ) {
    return this.profileService.updateEmployment(id, dto, user);
  }

  @Get(':id/timeline')
  @ApiOperation({ summary: 'Get employment timeline' })
  async getEmploymentTimeline(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.profileService.getEmploymentTimeline(id, user);
  }

  @Post('activities')
  @Roles(UserRole.HR_MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create employment activity' })
  async createActivity(
    @Body() dto: CreateEmploymentActivityDto,
    @CurrentUser() user: any,
  ) {
    return this.profileService.createActivity(dto, user);
  }

  // Work Schedule

  @Get(':id/schedule')
  @ApiOperation({ summary: 'Get work schedule' })
  async getWorkSchedule(@Param('id') id: string) {
    return this.profileService.getWorkSchedule(id);
  }

  @Post('schedule')
  @Roles(UserRole.HR_MANAGER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create/update work schedule' })
  async upsertWorkSchedule(
    @Body() dto: CreateWorkScheduleDto,
    @CurrentUser() user: any,
  ) {
    return this.profileService.upsertWorkSchedule(dto, user);
  }

  // Emergency Contacts

  @Get(':id/emergency-contacts')
  @ApiOperation({ summary: 'Get emergency contacts' })
  async getEmergencyContacts(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.profileService.getEmergencyContacts(id, user);
  }

  @Post('emergency-contacts')
  @ApiOperation({ summary: 'Create emergency contact' })
  async createEmergencyContact(
    @Body() dto: CreateEmergencyContactDto,
    @CurrentUser() user: any,
  ) {
    return this.profileService.createEmergencyContact(dto, user);
  }

  // Dependants

  @Get(':id/dependants')
  @ApiOperation({ summary: 'Get dependants' })
  async getDependants(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.profileService.getDependants(id, user);
  }

  @Post('dependants')
  @ApiOperation({ summary: 'Create dependant' })
  async createDependant(
    @Body() dto: CreateDependantDto,
    @CurrentUser() user: any,
  ) {
    return this.profileService.createDependant(dto, user);
  }
}
