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
  Request,
} from '@nestjs/common';
import { AdvanceService } from '../services/advance.service';
import { CreateAdvanceDto } from '../dto/create-advance.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { AdvanceStatus } from '../entities/advance.entity';

@Controller('expenses/advances')
@UseGuards(JwtAuthGuard)
export class AdvanceController {
  constructor(private readonly advanceService: AdvanceService) {}

  @Post()
  create(@Body() createAdvanceDto: CreateAdvanceDto, @Request() req) {
    return this.advanceService.create(createAdvanceDto, req.user.id);
  }

  @Get()
  findAll(
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: AdvanceStatus,
    @Query('tripId') tripId?: string,
  ) {
    return this.advanceService.findAll({ employeeId, status, tripId });
  }

  @Get('statistics')
  getStatistics(@Query('employeeId') employeeId?: string) {
    return this.advanceService.getStatistics({ employeeId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.advanceService.findOne(id);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @Request() req) {
    return this.advanceService.approve(id, req.user.id);
  }

  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    return this.advanceService.reject(id, req.user.id, reason);
  }

  @Patch(':id/mark-paid')
  markAsPaid(@Param('id') id: string) {
    return this.advanceService.markAsPaid(id);
  }

  @Patch(':id/settle')
  settle(
    @Param('id') id: string,
    @Body('settledAmount') settledAmount: number,
  ) {
    return this.advanceService.settle(id, settledAmount);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.advanceService.remove(id);
  }
}
