import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OnboardingService } from './onboarding.service';
import { CreateOnboardingDto } from './dto/create-onboarding.dto';
import { UpdateOnboardingDto } from './dto/update-onboarding.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Onboarding')
@Controller('onboarding')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Create onboarding workflow' })
  create(@Body() createOnboardingDto: CreateOnboardingDto, @CurrentUser() user: any) {
    createOnboardingDto.organizationId = user.organizationId;
    return this.onboardingService.create(createOnboardingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all onboarding workflows' })
  findAll(@Query() paginationDto: PaginationDto, @CurrentUser() user: any) {
    return this.onboardingService.findAll(user.organizationId, paginationDto);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Get onboarding statistics' })
  getStats(@CurrentUser() user: any) {
    return this.onboardingService.getStats(user.organizationId);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get onboarding workflow by employee' })
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.onboardingService.findByEmployee(employeeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get onboarding workflow by ID' })
  findOne(@Param('id') id: string) {
    return this.onboardingService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update onboarding workflow' })
  update(@Param('id') id: string, @Body() updateOnboardingDto: UpdateOnboardingDto) {
    return this.onboardingService.update(id, updateOnboardingDto);
  }

  @Patch(':id/tasks/:taskId')
  @ApiOperation({ summary: 'Update task status' })
  updateTaskStatus(
    @Param('id') id: string,
    @Param('taskId') taskId: string,
    @Body() body: { status: string },
    @CurrentUser() user: any,
  ) {
    return this.onboardingService.updateTaskStatus(id, taskId, body.status, user.id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete onboarding workflow' })
  delete(@Param('id') id: string) {
    return this.onboardingService.delete(id);
  }
}
