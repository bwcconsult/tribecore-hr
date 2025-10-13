import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LearningEnhancedService } from '../services/learning-enhanced.service';
import {
  CreateModuleDto,
  UpdateModuleDto,
  CreateLessonDto,
  UpdateLessonDto,
  StartLessonDto,
  UpdateProgressDto,
  SubmitQuizDto,
  CreateMandatoryTrainingDto,
  UpdateMandatoryTrainingDto,
} from '../dto/learning-enhanced.dto';

@Controller('learning-enhanced')
export class LearningEnhancedController {
  constructor(private readonly learningEnhancedService: LearningEnhancedService) {}

  // Course Module Endpoints
  @Post('courses/:courseId/modules')
  async createModule(
    @Param('courseId') courseId: string,
    @Body() createModuleDto: CreateModuleDto,
  ) {
    return await this.learningEnhancedService.createModule(courseId, createModuleDto);
  }

  @Get('courses/:courseId/modules')
  async getCourseModules(@Param('courseId') courseId: string) {
    return await this.learningEnhancedService.getCourseModules(courseId);
  }

  @Patch('modules/:id')
  async updateModule(@Param('id') id: string, @Body() updateModuleDto: UpdateModuleDto) {
    return await this.learningEnhancedService.updateModule(id, updateModuleDto);
  }

  @Delete('modules/:id')
  async deleteModule(@Param('id') id: string) {
    await this.learningEnhancedService.deleteModule(id);
    return { message: 'Module deleted successfully' };
  }

  // Lesson Endpoints
  @Post('modules/:moduleId/lessons')
  async createLesson(
    @Param('moduleId') moduleId: string,
    @Body() createLessonDto: CreateLessonDto,
  ) {
    return await this.learningEnhancedService.createLesson(moduleId, createLessonDto);
  }

  @Get('modules/:moduleId/lessons')
  async getModuleLessons(@Param('moduleId') moduleId: string) {
    return await this.learningEnhancedService.getModuleLessons(moduleId);
  }

  @Get('lessons/:id')
  async getLessonById(@Param('id') id: string) {
    return await this.learningEnhancedService.getLessonById(id);
  }

  @Patch('lessons/:id')
  async updateLesson(@Param('id') id: string, @Body() updateLessonDto: UpdateLessonDto) {
    return await this.learningEnhancedService.updateLesson(id, updateLessonDto);
  }

  @Delete('lessons/:id')
  async deleteLesson(@Param('id') id: string) {
    await this.learningEnhancedService.deleteLesson(id);
    return { message: 'Lesson deleted successfully' };
  }

  // Progress Tracking Endpoints
  @Post('progress/start')
  async startLesson(@Body() startLessonDto: StartLessonDto) {
    return await this.learningEnhancedService.startLesson(
      startLessonDto.enrollmentId,
      startLessonDto.lessonId,
      startLessonDto.employeeId,
    );
  }

  @Patch('progress/:progressId')
  async updateLessonProgress(
    @Param('progressId') progressId: string,
    @Body() updateProgressDto: UpdateProgressDto,
  ) {
    return await this.learningEnhancedService.updateLessonProgress(progressId, updateProgressDto);
  }

  @Post('progress/:progressId/quiz')
  async submitQuiz(
    @Param('progressId') progressId: string,
    @Body() submitQuizDto: SubmitQuizDto,
  ) {
    return await this.learningEnhancedService.submitQuiz(progressId, submitQuizDto.answers);
  }

  @Post('progress/:progressId/complete')
  async completeLesson(@Param('progressId') progressId: string) {
    return await this.learningEnhancedService.completeLesson(progressId);
  }

  @Get('enrollments/:enrollmentId/progress')
  async getEnrollmentProgress(@Param('enrollmentId') enrollmentId: string) {
    return await this.learningEnhancedService.getEnrollmentProgress(enrollmentId);
  }

  // Mandatory Training Endpoints
  @Post('mandatory-training')
  async createMandatoryTraining(@Body() createDto: CreateMandatoryTrainingDto) {
    return await this.learningEnhancedService.createMandatoryTraining(createDto);
  }

  @Get('mandatory-training')
  async getAllMandatoryTraining() {
    return await this.learningEnhancedService.getAllMandatoryTraining();
  }

  @Get('mandatory-training/:id')
  async getMandatoryTrainingById(@Param('id') id: string) {
    return await this.learningEnhancedService.getMandatoryTrainingById(id);
  }

  // Dashboard Endpoints
  @Get('compliance/dashboard')
  async getComplianceDashboard(@Query('organizationId') organizationId: string) {
    return await this.learningEnhancedService.getComplianceDashboard(organizationId);
  }

  @Get('employee/:employeeId/dashboard')
  async getEmployeeLearningDashboard(@Param('employeeId') employeeId: string) {
    return await this.learningEnhancedService.getEmployeeLearningDashboard(employeeId);
  }
}
