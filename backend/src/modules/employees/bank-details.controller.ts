import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BankDetailsService } from './bank-details.service';
import { CreateBankDetailsDto, UpdateBankDetailsDto, VerifyBankDetailsDto } from './dto/bank-details.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions, CanViewSelf } from '../../common/decorators/permissions.decorator';

@ApiTags('Bank Details')
@ApiBearerAuth()
@Controller('profile/bank-details')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BankDetailsController {
  constructor(private readonly bankDetailsService: BankDetailsService) {}

  @Get()
  @ApiOperation({ summary: 'Get own bank details' })
  @CanViewSelf('employee')
  async getMyBankDetails(@Req() req) {
    return this.bankDetailsService.getUserBankDetails(req.user.id);
  }

  @Get('primary')
  @ApiOperation({ summary: 'Get primary bank details' })
  @CanViewSelf('employee')
  async getPrimaryBankDetails(@Req() req) {
    return this.bankDetailsService.getPrimaryBankDetails(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create bank details' })
  @CanViewSelf('employee')
  async createBankDetails(@Req() req, @Body() dto: CreateBankDetailsDto) {
    return this.bankDetailsService.create(req.user.id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update bank details' })
  @CanViewSelf('employee')
  async updateBankDetails(
    @Param('id') id: string,
    @Req() req,
    @Body() dto: UpdateBankDetailsDto,
  ) {
    return this.bankDetailsService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete bank details' })
  @CanViewSelf('employee')
  async deleteBankDetails(@Param('id') id: string, @Req() req) {
    await this.bankDetailsService.delete(id, req.user.id);
    return { message: 'Bank details deleted successfully' };
  }

  @Get('admin/pending-verifications')
  @ApiOperation({ summary: 'Get pending verifications (admin/HR)' })
  @RequirePermissions({ feature: 'employee', action: 'update', scope: 'team' })
  async getPendingVerifications() {
    return this.bankDetailsService.getPendingVerifications();
  }

  @Post('admin/verify')
  @ApiOperation({ summary: 'Verify bank details (admin/HR)' })
  @RequirePermissions({ feature: 'employee', action: 'update', scope: 'team' })
  async verifyBankDetails(@Req() req, @Body() dto: VerifyBankDetailsDto) {
    return this.bankDetailsService.verify(dto, req.user.id);
  }

  @Post('admin/:id/reject')
  @ApiOperation({ summary: 'Reject bank details verification (admin/HR)' })
  @RequirePermissions({ feature: 'employee', action: 'update', scope: 'team' })
  async rejectVerification(
    @Param('id') id: string,
    @Req() req,
    @Body('reason') reason: string,
  ) {
    return this.bankDetailsService.rejectVerification(id, reason, req.user.id);
  }
}
