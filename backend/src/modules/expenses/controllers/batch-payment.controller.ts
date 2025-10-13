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
import { BatchPaymentService } from '../services/batch-payment.service';
import { CreateBatchPaymentDto } from '../dto/create-batch-payment.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { BatchPaymentStatus } from '../entities/batch-payment.entity';

@Controller('expenses/batch-payments')
@UseGuards(JwtAuthGuard)
export class BatchPaymentController {
  constructor(private readonly batchPaymentService: BatchPaymentService) {}

  @Post()
  create(@Body() createBatchPaymentDto: CreateBatchPaymentDto, @Request() req) {
    return this.batchPaymentService.create(createBatchPaymentDto, req.user.id);
  }

  @Get()
  findAll(@Query('status') status?: BatchPaymentStatus) {
    return this.batchPaymentService.findAll({ status });
  }

  @Get('statistics')
  getStatistics() {
    return this.batchPaymentService.getStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.batchPaymentService.findOne(id);
  }

  @Post(':id/add-items')
  addItems(
    @Param('id') id: string,
    @Body('reimbursementIds') reimbursementIds: string[],
  ) {
    return this.batchPaymentService.addItems(id, reimbursementIds);
  }

  @Delete(':id/items/:itemId')
  removeItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    return this.batchPaymentService.removeItem(id, itemId);
  }

  @Patch(':id/ready')
  markReadyToProcess(@Param('id') id: string) {
    return this.batchPaymentService.markReadyToProcess(id);
  }

  @Patch(':id/process')
  process(@Param('id') id: string, @Request() req) {
    return this.batchPaymentService.process(id, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.batchPaymentService.remove(id);
  }
}
