import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums';
import { ReimbursementService } from '../services/reimbursement.service';
import { CreateReimbursementDto } from '../dto/create-reimbursement.dto';
import { ReimbursementStatus } from '../enums/payment-method.enum';

@ApiTags('Expense Reimbursements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('expenses/reimbursements')
export class ReimbursementController {
  constructor(private readonly reimbursementService: ReimbursementService) {}

  @Post('claim/:claimId')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.FINANCE_MANAGER)
  @ApiOperation({ summary: 'Create reimbursement for approved claim' })
  @ApiResponse({ status: 201, description: 'Reimbursement created successfully' })
  async create(
    @Param('claimId') claimId: string,
    @Body() createDto: CreateReimbursementDto,
    @Request() req,
  ) {
    return this.reimbursementService.create(claimId, createDto, req.user.id);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.FINANCE_MANAGER)
  @ApiOperation({ summary: 'Get all reimbursements' })
  @ApiResponse({ status: 200, description: 'List of reimbursements' })
  async findAll(@Query('status') status?: ReimbursementStatus) {
    return this.reimbursementService.findAll(status);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.FINANCE_MANAGER)
  @ApiOperation({ summary: 'Get reimbursement statistics' })
  @ApiResponse({ status: 200, description: 'Reimbursement statistics' })
  async getStatistics() {
    return this.reimbursementService.getStatistics();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reimbursement by ID' })
  @ApiResponse({ status: 200, description: 'Reimbursement details' })
  async findOne(@Param('id') id: string) {
    return this.reimbursementService.findOne(id);
  }

  @Post(':id/mark-paid')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  @ApiOperation({ summary: 'Mark reimbursement as paid' })
  @ApiResponse({ status: 200, description: 'Reimbursement marked as paid' })
  async markAsPaid(
    @Param('id') id: string,
    @Body('paymentReference') paymentReference: string,
    @Request() req,
  ) {
    return this.reimbursementService.markAsPaid(id, req.user.id, paymentReference);
  }

  @Post('batch/:batchNumber/process')
  @Roles(UserRole.ADMIN, UserRole.FINANCE_MANAGER)
  @ApiOperation({ summary: 'Process a batch of reimbursements' })
  @ApiResponse({ status: 200, description: 'Batch processed successfully' })
  async processBatch(@Param('batchNumber') batchNumber: string, @Request() req) {
    return this.reimbursementService.processBatch(batchNumber, req.user.id);
  }
}
