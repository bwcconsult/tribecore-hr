import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DelegateService } from '../services/delegate.service';
import { CreateDelegateDto } from '../dto/create-delegate.dto';
import { CreateOutOfOfficeDto } from '../dto/create-out-of-office.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Expense Delegates')
@Controller('expenses/delegates')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DelegateController {
  constructor(private readonly delegateService: DelegateService) {}

  // Delegate Management
  @Post()
  @ApiOperation({ summary: 'Create a new delegate' })
  createDelegate(@Body() createDelegateDto: CreateDelegateDto, @CurrentUser() user: any) {
    createDelegateDto.employeeId = user.employeeId || user.id;
    createDelegateDto.organizationId = user.organizationId;
    return this.delegateService.createDelegate(createDelegateDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get my delegates' })
  findMyDelegates(@CurrentUser() user: any) {
    return this.delegateService.findAllDelegates(user.employeeId || user.id);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get my active delegates' })
  findActiveDelegates(@CurrentUser() user: any) {
    return this.delegateService.findActiveDelegates(user.employeeId || user.id);
  }

  @Get('delegating-for')
  @ApiOperation({ summary: 'Get users I am delegating for' })
  findDelegatesFor(@CurrentUser() user: any) {
    return this.delegateService.findDelegatesFor(user.employeeId || user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update delegate' })
  updateDelegate(@Param('id') id: string, @Body() updateData: Partial<CreateDelegateDto>) {
    return this.delegateService.updateDelegate(id, updateData);
  }

  @Post(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate delegate' })
  deactivateDelegate(@Param('id') id: string) {
    return this.delegateService.deactivateDelegate(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete delegate' })
  deleteDelegate(@Param('id') id: string) {
    return this.delegateService.deleteDelegate(id);
  }

  // Out of Office Management
  @Post('out-of-office')
  @ApiOperation({ summary: 'Create out of office' })
  createOutOfOffice(@Body() createOutOfOfficeDto: CreateOutOfOfficeDto, @CurrentUser() user: any) {
    createOutOfOfficeDto.employeeId = user.employeeId || user.id;
    createOutOfOfficeDto.organizationId = user.organizationId;
    return this.delegateService.createOutOfOffice(createOutOfOfficeDto);
  }

  @Get('out-of-office')
  @ApiOperation({ summary: 'Get my out of office periods' })
  findMyOutOfOffice(@CurrentUser() user: any) {
    return this.delegateService.findAllOutOfOffice(user.employeeId || user.id);
  }

  @Get('out-of-office/active')
  @ApiOperation({ summary: 'Get my active out of office' })
  findActiveOutOfOffice(@CurrentUser() user: any) {
    return this.delegateService.findActiveOutOfOffice(user.employeeId || user.id);
  }

  @Get('out-of-office/substitute-for')
  @ApiOperation({ summary: 'Get users I am substituting for' })
  findSubstituteFor(@CurrentUser() user: any) {
    return this.delegateService.findSubstituteFor(user.employeeId || user.id);
  }

  @Patch('out-of-office/:id')
  @ApiOperation({ summary: 'Update out of office' })
  updateOutOfOffice(@Param('id') id: string, @Body() updateData: Partial<CreateOutOfOfficeDto>) {
    return this.delegateService.updateOutOfOffice(id, updateData);
  }

  @Post('out-of-office/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate out of office' })
  deactivateOutOfOffice(@Param('id') id: string) {
    return this.delegateService.deactivateOutOfOffice(id);
  }

  @Delete('out-of-office/:id')
  @ApiOperation({ summary: 'Delete out of office' })
  deleteOutOfOffice(@Param('id') id: string) {
    return this.delegateService.deleteOutOfOffice(id);
  }
}
