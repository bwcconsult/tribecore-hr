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
import { MileageService } from '../services/mileage.service';
import { CreateMileageDto } from '../dto/create-mileage.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enums';

@ApiTags('Mileage')
@Controller('expenses/mileage')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MileageController {
  constructor(private readonly mileageService: MileageService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new mileage claim' })
  create(@Body() createMileageDto: CreateMileageDto, @CurrentUser() user: any) {
    createMileageDto.employeeId = user.employeeId || user.id;
    createMileageDto.organizationId = user.organizationId;
    return this.mileageService.create(createMileageDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Get all mileage claims' })
  findAll(@Query() filters: any, @CurrentUser() user: any) {
    return this.mileageService.findAll(user.organizationId, filters);
  }

  @Get('my-mileage')
  @ApiOperation({ summary: 'Get my mileage claims' })
  findMyMileage(@Query() filters: any, @CurrentUser() user: any) {
    return this.mileageService.findByEmployee(user.employeeId || user.id, filters);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Get mileage statistics' })
  getStatistics(@CurrentUser() user: any) {
    return this.mileageService.getStatistics(user.organizationId);
  }

  @Get('calculate-rate')
  @ApiOperation({ summary: 'Calculate mileage rate' })
  calculateRate(@Query('vehicleType') vehicleType: string, @Query('distance') distance: number) {
    return this.mileageService.calculateMileageRate(vehicleType, Number(distance));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get mileage claim by ID' })
  findOne(@Param('id') id: string) {
    return this.mileageService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update mileage claim' })
  update(@Param('id') id: string, @Body() updateData: Partial<CreateMileageDto>) {
    return this.mileageService.update(id, updateData);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit mileage claim' })
  submit(@Param('id') id: string) {
    return this.mileageService.submit(id);
  }

  @Post(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Approve mileage claim' })
  approve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.mileageService.approve(id, user.id);
  }

  @Post(':id/reject')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Reject mileage claim' })
  reject(@Param('id') id: string, @Body() body: { reason: string }, @CurrentUser() user: any) {
    return this.mileageService.reject(id, user.id, body.reason);
  }

  @Post(':id/pay')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Mark mileage claim as paid' })
  markAsPaid(@Param('id') id: string) {
    return this.mileageService.markAsPaid(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete mileage claim' })
  delete(@Param('id') id: string) {
    return this.mileageService.delete(id);
  }
}
