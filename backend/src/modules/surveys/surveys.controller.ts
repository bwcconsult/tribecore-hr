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
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SurveysService } from './surveys.service';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { SubmitResponseDto } from './dto/submit-response.dto';

@Controller('surveys')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Post()
  @Roles('HR_ADMIN', 'MANAGER')
  create(@Body() createDto: CreateSurveyDto) {
    return this.surveysService.create(createDto);
  }

  @Get()
  findAll(@Query('organizationId') organizationId: string, @Query() filters: any) {
    return this.surveysService.findAll(organizationId, filters);
  }

  @Get('stats/:organizationId')
  getStats(@Param('organizationId') organizationId: string) {
    return this.surveysService.getStats(organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.surveysService.findOne(id);
  }

  @Patch(':id')
  @Roles('HR_ADMIN', 'MANAGER')
  update(@Param('id') id: string, @Body() updateDto: UpdateSurveyDto) {
    return this.surveysService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('HR_ADMIN')
  remove(@Param('id') id: string) {
    return this.surveysService.remove(id);
  }

  @Post(':id/publish')
  @Roles('HR_ADMIN', 'MANAGER')
  publish(@Param('id') id: string) {
    return this.surveysService.publish(id);
  }

  @Post(':id/close')
  @Roles('HR_ADMIN', 'MANAGER')
  close(@Param('id') id: string) {
    return this.surveysService.close(id);
  }

  // Response endpoints
  @Post('responses')
  submitResponse(@Body() responseDto: SubmitResponseDto) {
    return this.surveysService.submitResponse(responseDto);
  }

  @Get(':id/responses')
  @Roles('HR_ADMIN', 'MANAGER')
  getResponses(@Param('id') id: string) {
    return this.surveysService.getResponses(id);
  }

  @Get(':id/analytics')
  @Roles('HR_ADMIN', 'MANAGER')
  getAnalytics(@Param('id') id: string) {
    return this.surveysService.getAnalytics(id);
  }

  @Get(':surveyId/check-response/:employeeId')
  checkEmployeeResponse(
    @Param('surveyId') surveyId: string,
    @Param('employeeId') employeeId: string,
  ) {
    return this.surveysService.checkEmployeeResponse(surveyId, employeeId);
  }
}
