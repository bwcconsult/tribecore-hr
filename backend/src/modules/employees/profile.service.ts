import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './entities/employee.entity';
import { EmploymentActivity } from './entities/employment-activity.entity';
import { WorkSchedule } from './entities/work-schedule.entity';
import { EmergencyContact } from './entities/emergency-contact.entity';
import { Dependant } from './entities/dependant.entity';
import {
  UpdateProfileDto,
  UpdateEmploymentDto,
  CreateEmploymentActivityDto,
  CreateWorkScheduleDto,
  CreateEmergencyContactDto,
  CreateDependantDto,
} from './dto/profile-update.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(EmploymentActivity)
    private readonly activityRepository: Repository<EmploymentActivity>,
    @InjectRepository(WorkSchedule)
    private readonly scheduleRepository: Repository<WorkSchedule>,
    @InjectRepository(EmergencyContact)
    private readonly emergencyContactRepository: Repository<EmergencyContact>,
    @InjectRepository(Dependant)
    private readonly dependantRepository: Repository<Dependant>,
  ) {}

  /**
   * Get employee profile with GDPR compliance
   */
  async getProfile(employeeId: string, currentUser: any) {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
      relations: ['user', 'manager'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee not found`);
    }

    // GDPR: Check access permission
    const canViewFull = this.canViewFullProfile(employeeId, currentUser);

    if (!canViewFull) {
      // Return limited profile
      return this.getLimitedProfile(employee);
    }

    // Get related data
    const [activities, schedules, emergencyContacts, dependants] = await Promise.all([
      this.activityRepository.find({
        where: { personId: employeeId },
        order: { date: 'DESC' },
        take: 20,
      }),
      this.scheduleRepository.find({
        where: { personId: employeeId, isActive: true },
        order: { weekday: 'ASC' },
      }),
      this.emergencyContactRepository.find({
        where: { personId: employeeId },
        order: { isPrimary: 'DESC' },
      }),
      this.dependantRepository.find({
        where: { personId: employeeId },
        order: { dateOfBirth: 'DESC' },
      }),
    ]);

    return {
      employee,
      activities,
      schedules,
      emergencyContacts,
      dependants,
    };
  }

  /**
   * Update employee profile
   */
  async updateProfile(employeeId: string, dto: UpdateProfileDto, currentUser: any) {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee not found`);
    }

    // GDPR: Check permission
    if (employeeId !== currentUser.employeeId && currentUser.role !== 'HR_MANAGER' && currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('You do not have permission to update this profile');
    }

    // Update employee record
    Object.assign(employee, dto);
    employee.modifiedBy = currentUser.id;

    return await this.employeeRepository.save(employee);
  }

  /**
   * Update employment details
   */
  async updateEmployment(employeeId: string, dto: UpdateEmploymentDto, currentUser: any) {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee not found`);
    }

    // Only HR/Admin can update employment
    if (currentUser.role !== 'HR_MANAGER' && currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('You do not have permission to update employment details');
    }

    // Create activity record for significant changes
    if (dto.department || dto.jobTitle) {
      await this.createActivity({
        personId: employeeId,
        date: new Date().toISOString(),
        type: dto.jobTitle ? 'ROLE_CHANGE' : 'DEPARTMENT_TRANSFER',
        description: `Updated by ${currentUser.name}`,
        payload: {
          previousRole: employee.jobTitle,
          newRole: dto.jobTitle,
          previousDepartment: employee.department,
          newDepartment: dto.department,
        },
      }, currentUser);
    }

    Object.assign(employee, dto);
    employee.modifiedBy = currentUser.id;

    return await this.employeeRepository.save(employee);
  }

  /**
   * Create employment activity
   */
  async createActivity(dto: CreateEmploymentActivityDto, currentUser: any) {
    const activity = this.activityRepository.create({
      ...dto,
      createdBy: currentUser.id,
    });
    return await this.activityRepository.save(activity);
  }

  /**
   * Get employment timeline
   */
  async getEmploymentTimeline(employeeId: string, currentUser: any) {
    // Check permission
    this.canViewFullProfile(employeeId, currentUser);

    return await this.activityRepository.find({
      where: { personId: employeeId },
      order: { date: 'DESC' },
    });
  }

  /**
   * Create/Update work schedule
   */
  async upsertWorkSchedule(dto: CreateWorkScheduleDto, currentUser: any) {
    // Only HR/Admin can manage schedules
    if (currentUser.role !== 'HR_MANAGER' && currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('You do not have permission to manage work schedules');
    }

    // Check if schedule exists for this day
    const existing = await this.scheduleRepository.findOne({
      where: {
        personId: dto.personId,
        weekday: dto.weekday as any,
        isActive: true,
      },
    });

    if (existing) {
      // Update existing
      Object.assign(existing, dto);
      existing.modifiedBy = currentUser.id;
      return await this.scheduleRepository.save(existing);
    }

    // Create new
    const schedule = this.scheduleRepository.create({
      ...dto,
      createdBy: currentUser.id,
    });
    return await this.scheduleRepository.save(schedule);
  }

  /**
   * Get work schedule
   */
  async getWorkSchedule(employeeId: string) {
    return await this.scheduleRepository.find({
      where: { personId: employeeId, isActive: true },
      order: { weekday: 'ASC' },
    });
  }

  /**
   * Create emergency contact
   */
  async createEmergencyContact(dto: CreateEmergencyContactDto, currentUser: any) {
    // Can create for self or if HR/Admin
    if (dto.personId !== currentUser.employeeId && currentUser.role !== 'HR_MANAGER' && currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('You do not have permission to add emergency contacts for this employee');
    }

    const contact = this.emergencyContactRepository.create({
      ...dto,
      createdBy: currentUser.id,
    });
    return await this.emergencyContactRepository.save(contact);
  }

  /**
   * Get emergency contacts
   */
  async getEmergencyContacts(employeeId: string, currentUser: any) {
    // Check permission
    if (employeeId !== currentUser.employeeId && currentUser.role !== 'HR_MANAGER' && currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('You do not have permission to view emergency contacts');
    }

    return await this.emergencyContactRepository.find({
      where: { personId: employeeId },
      order: { isPrimary: 'DESC', createdAt: 'ASC' },
    });
  }

  /**
   * Create dependant
   */
  async createDependant(dto: CreateDependantDto, currentUser: any) {
    // Can create for self or if HR/Admin
    if (dto.personId !== currentUser.employeeId && currentUser.role !== 'HR_MANAGER' && currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('You do not have permission to add dependants for this employee');
    }

    const dependant = this.dependantRepository.create({
      ...dto,
      createdBy: currentUser.id,
    });
    return await this.dependantRepository.save(dependant);
  }

  /**
   * Get dependants
   */
  async getDependants(employeeId: string, currentUser: any) {
    // Check permission
    if (employeeId !== currentUser.employeeId && currentUser.role !== 'HR_MANAGER' && currentUser.role !== 'ADMIN') {
      throw new ForbiddenException('You do not have permission to view dependants');
    }

    return await this.dependantRepository.find({
      where: { personId: employeeId },
      order: { dateOfBirth: 'DESC' },
    });
  }

  /**
   * GDPR: Check if user can view full profile
   */
  private canViewFullProfile(employeeId: string, currentUser: any): boolean {
    // Own profile
    if (employeeId === currentUser.employeeId) {
      return true;
    }

    // HR and Admin can view all
    if (currentUser.role === 'HR_MANAGER' || currentUser.role === 'ADMIN') {
      return true;
    }

    // Managers can view direct reports (would need to check hierarchy)
    // For now, return false
    return false;
  }

  /**
   * GDPR: Return limited profile for non-authorized users
   */
  private getLimitedProfile(employee: Employee) {
    return {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      jobTitle: employee.jobTitle,
      department: employee.department,
      avatarUrl: employee.avatarUrl,
      // Omit sensitive data
    };
  }
}
