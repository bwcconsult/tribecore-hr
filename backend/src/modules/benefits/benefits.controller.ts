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
import { BenefitsService } from './benefits.service';
import { CreateBenefitDto, CreateEmployeeBenefitDto } from './dto/create-benefit.dto';
import { UpdateBenefitDto, UpdateEmployeeBenefitDto } from './dto/update-benefit.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Benefits')
@Controller('benefits')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BenefitsController {
  constructor(private readonly benefitsService: BenefitsService) {}

  // Benefit Plan Endpoints
  @Post('plans')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Create benefit plan' })
  createBenefit(@Body() createBenefitDto: CreateBenefitDto, @CurrentUser() user: any) {
    createBenefitDto.organizationId = user.organizationId;
    return this.benefitsService.createBenefit(createBenefitDto);
  }

  @Get('plans')
  @ApiOperation({ summary: 'Get all benefit plans' })
  findAllBenefits(@Query() paginationDto: PaginationDto, @CurrentUser() user: any) {
    return this.benefitsService.findAllBenefits(user.organizationId, paginationDto);
  }

  @Get('plans/:id')
  @ApiOperation({ summary: 'Get benefit plan by ID' })
  findBenefitById(@Param('id') id: string) {
    return this.benefitsService.findBenefitById(id);
  }

  @Patch('plans/:id')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Update benefit plan' })
  updateBenefit(@Param('id') id: string, @Body() updateBenefitDto: UpdateBenefitDto) {
    return this.benefitsService.updateBenefit(id, updateBenefitDto);
  }

  @Delete('plans/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete benefit plan' })
  deleteBenefit(@Param('id') id: string) {
    return this.benefitsService.deleteBenefit(id);
  }

  // Employee Enrollment Endpoints
  @Post('enrollments')
  @ApiOperation({ summary: 'Enroll employee in benefit' })
  enrollEmployee(@Body() createEmployeeBenefitDto: CreateEmployeeBenefitDto) {
    return this.benefitsService.enrollEmployee(createEmployeeBenefitDto);
  }

  @Get('enrollments/employee/:employeeId')
  @ApiOperation({ summary: 'Get employee benefit enrollments' })
  findEmployeeBenefits(
    @Param('employeeId') employeeId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.benefitsService.findEmployeeBenefits(employeeId, paginationDto);
  }

  @Get('enrollments/:id')
  @ApiOperation({ summary: 'Get enrollment by ID' })
  findEmployeeBenefitById(@Param('id') id: string) {
    return this.benefitsService.findEmployeeBenefitById(id);
  }

  @Patch('enrollments/:id')
  @ApiOperation({ summary: 'Update enrollment' })
  updateEmployeeBenefit(
    @Param('id') id: string,
    @Body() updateEmployeeBenefitDto: UpdateEmployeeBenefitDto,
  ) {
    return this.benefitsService.updateEmployeeBenefit(id, updateEmployeeBenefitDto);
  }

  @Delete('enrollments/:id')
  @ApiOperation({ summary: 'Delete enrollment' })
  deleteEmployeeBenefit(@Param('id') id: string) {
    return this.benefitsService.deleteEmployeeBenefit(id);
  }
}
