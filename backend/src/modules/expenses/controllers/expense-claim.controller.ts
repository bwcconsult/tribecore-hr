import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ExpenseClaimService } from '../services/expense-claim.service';
import { CreateExpenseClaimDto } from '../dto/create-expense-claim.dto';
import { UpdateExpenseClaimDto } from '../dto/update-expense-claim.dto';
import { ExpenseQueryDto } from '../dto/expense-query.dto';

@ApiTags('Expense Claims')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses/claims')
export class ExpenseClaimController {
  constructor(private readonly expenseClaimService: ExpenseClaimService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new expense claim' })
  @ApiResponse({ status: 201, description: 'Expense claim created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Request() req, @Body() createDto: CreateExpenseClaimDto) {
    return this.expenseClaimService.create(req.user.id, createDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all expense claims (with filters)' })
  @ApiResponse({ status: 200, description: 'List of expense claims' })
  async findAll(@Query() query: ExpenseQueryDto) {
    return this.expenseClaimService.findAll(query);
  }

  @Get('my-expenses')
  @ApiOperation({ summary: 'Get current user expense claims' })
  @ApiResponse({ status: 200, description: 'User expense claims' })
  async getMyExpenses(@Request() req, @Query() query: ExpenseQueryDto) {
    return this.expenseClaimService.getMyExpenses(req.user.id, query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get expense statistics' })
  @ApiResponse({ status: 200, description: 'Expense statistics' })
  async getStatistics(@Request() req, @Query('employeeId') employeeId?: string) {
    return this.expenseClaimService.getStatistics(employeeId || req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get expense claim by ID' })
  @ApiResponse({ status: 200, description: 'Expense claim details' })
  @ApiResponse({ status: 404, description: 'Expense claim not found' })
  async findOne(@Param('id') id: string) {
    return this.expenseClaimService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update expense claim' })
  @ApiResponse({ status: 200, description: 'Expense claim updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - only draft claims can be edited' })
  @ApiResponse({ status: 404, description: 'Expense claim not found' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateExpenseClaimDto,
    @Request() req,
  ) {
    return this.expenseClaimService.update(id, updateDto, req.user.id);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit expense claim for approval' })
  @ApiResponse({ status: 200, description: 'Expense claim submitted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - only draft claims can be submitted' })
  @ApiResponse({ status: 404, description: 'Expense claim not found' })
  async submit(@Param('id') id: string, @Request() req) {
    return this.expenseClaimService.submit(id, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete expense claim' })
  @ApiResponse({ status: 204, description: 'Expense claim deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - only draft/rejected claims can be deleted' })
  @ApiResponse({ status: 404, description: 'Expense claim not found' })
  async delete(@Param('id') id: string, @Request() req) {
    return this.expenseClaimService.delete(id, req.user.id);
  }
}
