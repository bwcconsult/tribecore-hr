import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ApprovalService } from '../services/approval.service';
import { ApproveExpenseDto } from '../dto/approve-expense.dto';

@ApiTags('Expense Approvals')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses/approvals')
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Get('pending')
  @ApiOperation({ summary: 'Get pending approvals for current user' })
  @ApiResponse({ status: 200, description: 'List of pending approvals' })
  async getPendingApprovals(@Request() req) {
    return this.approvalService.getPendingApprovals(req.user.id);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get approval statistics' })
  @ApiResponse({ status: 200, description: 'Approval statistics' })
  async getStatistics(@Request() req) {
    return this.approvalService.getApprovalStatistics(req.user.id);
  }

  @Get('claim/:claimId')
  @ApiOperation({ summary: 'Get approval history for a claim' })
  @ApiResponse({ status: 200, description: 'Approval history' })
  async getApprovalHistory(@Param('claimId') claimId: string) {
    return this.approvalService.getApprovalHistory(claimId);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve or reject an expense' })
  @ApiResponse({ status: 200, description: 'Approval processed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Approval not found' })
  async approve(
    @Param('id') id: string,
    @Body() approveDto: ApproveExpenseDto,
    @Request() req,
  ) {
    return this.approvalService.approve(
      id,
      req.user.id,
      approveDto,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post(':id/delegate')
  @ApiOperation({ summary: 'Delegate approval to another user' })
  @ApiResponse({ status: 200, description: 'Approval delegated successfully' })
  async delegate(
    @Param('id') id: string,
    @Body('toUserId') toUserId: string,
    @Request() req,
  ) {
    return this.approvalService.delegateApproval(id, req.user.id, toUserId);
  }
}
