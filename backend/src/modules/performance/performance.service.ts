import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerformanceReview } from './entities/performance.entity';
import { CreatePerformanceReviewDto } from './dto/create-performance.dto';
import { UpdatePerformanceReviewDto } from './dto/update-performance.dto';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectRepository(PerformanceReview)
    private performanceRepository: Repository<PerformanceReview>,
  ) {}

  async create(createDto: CreatePerformanceReviewDto): Promise<PerformanceReview> {
    const review = this.performanceRepository.create(createDto);
    return this.performanceRepository.save(review);
  }

  async findByEmployee(employeeId: string): Promise<PerformanceReview[]> {
    return this.performanceRepository.find({
      where: { employeeId },
      relations: ['employee', 'reviewer'],
      order: { reviewDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<PerformanceReview> {
    const review = await this.performanceRepository.findOne({
      where: { id },
      relations: ['employee', 'reviewer'],
    });

    if (!review) {
      throw new NotFoundException('Performance review not found');
    }

    return review;
  }

  async update(id: string, updateDto: UpdatePerformanceReviewDto): Promise<PerformanceReview> {
    const review = await this.findOne(id);
    Object.assign(review, updateDto);
    return this.performanceRepository.save(review);
  }

  async acknowledgeReview(id: string): Promise<PerformanceReview> {
    const review = await this.findOne(id);
    review.employeeAcknowledged = true;
    review.acknowledgedAt = new Date();
    return this.performanceRepository.save(review);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.performanceRepository.softDelete(id);
  }
}
