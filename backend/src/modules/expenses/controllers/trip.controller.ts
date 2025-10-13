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
import { TripService } from '../services/trip.service';
import { CreateTripDto } from '../dto/create-trip.dto';
import { UpdateTripDto } from '../dto/update-trip.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { UserRole } from '../../../common/enums';

@ApiTags('Trips')
@Controller('expenses/trips')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new trip' })
  create(@Body() createTripDto: CreateTripDto, @CurrentUser() user: any) {
    createTripDto.employeeId = user.employeeId || user.id;
    createTripDto.organizationId = user.organizationId;
    return this.tripService.create(createTripDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Get all trips' })
  findAll(@Query() filters: any, @CurrentUser() user: any) {
    return this.tripService.findAll(user.organizationId, filters);
  }

  @Get('my-trips')
  @ApiOperation({ summary: 'Get my trips' })
  findMyTrips(@Query() filters: any, @CurrentUser() user: any) {
    return this.tripService.findByEmployee(user.employeeId || user.id, filters);
  }

  @Get('statistics')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Get trip statistics' })
  getStatistics(@CurrentUser() user: any) {
    return this.tripService.getStatistics(user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trip by ID' })
  findOne(@Param('id') id: string) {
    return this.tripService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update trip' })
  update(@Param('id') id: string, @Body() updateTripDto: UpdateTripDto) {
    return this.tripService.update(id, updateTripDto);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit trip for approval' })
  submit(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tripService.submit(id, user.id);
  }

  @Post(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Approve trip' })
  approve(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tripService.approve(id, user.id);
  }

  @Post(':id/reject')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Reject trip' })
  reject(@Param('id') id: string, @Body() body: { reason: string }, @CurrentUser() user: any) {
    return this.tripService.reject(id, user.id, body.reason);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Mark trip as in progress' })
  markAsInProgress(@Param('id') id: string) {
    return this.tripService.markAsInProgress(id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Mark trip as completed' })
  markAsCompleted(@Param('id') id: string, @Body() body: { actualCost?: number }) {
    return this.tripService.markAsCompleted(id, body.actualCost);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel trip' })
  cancel(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.tripService.cancel(id, body.reason);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete trip' })
  delete(@Param('id') id: string) {
    return this.tripService.delete(id);
  }
}
