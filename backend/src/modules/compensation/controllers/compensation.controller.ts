import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CompensationService } from '../services/compensation.service';

@ApiTags('Compensation & Total Rewards')
@Controller('compensation')
export class CompensationController {
  constructor(private readonly compService: CompensationService) {}

  @Post('bands')
  @ApiOperation({ summary: 'Create compensation band' })
  async createBand(@Body() data: any) {
    return this.compService.createBand(data);
  }

  @Get('bands/:organizationId')
  @ApiOperation({ summary: 'Get compensation bands' })
  async getBands(@Param('organizationId') organizationId: string) {
    return this.compService.getBands(organizationId);
  }

  @Post('reviews')
  @ApiOperation({ summary: 'Create compensation review' })
  async createReview(@Body() data: any) {
    return this.compService.createReview(data);
  }

  @Get('reviews/employee/:employeeId')
  @ApiOperation({ summary: 'Get employee reviews' })
  async getEmployeeReviews(@Param('employeeId') employeeId: string) {
    return this.compService.getEmployeeReviews(employeeId);
  }

  @Get('reviews/pending/:organizationId')
  @ApiOperation({ summary: 'Get pending reviews' })
  async getPendingReviews(@Param('organizationId') organizationId: string) {
    return this.compService.getPendingReviews(organizationId);
  }

  @Post('reviews/:reviewId/approve')
  @ApiOperation({ summary: 'Approve review' })
  async approveReview(
    @Param('reviewId') reviewId: string,
    @Body('approvedBy') approvedBy: string,
  ) {
    return this.compService.approveReview(reviewId, approvedBy);
  }
}
