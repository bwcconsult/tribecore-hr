import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../entities/department.entity';

export interface CreateDepartmentDto {
  organizationId: string;
  code: string;
  name: string;
  description?: string;
  parentDepartmentId?: string;
  headOfDepartmentId?: string;
  location?: string;
  costCenter?: string;
  metadata?: any;
  color?: string;
  icon?: string;
}

export interface DepartmentTreeNode extends Department {
  children: DepartmentTreeNode[];
}

@Injectable()
export class DepartmentService {
  private readonly logger = new Logger(DepartmentService.name);

  constructor(
    @InjectRepository(Department)
    private readonly deptRepo: Repository<Department>,
  ) {}

  /**
   * Create a new department
   */
  async create(data: CreateDepartmentDto): Promise<Department> {
    // Check if code is unique
    const existing = await this.deptRepo.findOne({
      where: { organizationId: data.organizationId, code: data.code },
    });

    if (existing) {
      throw new BadRequestException(`Department with code ${data.code} already exists`);
    }

    // Calculate level
    let level = 0;
    if (data.parentDepartmentId) {
      const parent = await this.deptRepo.findOne({
        where: { id: data.parentDepartmentId },
      });
      if (parent) {
        level = parent.level + 1;
      }
    }

    const department = this.deptRepo.create({
      ...data,
      level,
      employeeCount: 0,
      isActive: true,
    });

    const saved = await this.deptRepo.save(department);
    this.logger.log(`Department created: ${saved.name} (${saved.code})`);

    return saved;
  }

  /**
   * Get all departments
   */
  async findAll(organizationId: string): Promise<Department[]> {
    return this.deptRepo.find({
      where: { organizationId },
      order: { name: 'ASC' },
    });
  }

  /**
   * Get department tree structure
   */
  async getDepartmentTree(organizationId: string): Promise<DepartmentTreeNode[]> {
    const departments = await this.deptRepo.find({
      where: { organizationId, isActive: true },
      order: { level: 'ASC', name: 'ASC' },
    });

    const rootDepts = departments.filter((d) => !d.parentDepartmentId);
    return rootDepts.map((root) => this.buildDepartmentTree(root, departments));
  }

  /**
   * Get department by ID
   */
  async findOne(id: string): Promise<Department> {
    const department = await this.deptRepo.findOne({
      where: { id },
      relations: ['parentDepartment', 'children'],
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  /**
   * Update department
   */
  async update(id: string, data: Partial<CreateDepartmentDto>): Promise<Department> {
    const department = await this.findOne(id);

    // Recalculate level if parent changed
    if (data.parentDepartmentId && data.parentDepartmentId !== department.parentDepartmentId) {
      const parent = await this.deptRepo.findOne({
        where: { id: data.parentDepartmentId },
      });
      if (parent) {
        department.level = parent.level + 1;
      }
    }

    Object.assign(department, data);

    const saved = await this.deptRepo.save(department);
    this.logger.log(`Department updated: ${saved.id}`);

    return saved;
  }

  /**
   * Delete department
   */
  async delete(id: string): Promise<void> {
    const department = await this.deptRepo.findOne({
      where: { id },
      relations: ['children'],
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    if (department.children && department.children.length > 0) {
      throw new BadRequestException('Cannot delete department with sub-departments');
    }

    if (department.employeeCount > 0) {
      throw new BadRequestException('Cannot delete department with employees');
    }

    await this.deptRepo.remove(department);
    this.logger.log(`Department deleted: ${id}`);
  }

  /**
   * Update employee count for department
   */
  async updateEmployeeCount(departmentId: string, count: number): Promise<void> {
    await this.deptRepo.update(departmentId, { employeeCount: count });
  }

  /**
   * Get department hierarchy path
   */
  async getHierarchyPath(departmentId: string): Promise<Department[]> {
    const path: Department[] = [];
    let current = await this.deptRepo.findOne({
      where: { id: departmentId },
      relations: ['parentDepartment'],
    });

    while (current) {
      path.unshift(current);
      if (current.parentDepartment) {
        current = await this.deptRepo.findOne({
          where: { id: current.parentDepartment.id },
          relations: ['parentDepartment'],
        });
      } else {
        break;
      }
    }

    return path;
  }

  // ==================== PRIVATE METHODS ====================

  private buildDepartmentTree(
    department: Department,
    allDepartments: Department[],
  ): DepartmentTreeNode {
    const children = allDepartments
      .filter((d) => d.parentDepartmentId === department.id)
      .map((child) => this.buildDepartmentTree(child, allDepartments));

    return {
      ...department,
      children,
    };
  }
}
