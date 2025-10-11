import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NextOfKin } from './entities/next-of-kin.entity';
import { CreateNextOfKinDto } from './dto/create-next-of-kin.dto';
import { UpdateNextOfKinDto } from './dto/update-next-of-kin.dto';

@Injectable()
export class NextOfKinService {
  constructor(
    @InjectRepository(NextOfKin)
    private nextOfKinRepository: Repository<NextOfKin>,
  ) {}

  /**
   * Create a new next of kin for a user
   */
  async create(userId: string, createDto: CreateNextOfKinDto): Promise<NextOfKin> {
    // If setting as primary, unset other primary contacts first
    if (createDto.isPrimary) {
      await this.nextOfKinRepository.update(
        { userId, isPrimary: true },
        { isPrimary: false },
      );
    }

    const nextOfKin = this.nextOfKinRepository.create({
      ...createDto,
      userId,
      dateOfBirth: createDto.dateOfBirth ? new Date(createDto.dateOfBirth) : null,
    });

    return this.nextOfKinRepository.save(nextOfKin);
  }

  /**
   * Get all next of kin for a user
   */
  async findAll(userId: string): Promise<NextOfKin[]> {
    return this.nextOfKinRepository.find({
      where: { userId },
      order: { isPrimary: 'DESC', createdAt: 'ASC' },
    });
  }

  /**
   * Get a specific next of kin by ID
   */
  async findOne(userId: string, id: string): Promise<NextOfKin> {
    const nextOfKin = await this.nextOfKinRepository.findOne({
      where: { id, userId },
    });

    if (!nextOfKin) {
      throw new NotFoundException(`Next of kin with ID ${id} not found`);
    }

    return nextOfKin;
  }

  /**
   * Get primary next of kin for a user
   */
  async findPrimary(userId: string): Promise<NextOfKin | null> {
    return this.nextOfKinRepository.findOne({
      where: { userId, isPrimary: true },
    });
  }

  /**
   * Update next of kin
   */
  async update(
    userId: string,
    id: string,
    updateDto: UpdateNextOfKinDto,
  ): Promise<NextOfKin> {
    const nextOfKin = await this.findOne(userId, id);

    // If setting as primary, unset other primary contacts first
    if (updateDto.isPrimary) {
      await this.nextOfKinRepository.update(
        { userId, isPrimary: true, id: { not: id } as any },
        { isPrimary: false },
      );
    }

    Object.assign(nextOfKin, {
      ...updateDto,
      dateOfBirth: updateDto.dateOfBirth ? new Date(updateDto.dateOfBirth) : nextOfKin.dateOfBirth,
    });

    return this.nextOfKinRepository.save(nextOfKin);
  }

  /**
   * Set a next of kin as primary
   */
  async setPrimary(userId: string, id: string): Promise<NextOfKin> {
    const nextOfKin = await this.findOne(userId, id);

    // Unset all other primary contacts
    await this.nextOfKinRepository.update(
      { userId, isPrimary: true },
      { isPrimary: false },
    );

    // Set this one as primary
    nextOfKin.isPrimary = true;
    return this.nextOfKinRepository.save(nextOfKin);
  }

  /**
   * Delete next of kin
   */
  async remove(userId: string, id: string): Promise<void> {
    const nextOfKin = await this.findOne(userId, id);
    await this.nextOfKinRepository.remove(nextOfKin);
  }

  /**
   * Count next of kin for a user
   */
  async count(userId: string): Promise<number> {
    return this.nextOfKinRepository.count({ where: { userId } });
  }
}
