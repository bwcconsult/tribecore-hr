import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AbsenceRequest } from '../absence/entities/absence-request.entity';
import { Task } from '../tasks/entities/task.entity';
import { Employee } from '../employees/entities/employee.entity';

export interface AbsenceAnalytics {
  totalRequests: number;
  approved: number;
  pending: number;
  rejected: number;
  averageDaysPerRequest: number;
  byPlan: { planId: string; planName: string; count: number; days: number }[];
  byMonth: { month: string; count: number; days: number }[];
  topRequesters: { userId: string; name: string; requests: number; days: number }[];
}

export interface TaskAnalytics {
  totalTasks: number;
  completed: number;
  pending: number;
  overdue: number;
  averageCompletionTime: number; // hours
  byType: { type: string; count: number }[];
  byPriority: { priority: string; count: number }[];
  completionRate: number; // percentage
}

export interface EmployeeAnalytics {
  totalEmployees: number;
  activeEmployees: number;
  byDepartment: { department: string; count: number }[];
  byLocation: { location: string; count: number }[];
  byEmploymentType: { type: string; count: number }[];
  averageTenure: number; // months
}

/**
 * AnalyticsService
 * Provides business intelligence and advanced analytics
 */
@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AbsenceRequest)
    private absenceRepository: Repository<AbsenceRequest>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  /**
   * Get absence analytics
   */
  async getAbsenceAnalytics(startDate: Date, endDate: Date): Promise<AbsenceAnalytics> {
    const requests = await this.absenceRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['plan', 'user'],
    });

    const totalRequests = requests.length;
    const approved = requests.filter((r) => r.status === 'APPROVED').length;
    const pending = requests.filter((r) => r.status === 'PENDING').length;
    const rejected = requests.filter((r) => r.status === 'REJECTED').length;

    const totalDays = requests.reduce((sum, r) => sum + r.calculatedDays, 0);
    const averageDaysPerRequest = totalRequests > 0 ? totalDays / totalRequests : 0;

    // By plan
    const planMap = new Map<string, { planName: string; count: number; days: number }>();
    requests.forEach((r) => {
      const planId = r.planId;
      const existing = planMap.get(planId) || { planName: r.plan?.name || '', count: 0, days: 0 };
      existing.count++;
      existing.days += r.calculatedDays;
      planMap.set(planId, existing);
    });
    const byPlan = Array.from(planMap.entries()).map(([planId, data]) => ({
      planId,
      ...data,
    }));

    // By month
    const monthMap = new Map<string, { count: number; days: number }>();
    requests.forEach((r) => {
      const month = r.startDate.toISOString().substring(0, 7); // YYYY-MM
      const existing = monthMap.get(month) || { count: 0, days: 0 };
      existing.count++;
      existing.days += r.calculatedDays;
      monthMap.set(month, existing);
    });
    const byMonth = Array.from(monthMap.entries()).map(([month, data]) => ({
      month,
      ...data,
    }));

    // Top requesters
    const userMap = new Map<string, { name: string; requests: number; days: number }>();
    requests.forEach((r) => {
      const userId = r.userId;
      const existing = userMap.get(userId) || {
        name: `${r.user?.firstName} ${r.user?.lastName}`,
        requests: 0,
        days: 0,
      };
      existing.requests++;
      existing.days += r.calculatedDays;
      userMap.set(userId, existing);
    });
    const topRequesters = Array.from(userMap.entries())
      .map(([userId, data]) => ({ userId, ...data }))
      .sort((a, b) => b.days - a.days)
      .slice(0, 10);

    return {
      totalRequests,
      approved,
      pending,
      rejected,
      averageDaysPerRequest,
      byPlan,
      byMonth,
      topRequesters,
    };
  }

  /**
   * Get task analytics
   */
  async getTaskAnalytics(startDate: Date, endDate: Date): Promise<TaskAnalytics> {
    const tasks = await this.taskRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    const totalTasks = tasks.length;
    const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
    const pending = tasks.filter((t) => t.status === 'PENDING').length;
    const overdue = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED',
    ).length;

    // Average completion time
    const completedTasks = tasks.filter((t) => t.completedAt);
    const totalCompletionTime = completedTasks.reduce((sum, t) => {
      const created = new Date(t.createdAt).getTime();
      const completed = new Date(t.completedAt!).getTime();
      return sum + (completed - created);
    }, 0);
    const averageCompletionTime =
      completedTasks.length > 0 ? totalCompletionTime / completedTasks.length / 1000 / 60 / 60 : 0; // hours

    // By type
    const typeMap = new Map<string, number>();
    tasks.forEach((t) => {
      typeMap.set(t.type, (typeMap.get(t.type) || 0) + 1);
    });
    const byType = Array.from(typeMap.entries()).map(([type, count]) => ({ type, count }));

    // By priority
    const priorityMap = new Map<string, number>();
    tasks.forEach((t) => {
      priorityMap.set(t.priority, (priorityMap.get(t.priority) || 0) + 1);
    });
    const byPriority = Array.from(priorityMap.entries()).map(([priority, count]) => ({
      priority,
      count,
    }));

    const completionRate = totalTasks > 0 ? (completed / totalTasks) * 100 : 0;

    return {
      totalTasks,
      completed,
      pending,
      overdue,
      averageCompletionTime,
      byType,
      byPriority,
      completionRate,
    };
  }

  /**
   * Get employee analytics
   */
  async getEmployeeAnalytics(): Promise<EmployeeAnalytics> {
    const employees = await this.employeeRepository.find({
      relations: ['employment'],
    });

    const totalEmployees = employees.length;
    const activeEmployees = employees.filter((e) => e.status === 'ACTIVE').length;

    // By department
    const deptMap = new Map<string, number>();
    employees.forEach((e) => {
      const dept = e.department || 'Unknown';
      deptMap.set(dept, (deptMap.get(dept) || 0) + 1);
    });
    const byDepartment = Array.from(deptMap.entries()).map(([department, count]) => ({
      department,
      count,
    }));

    // By location
    const locMap = new Map<string, number>();
    employees.forEach((e) => {
      const loc = e.location || 'Unknown';
      locMap.set(loc, (locMap.get(loc) || 0) + 1);
    });
    const byLocation = Array.from(locMap.entries()).map(([location, count]) => ({
      location,
      count,
    }));

    // By employment type
    const typeMap = new Map<string, number>();
    employees.forEach((e) => {
      const type = e.employmentType || 'Unknown';
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });
    const byEmploymentType = Array.from(typeMap.entries()).map(([type, count]) => ({
      type,
      count,
    }));

    // Average tenure
    const totalTenure = employees.reduce((sum, e) => {
      if (e.startDate) {
        const months =
          (new Date().getTime() - new Date(e.startDate).getTime()) / 1000 / 60 / 60 / 24 / 30;
        return sum + months;
      }
      return sum;
    }, 0);
    const averageTenure = totalEmployees > 0 ? totalTenure / totalEmployees : 0;

    return {
      totalEmployees,
      activeEmployees,
      byDepartment,
      byLocation,
      byEmploymentType,
      averageTenure,
    };
  }

  /**
   * Get dashboard KPIs
   */
  async getDashboardKPIs(): Promise<{
    absences: { pending: number; approved: number; thisMonth: number };
    tasks: { open: number; overdue: number; completionRate: number };
    employees: { active: number; newThisMonth: number };
  }> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Absence KPIs
    const pendingAbsences = await this.absenceRepository.count({
      where: { status: 'PENDING' },
    });
    const approvedAbsences = await this.absenceRepository.count({
      where: { status: 'APPROVED' },
    });
    const absencesThisMonth = await this.absenceRepository.count({
      where: { createdAt: Between(monthStart, now) },
    });

    // Task KPIs
    const openTasks = await this.taskRepository.count({
      where: { status: 'PENDING' },
    });
    const overdueTasks = await this.taskRepository
      .createQueryBuilder('task')
      .where('task.dueDate < :now', { now })
      .andWhere('task.status != :completed', { completed: 'COMPLETED' })
      .getCount();

    const totalTasks = await this.taskRepository.count();
    const completedTasks = await this.taskRepository.count({ where: { status: 'COMPLETED' } });
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Employee KPIs
    const activeEmployees = await this.employeeRepository.count({ where: { status: 'ACTIVE' } });
    const newEmployees = await this.employeeRepository.count({
      where: { startDate: Between(monthStart, now) },
    });

    return {
      absences: {
        pending: pendingAbsences,
        approved: approvedAbsences,
        thisMonth: absencesThisMonth,
      },
      tasks: {
        open: openTasks,
        overdue: overdueTasks,
        completionRate,
      },
      employees: {
        active: activeEmployees,
        newThisMonth: newEmployees,
      },
    };
  }
}
