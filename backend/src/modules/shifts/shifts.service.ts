import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Shift, ShiftStatus, ShiftType } from './entities/shift.entity';
import { Rota, RotaStatus } from './entities/rota.entity';
import { ShiftTemplate } from './entities/shift-template.entity';
import { CreateShiftDto, UpdateShiftDto, CreateRotaDto, AssignShiftDto, SwapShiftDto } from './dto/create-shift.dto';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(Shift)
    private shiftsRepository: Repository<Shift>,
    @InjectRepository(Rota)
    private rotasRepository: Repository<Rota>,
    @InjectRepository(ShiftTemplate)
    private templatesRepository: Repository<ShiftTemplate>,
  ) {}

  // ===== SHIFTS MANAGEMENT =====

  async createShift(createShiftDto: CreateShiftDto, createdBy: string): Promise<Shift> {
    const totalHours = this.calculateShiftHours(
      new Date(createShiftDto.startTime),
      new Date(createShiftDto.endTime),
      createShiftDto.breakDurationMinutes || 0,
    );

    const shift = this.shiftsRepository.create({
      ...createShiftDto,
      totalHours,
      assignedBy: createShiftDto.isOpenShift ? null : createdBy,
      assignedAt: createShiftDto.isOpenShift ? null : new Date(),
    });

    return this.shiftsRepository.save(shift);
  }

  async findAllShifts(filters: {
    organizationId?: string;
    employeeId?: string;
    department?: string;
    startDate?: Date;
    endDate?: Date;
    status?: ShiftStatus;
    isOpenShift?: boolean;
  }): Promise<Shift[]> {
    const queryBuilder = this.shiftsRepository.createQueryBuilder('shift');

    if (filters.employeeId) {
      queryBuilder.andWhere('shift.employeeId = :employeeId', { employeeId: filters.employeeId });
    }

    if (filters.department) {
      queryBuilder.andWhere('shift.department = :department', { department: filters.department });
    }

    if (filters.status) {
      queryBuilder.andWhere('shift.status = :status', { status: filters.status });
    }

    if (filters.isOpenShift !== undefined) {
      queryBuilder.andWhere('shift.isOpenShift = :isOpenShift', { isOpenShift: filters.isOpenShift });
    }

    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere('shift.startTime BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    return queryBuilder.orderBy('shift.startTime', 'ASC').getMany();
  }

  async findShiftById(id: string): Promise<Shift> {
    const shift = await this.shiftsRepository.findOne({ where: { id } });
    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }
    return shift;
  }

  async updateShift(id: string, updateShiftDto: UpdateShiftDto): Promise<Shift> {
    const shift = await this.findShiftById(id);

    if (updateShiftDto.startTime || updateShiftDto.endTime) {
      const startTime = updateShiftDto.startTime ? new Date(updateShiftDto.startTime) : shift.startTime;
      const endTime = updateShiftDto.endTime ? new Date(updateShiftDto.endTime) : shift.endTime;
      const breakMinutes = updateShiftDto.breakDurationMinutes ?? shift.breakDurationMinutes ?? 0;

      updateShiftDto['totalHours'] = this.calculateShiftHours(startTime, endTime, breakMinutes);
    }

    Object.assign(shift, updateShiftDto);
    return this.shiftsRepository.save(shift);
  }

  async deleteShift(id: string): Promise<void> {
    const shift = await this.findShiftById(id);
    await this.shiftsRepository.remove(shift);
  }

  async assignOpenShift(shiftId: string, assignDto: AssignShiftDto): Promise<Shift> {
    const shift = await this.findShiftById(shiftId);

    if (!shift.isOpenShift) {
      throw new BadRequestException('This is not an open shift');
    }

    shift.employeeId = assignDto.employeeId;
    shift.isOpenShift = false;
    shift.assignedBy = assignDto.assignedBy;
    shift.assignedAt = new Date();
    shift.status = ShiftStatus.PUBLISHED;

    return this.shiftsRepository.save(shift);
  }

  async requestShiftSwap(shiftId: string, swapDto: SwapShiftDto): Promise<void> {
    const shift = await this.findShiftById(shiftId);
    const targetShift = await this.findShiftById(swapDto.targetShiftId);

    if (shift.employeeId !== swapDto.requestedBy) {
      throw new BadRequestException('You can only request swaps for your own shifts');
    }

    shift.swapRequestedBy = swapDto.requestedBy;
    shift.swapRequestedAt = new Date();

    await this.shiftsRepository.save(shift);

    // TODO: Send notification to target employee and manager
  }

  async approveShiftSwap(shiftId: string, targetShiftId: string, approvedBy: string): Promise<void> {
    const shift1 = await this.findShiftById(shiftId);
    const shift2 = await this.findShiftById(targetShiftId);

    // Swap employees
    const tempEmployeeId = shift1.employeeId;
    shift1.employeeId = shift2.employeeId;
    shift2.employeeId = tempEmployeeId;

    shift1.isSwapApproved = true;
    shift2.isSwapApproved = true;
    shift1.swapRequestedBy = null;
    shift1.swapRequestedAt = null;

    await this.shiftsRepository.save([shift1, shift2]);

    // TODO: Send notifications
  }

  async publishShifts(shiftIds: string[]): Promise<void> {
    await this.shiftsRepository.update(
      { id: In(shiftIds) },
      { status: ShiftStatus.PUBLISHED },
    );

    // TODO: Send notifications to employees
  }

  // ===== ROTAS MANAGEMENT =====

  async createRota(createRotaDto: CreateRotaDto, createdBy: string): Promise<Rota> {
    const rota = this.rotasRepository.create({
      ...createRotaDto,
      createdBy,
      settings: createRotaDto.settings || {
        allowSwaps: true,
        requireApproval: true,
        autoAssignOpenShifts: false,
        notifyEmployees: true,
      },
    });

    return this.rotasRepository.save(rota);
  }

  async findAllRotas(organizationId: string): Promise<Rota[]> {
    return this.rotasRepository.find({
      where: { organizationId },
      order: { startDate: 'DESC' },
    });
  }

  async findRotaById(id: string): Promise<Rota> {
    const rota = await this.rotasRepository.findOne({ where: { id } });
    if (!rota) {
      throw new NotFoundException(`Rota with ID ${id} not found`);
    }
    return rota;
  }

  async getRotaWithShifts(rotaId: string): Promise<{ rota: Rota; shifts: Shift[] }> {
    const rota = await this.findRotaById(rotaId);
    const shifts = await this.shiftsRepository.find({
      where: { rotaId },
      order: { startTime: 'ASC' },
    });

    return { rota, shifts };
  }

  async publishRota(rotaId: string, publishedBy: string): Promise<Rota> {
    const rota = await this.findRotaById(rotaId);

    if (rota.status === RotaStatus.PUBLISHED) {
      throw new BadRequestException('Rota is already published');
    }

    rota.status = RotaStatus.PUBLISHED;
    rota.publishedBy = publishedBy;
    rota.publishedAt = new Date();

    // Publish all associated shifts
    await this.shiftsRepository.update(
      { rotaId },
      { status: ShiftStatus.PUBLISHED },
    );

    return this.rotasRepository.save(rota);
  }

  async deleteRota(id: string): Promise<void> {
    const rota = await this.findRotaById(id);

    // Delete associated shifts
    await this.shiftsRepository.delete({ rotaId: id });

    await this.rotasRepository.remove(rota);
  }

  // ===== SHIFT TEMPLATES =====

  async createTemplate(templateData: Partial<ShiftTemplate>): Promise<ShiftTemplate> {
    const template = this.templatesRepository.create(templateData);
    return this.templatesRepository.save(template);
  }

  async findAllTemplates(organizationId: string): Promise<ShiftTemplate[]> {
    return this.templatesRepository.find({
      where: { organizationId, isActive: true },
      order: { name: 'ASC' },
    });
  }

  // ===== ANALYTICS =====

  async getShiftAnalytics(filters: {
    organizationId: string;
    startDate: Date;
    endDate: Date;
    department?: string;
  }) {
    const shifts = await this.findAllShifts(filters);

    const totalShifts = shifts.length;
    const openShifts = shifts.filter((s) => s.isOpenShift).length;
    const completedShifts = shifts.filter((s) => s.status === ShiftStatus.COMPLETED).length;
    const totalHours = shifts.reduce((sum, s) => sum + Number(s.totalHours), 0);
    const overtimeHours = shifts
      .filter((s) => s.shiftType === ShiftType.OVERTIME)
      .reduce((sum, s) => sum + Number(s.totalHours), 0);

    const shiftsByEmployee = shifts.reduce((acc, shift) => {
      if (!shift.employeeId) return acc;
      if (!acc[shift.employeeId]) {
        acc[shift.employeeId] = { count: 0, hours: 0 };
      }
      acc[shift.employeeId].count++;
      acc[shift.employeeId].hours += Number(shift.totalHours);
      return acc;
    }, {} as Record<string, { count: number; hours: number }>);

    return {
      totalShifts,
      openShifts,
      completedShifts,
      totalHours,
      overtimeHours,
      shiftsByEmployee,
      coverageRate: totalShifts > 0 ? ((totalShifts - openShifts) / totalShifts) * 100 : 0,
    };
  }

  // ===== UTILITIES =====

  private calculateShiftHours(startTime: Date, endTime: Date, breakMinutes: number): number {
    const durationMs = endTime.getTime() - startTime.getTime();
    const totalMinutes = durationMs / (1000 * 60);
    const workingMinutes = totalMinutes - breakMinutes;
    return Number((workingMinutes / 60).toFixed(2));
  }

  async getEmployeeShiftHours(employeeId: string, startDate: Date, endDate: Date) {
    const shifts = await this.shiftsRepository.find({
      where: {
        employeeId,
        startTime: Between(startDate, endDate),
        status: In([ShiftStatus.PUBLISHED, ShiftStatus.COMPLETED]),
      },
    });

    const regularHours = shifts
      .filter((s) => s.shiftType === ShiftType.REGULAR)
      .reduce((sum, s) => sum + Number(s.totalHours), 0);

    const overtimeHours = shifts
      .filter((s) => s.shiftType === ShiftType.OVERTIME)
      .reduce((sum, s) => sum + Number(s.totalHours), 0);

    return {
      totalHours: regularHours + overtimeHours,
      regularHours,
      overtimeHours,
      shiftsCount: shifts.length,
    };
  }
}
