import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Position, PositionLevel } from '../entities/position.entity';

export interface CreatePositionDto {
  organizationId: string;
  code: string;
  title: string;
  description?: string;
  departmentId?: string;
  level: PositionLevel;
  reportsToPositionId?: string;
  minSalary?: number;
  maxSalary?: number;
  requiredSkills?: string[];
  responsibilities?: string[];
  requirements?: any;
  headcount?: number;
  metadata?: any;
}

@Injectable()
export class PositionService {
  private readonly logger = new Logger(PositionService.name);

  constructor(
    @InjectRepository(Position)
    private readonly positionRepo: Repository<Position>,
  ) {}

  /**
   * Create a new position
   */
  async create(data: CreatePositionDto): Promise<Position> {
    const existing = await this.positionRepo.findOne({
      where: { organizationId: data.organizationId, code: data.code },
    });

    if (existing) {
      throw new BadRequestException(`Position with code ${data.code} already exists`);
    }

    // Calculate hierarchy level
    let hierarchyLevel = 0;
    if (data.reportsToPositionId) {
      const reportsTo = await this.positionRepo.findOne({
        where: { id: data.reportsToPositionId },
      });
      if (reportsTo) {
        hierarchyLevel = reportsTo.hierarchyLevel + 1;
      }
    }

    const position = this.positionRepo.create({
      ...data,
      hierarchyLevel,
      headcount: data.headcount || 0,
      vacantPositions: data.headcount || 0,
      isActive: true,
    });

    const saved = await this.positionRepo.save(position);
    this.logger.log(`Position created: ${saved.title} (${saved.code})`);

    return saved;
  }

  /**
   * Get all positions
   */
  async findAll(organizationId: string, filters?: {
    departmentId?: string;
    level?: PositionLevel;
    isActive?: boolean;
  }): Promise<Position[]> {
    const where: any = { organizationId };

    if (filters?.departmentId) where.departmentId = filters.departmentId;
    if (filters?.level) where.level = filters.level;
    if (filters?.isActive !== undefined) where.isActive = filters.isActive;

    return this.positionRepo.find({
      where,
      relations: ['department', 'reportsTo'],
      order: { title: 'ASC' },
    });
  }

  /**
   * Get position by ID
   */
  async findOne(id: string): Promise<Position> {
    const position = await this.positionRepo.findOne({
      where: { id },
      relations: ['department', 'reportsTo'],
    });

    if (!position) {
      throw new NotFoundException('Position not found');
    }

    return position;
  }

  /**
   * Update position
   */
  async update(id: string, data: Partial<CreatePositionDto>): Promise<Position> {
    const position = await this.findOne(id);

    // Recalculate hierarchy level if reporting structure changed
    if (data.reportsToPositionId && data.reportsToPositionId !== position.reportsToPositionId) {
      const reportsTo = await this.positionRepo.findOne({
        where: { id: data.reportsToPositionId },
      });
      if (reportsTo) {
        position.hierarchyLevel = reportsTo.hierarchyLevel + 1;
      }
    }

    Object.assign(position, data);

    const saved = await this.positionRepo.save(position);
    this.logger.log(`Position updated: ${saved.id}`);

    return saved;
  }

  /**
   * Delete position
   */
  async delete(id: string): Promise<void> {
    const position = await this.findOne(id);

    if (position.headcount > position.vacantPositions) {
      throw new BadRequestException('Cannot delete position with active employees');
    }

    await this.positionRepo.remove(position);
    this.logger.log(`Position deleted: ${id}`);
  }

  /**
   * Update vacant positions count
   */
  async updateVacantPositions(positionId: string, vacantCount: number): Promise<void> {
    await this.positionRepo.update(positionId, { vacantPositions: vacantCount });
  }

  /**
   * Get positions by level
   */
  async getByLevel(organizationId: string, level: PositionLevel): Promise<Position[]> {
    return this.positionRepo.find({
      where: { organizationId, level, isActive: true },
      relations: ['department'],
    });
  }

  /**
   * Get vacant positions
   */
  async getVacantPositions(organizationId: string): Promise<Position[]> {
    return this.positionRepo
      .createQueryBuilder('position')
      .where('position.organizationId = :organizationId', { organizationId })
      .andWhere('position.vacantPositions > 0')
      .andWhere('position.isActive = :isActive', { isActive: true })
      .leftJoinAndSelect('position.department', 'department')
      .getMany();
  }
}
