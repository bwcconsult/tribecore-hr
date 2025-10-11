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
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Expenses')
@Controller('expenses')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Create expense claim' })
  create(@Body() createExpenseDto: CreateExpenseDto, @CurrentUser() user: any) {
    createExpenseDto.employeeId = user.employeeId || user.id;
    createExpenseDto.organizationId = user.organizationId;
    return this.expensesService.create(createExpenseDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Get all expenses' })
  findAll(@Query() paginationDto: PaginationDto, @CurrentUser() user: any) {
    return this.expensesService.findAll(user.organizationId, paginationDto);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Get expense statistics' })
  getStats(@CurrentUser() user: any) {
    return this.expensesService.getStats(user.organizationId);
  }

  @Get('my-expenses')
  @ApiOperation({ summary: 'Get my expenses' })
  findMyExpenses(@Query() paginationDto: PaginationDto, @CurrentUser() user: any) {
    return this.expensesService.findByEmployee(user.employeeId || user.id, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense by ID' })
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update expense' })
  update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto) {
    return this.expensesService.update(id, updateExpenseDto);
  }

  @Post(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Approve expense' })
  approve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.expensesService.approve(id, user.id);
  }

  @Post(':id/reject')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Reject expense' })
  reject(@Param('id') id: string, @Body() body: { reason: string }, @CurrentUser() user: any) {
    return this.expensesService.reject(id, user.id, body.reason);
  }

  @Post(':id/pay')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Mark expense as paid' })
  markAsPaid(@Param('id') id: string, @Body() body: { paymentReference: string }) {
    return this.expensesService.markAsPaid(id, body.paymentReference);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete expense' })
  delete(@Param('id') id: string) {
    return this.expensesService.delete(id);
  }
}
