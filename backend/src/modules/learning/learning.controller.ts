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
import { LearningService } from './learning.service';
import { CreateCourseDto, CreateEnrollmentDto } from './dto/create-course.dto';
import { UpdateCourseDto, UpdateEnrollmentDto } from './dto/update-course.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Learning')
@Controller('learning')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LearningController {
  constructor(private readonly learningService: LearningService) {}

  // Course Endpoints
  @Post('courses')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Create course' })
  createCourse(@Body() createCourseDto: CreateCourseDto, @CurrentUser() user: any) {
    createCourseDto.organizationId = user.organizationId;
    return this.learningService.createCourse(createCourseDto);
  }

  @Get('courses')
  @ApiOperation({ summary: 'Get all courses' })
  findAllCourses(@Query() paginationDto: PaginationDto, @CurrentUser() user: any) {
    return this.learningService.findAllCourses(user.organizationId, paginationDto);
  }

  @Get('courses/stats')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Get learning statistics' })
  getStats(@CurrentUser() user: any) {
    return this.learningService.getStats(user.organizationId);
  }

  @Get('courses/:id')
  @ApiOperation({ summary: 'Get course by ID' })
  findCourseById(@Param('id') id: string) {
    return this.learningService.findCourseById(id);
  }

  @Patch('courses/:id')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Update course' })
  updateCourse(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.learningService.updateCourse(id, updateCourseDto);
  }

  @Delete('courses/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete course' })
  deleteCourse(@Param('id') id: string) {
    return this.learningService.deleteCourse(id);
  }

  // Enrollment Endpoints
  @Post('enrollments')
  @ApiOperation({ summary: 'Enroll in course' })
  enrollEmployee(@Body() createEnrollmentDto: CreateEnrollmentDto, @CurrentUser() user: any) {
    if (!createEnrollmentDto.employeeId) {
      createEnrollmentDto.employeeId = user.employeeId || user.id;
    }
    return this.learningService.enrollEmployee(createEnrollmentDto);
  }

  @Get('enrollments/course/:courseId')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Get enrollments for course' })
  findEnrollmentsByCourse(
    @Param('courseId') courseId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.learningService.findEnrollmentsByCourse(courseId, paginationDto);
  }

  @Get('enrollments/my-courses')
  @ApiOperation({ summary: 'Get my course enrollments' })
  findMyEnrollments(@Query() paginationDto: PaginationDto, @CurrentUser() user: any) {
    return this.learningService.findEnrollmentsByEmployee(user.employeeId || user.id, paginationDto);
  }

  @Get('enrollments/:id')
  @ApiOperation({ summary: 'Get enrollment by ID' })
  findEnrollmentById(@Param('id') id: string) {
    return this.learningService.findEnrollmentById(id);
  }

  @Patch('enrollments/:id')
  @ApiOperation({ summary: 'Update enrollment' })
  updateEnrollment(@Param('id') id: string, @Body() updateEnrollmentDto: UpdateEnrollmentDto) {
    return this.learningService.updateEnrollment(id, updateEnrollmentDto);
  }

  @Post('enrollments/:id/progress')
  @ApiOperation({ summary: 'Update course progress' })
  updateProgress(
    @Param('id') id: string,
    @Body() body: { completedLessons: string[]; progressPercentage: number },
  ) {
    return this.learningService.updateProgress(id, body.completedLessons, body.progressPercentage);
  }

  @Delete('enrollments/:id')
  @ApiOperation({ summary: 'Delete enrollment' })
  deleteEnrollment(@Param('id') id: string) {
    return this.learningService.deleteEnrollment(id);
  }
}
