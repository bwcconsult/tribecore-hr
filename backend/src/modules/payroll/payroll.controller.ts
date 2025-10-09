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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Payroll')
@Controller('payroll')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Create payroll record' })
  create(@Body() createPayrollDto: CreatePayrollDto, @CurrentUser() user: any) {
    createPayrollDto.organizationId = user.organizationId;
    return this.payrollService.create(createPayrollDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Get all payroll records' })
  findAll(@Query() paginationDto: PaginationDto, @CurrentUser() user: any) {
    return this.payrollService.findAll(user.organizationId, paginationDto);
  }

  @Get('summary')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Get payroll summary' })
  getSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @CurrentUser() user: any,
  ) {
    return this.payrollService.getPayrollSummary(
      user.organizationId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payroll record by ID' })
  findOne(@Param('id') id: string) {
    return this.payrollService.findOne(id);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get payroll records by employee' })
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.payrollService.findByEmployee(employeeId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Update payroll record' })
  update(@Param('id') id: string, @Body() updatePayrollDto: UpdatePayrollDto) {
    return this.payrollService.update(id, updatePayrollDto);
  }

  @Post(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Approve payroll' })
  approve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.payrollService.approvePayroll(id, user.id);
  }

  @Post(':id/process')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Process payroll payment' })
  process(@Param('id') id: string, @CurrentUser() user: any) {
    return this.payrollService.processPayroll(id, user.id);
  }

  @Get(':id/payslip')
  @ApiOperation({ summary: 'Generate payslip PDF' })
  generatePayslip(@Param('id') id: string) {
    return this.payrollService.generatePayslip(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete payroll record' })
  remove(@Param('id') id: string) {
    return this.payrollService.remove(id);
  }
}
