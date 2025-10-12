import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { RecognitionService } from './recognition.service';
import { CreateRecognitionDto, CreateBadgeDto, AwardBadgeDto } from './dto/create-recognition.dto';

@Controller('recognition')
export class RecognitionController {
  constructor(private readonly recognitionService: RecognitionService) {}

  // ===== RECOGNITIONS =====

  @Post()
  async createRecognition(@Body() createDto: CreateRecognitionDto, @Request() req) {
    return this.recognitionService.createRecognition(createDto, req.user?.id || 'system');
  }

  @Get()
  async findAllRecognitions(
    @Query('organizationId') organizationId?: string,
    @Query('recipientId') recipientId?: string,
    @Query('giverId') giverId?: string,
    @Query('isPublic') isPublic?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.recognitionService.findAllRecognitions({
      organizationId,
      recipientId,
      giverId,
      isPublic: isPublic === 'true',
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get(':id')
  async getRecognitionById(@Param('id') id: string) {
    return this.recognitionService.getRecognitionById(id);
  }

  @Post(':id/like')
  async likeRecognition(@Param('id') id: string, @Request() req) {
    return this.recognitionService.likeRecognition(id, req.user?.id || 'anonymous');
  }

  @Delete(':id')
  async deleteRecognition(@Param('id') id: string) {
    await this.recognitionService.deleteRecognition(id);
    return { message: 'Recognition deleted successfully' };
  }

  // ===== BADGES =====

  @Post('badges')
  async createBadge(@Body() createDto: CreateBadgeDto) {
    return this.recognitionService.createBadge(createDto);
  }

  @Get('badges/organization/:organizationId')
  async findAllBadges(@Param('organizationId') organizationId: string) {
    return this.recognitionService.findAllBadges(organizationId);
  }

  @Get('badges/:id')
  async getBadgeById(@Param('id') id: string) {
    return this.recognitionService.getBadgeById(id);
  }

  @Post('badges/award')
  async awardBadge(@Body() awardDto: AwardBadgeDto, @Request() req) {
    return this.recognitionService.awardBadge(awardDto, req.user?.id || 'system');
  }

  @Get('employee/:employeeId/badges')
  async getEmployeeBadges(@Param('employeeId') employeeId: string) {
    return this.recognitionService.getEmployeeBadges(employeeId);
  }

  // ===== REWARD POINTS =====

  @Get('employee/:employeeId/points')
  async getEmployeePoints(
    @Param('employeeId') employeeId: string,
    @Query('organizationId') organizationId: string,
  ) {
    return this.recognitionService.getEmployeePoints(employeeId, organizationId);
  }

  @Get('employee/:employeeId/transactions')
  async getPointsTransactions(@Param('employeeId') employeeId: string) {
    return this.recognitionService.getPointsTransactions(employeeId);
  }

  @Post('employee/:employeeId/redeem')
  async redeemPoints(
    @Param('employeeId') employeeId: string,
    @Body() body: { points: number; redemptionId: string; description: string },
  ) {
    await this.recognitionService.redeemPoints(
      employeeId,
      body.points,
      body.redemptionId,
      body.description,
    );
    return { message: 'Points redeemed successfully' };
  }

  // ===== ANALYTICS =====

  @Get('analytics/overview')
  async getRecognitionAnalytics(
    @Query('organizationId') organizationId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.recognitionService.getRecognitionAnalytics(
      organizationId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('employee/:employeeId/stats')
  async getEmployeeRecognitionStats(@Param('employeeId') employeeId: string) {
    return this.recognitionService.getEmployeeRecognitionStats(employeeId);
  }
}
