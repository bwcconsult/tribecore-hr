import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { ClockInDto } from './dto/clock-in.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Attendance')
@Controller('attendance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('clock-in')
  @ApiOperation({ summary: 'Clock in' })
  clockIn(@Body() clockInDto: ClockInDto) {
    return this.attendanceService.clockIn(clockInDto);
  }

  @Post('clock-out/:employeeId')
  @ApiOperation({ summary: 'Clock out' })
  clockOut(@Param('employeeId') employeeId: string) {
    return this.attendanceService.clockOut(employeeId);
  }

  @Post()
  @ApiOperation({ summary: 'Create attendance record' })
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @Get('employee/:employeeId')
  @ApiOperation({ summary: 'Get attendance by employee' })
  findByEmployee(
    @Param('employeeId') employeeId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.attendanceService.findByEmployee(
      employeeId,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('summary/:employeeId')
  @ApiOperation({ summary: 'Get attendance summary' })
  getSummary(
    @Param('employeeId') employeeId: string,
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.attendanceService.getAttendanceSummary(
      employeeId,
      month || new Date().getMonth() + 1,
      year || new Date().getFullYear(),
    );
  }
}
