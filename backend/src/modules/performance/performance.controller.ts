import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PerformanceService } from './performance.service';
import { CreatePerformanceReviewDto } from './dto/create-performance.dto';
import { UpdatePerformanceReviewDto } from './dto/update-performance.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Performance')
@Controller('performance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PerformanceController {
  constructor(private readonly performanceService: PerformanceService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create performance review' })
  create(@Body() createDto: CreatePerformanceReviewDto) {
    return this.performanceService.create(createDto);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get performance reviews by employee' })
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.performanceService.findByEmployee(employeeId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get performance review by ID' })
  findOne(@Param('id') id: string) {
    return this.performanceService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update performance review' })
  update(@Param('id') id: string, @Body() updateDto: UpdatePerformanceReviewDto) {
    return this.performanceService.update(id, updateDto);
  }

  @Post(':id/acknowledge')
  @ApiOperation({ summary: 'Acknowledge performance review' })
  acknowledge(@Param('id') id: string) {
    return this.performanceService.acknowledgeReview(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete performance review' })
  remove(@Param('id') id: string) {
    return this.performanceService.remove(id);
  }
}
