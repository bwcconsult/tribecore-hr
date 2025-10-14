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
import { ContractorsService } from './contractors.service';
import { CreateContractorDto } from './dto/create-contractor.dto';
import { UpdateContractorDto } from './dto/update-contractor.dto';

@Controller('contractors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractorsController {
  constructor(private readonly contractorsService: ContractorsService) {}

  @Post()
  @Roles('HR_ADMIN', 'MANAGER')
  create(@Body() createDto: CreateContractorDto) {
    return this.contractorsService.create(createDto);
  }

  @Get()
  findAll(@Query('organizationId') organizationId: string, @Query() filters: any) {
    return this.contractorsService.findAll(organizationId, filters);
  }

  @Get('stats/:organizationId')
  getStats(@Param('organizationId') organizationId: string) {
    return this.contractorsService.getStats(organizationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contractorsService.findOne(id);
  }

  @Patch(':id')
  @Roles('HR_ADMIN', 'MANAGER')
  update(@Param('id') id: string, @Body() updateDto: UpdateContractorDto) {
    return this.contractorsService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles('HR_ADMIN')
  remove(@Param('id') id: string) {
    return this.contractorsService.remove(id);
  }

  // Payments
  @Get(':id/payments')
  getPayments(@Param('id') id: string) {
    return this.contractorsService.getPayments(id);
  }

  @Post(':id/payments')
  @Roles('HR_ADMIN', 'FINANCE')
  createPayment(@Param('id') id: string, @Body() paymentData: any) {
    return this.contractorsService.createPayment(id, paymentData);
  }

  // Invoices
  @Get(':id/invoices')
  getInvoices(@Param('id') id: string) {
    return this.contractorsService.getInvoices(id);
  }

  @Post(':id/invoices')
  @Roles('HR_ADMIN', 'FINANCE')
  generateInvoice(@Param('id') id: string, @Body() invoiceData: any) {
    return this.contractorsService.generateInvoice(id, invoiceData);
  }

  @Patch('invoices/:invoiceId/mark-paid')
  @Roles('HR_ADMIN', 'FINANCE')
  markInvoicePaid(
    @Param('invoiceId') invoiceId: string,
    @Body('paidDate') paidDate: Date,
  ) {
    return this.contractorsService.markInvoicePaid(invoiceId, paidDate);
  }

  // IR35 Assessment
  @Post(':id/ir35-assessment')
  @Roles('HR_ADMIN', 'LEGAL')
  assessIR35(
    @Param('id') id: string,
    @Body() assessment: { status: string; notes?: string },
  ) {
    return this.contractorsService.assessIR35(id, assessment as any);
  }

  @Get('ir35/report/:organizationId')
  @Roles('HR_ADMIN', 'LEGAL')
  getIR35Report(@Param('organizationId') organizationId: string) {
    return this.contractorsService.getIR35Report(organizationId);
  }
}
