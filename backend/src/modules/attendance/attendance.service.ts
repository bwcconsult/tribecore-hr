import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { ClockInDto } from './dto/clock-in.dto';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
  ) {}

  async clockIn(clockInDto: ClockInDto): Promise<Attendance> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already clocked in today
    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        employeeId: clockInDto.employeeId,
        date: today,
      },
    });

    if (existingAttendance && existingAttendance.clockIn) {
      throw new BadRequestException('Already clocked in today');
    }

    const clockInTime = new Date().toLocaleTimeString('en-GB', { hour12: false });
    
    const attendance = this.attendanceRepository.create({
      employeeId: clockInDto.employeeId,
      date: today,
      clockIn: clockInTime,
      status: 'PRESENT' as any,
      location: clockInDto.location,
      latitude: clockInDto.latitude,
      longitude: clockInDto.longitude,
      ipAddress: clockInDto.ipAddress,
    });

    return this.attendanceRepository.save(attendance);
  }

  async clockOut(employeeId: string): Promise<Attendance> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await this.attendanceRepository.findOne({
      where: {
        employeeId,
        date: today,
      },
    });

    if (!attendance) {
      throw new NotFoundException('No clock-in record found for today');
    }

    if (attendance.clockOut) {
      throw new BadRequestException('Already clocked out today');
    }

    const clockOutTime = new Date().toLocaleTimeString('en-GB', { hour12: false });
    attendance.clockOut = clockOutTime;

    // Calculate work minutes
    if (attendance.clockIn) {
      const clockIn = this.timeStringToMinutes(attendance.clockIn);
      const clockOut = this.timeStringToMinutes(clockOutTime);
      attendance.workMinutes = clockOut - clockIn;
    }

    return this.attendanceRepository.save(attendance);
  }

  async create(createAttendanceDto: CreateAttendanceDto): Promise<Attendance> {
    const attendance = this.attendanceRepository.create(createAttendanceDto);
    return this.attendanceRepository.save(attendance);
  }

  async findByEmployee(employeeId: string, startDate: Date, endDate: Date): Promise<Attendance[]> {
    return this.attendanceRepository
      .createQueryBuilder('attendance')
      .where('attendance.employeeId = :employeeId', { employeeId })
      .andWhere('attendance.date BETWEEN :startDate AND :endDate', { startDate, endDate })
      .orderBy('attendance.date', 'DESC')
      .getMany();
  }

  async getAttendanceSummary(employeeId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendances = await this.findByEmployee(employeeId, startDate, endDate);

    const present = attendances.filter((a) => a.status === 'PRESENT' as any).length;
    const absent = attendances.filter((a) => a.status === 'ABSENT' as any).length;
    const late = attendances.filter((a) => a.status === 'LATE' as any).length;
    const onLeave = attendances.filter((a) => a.status === 'ON_LEAVE' as any).length;

    const totalWorkMinutes = attendances.reduce((sum, a) => sum + (a.workMinutes || 0), 0);

    return {
      totalDays: attendances.length,
      present,
      absent,
      late,
      onLeave,
      totalWorkHours: (totalWorkMinutes / 60).toFixed(2),
    };
  }

  private timeStringToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }
}
