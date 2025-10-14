import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompensationBand } from '../entities/compensation-band.entity';
import { CompensationReview } from '../entities/compensation-review.entity';

@Injectable()
export class CompensationService {
  constructor(
    @InjectRepository(CompensationBand)
    private readonly bandRepo: Repository<CompensationBand>,
    @InjectRepository(CompensationReview)
    private readonly reviewRepo: Repository<CompensationReview>,
  ) {}

  async createBand(data: Partial<CompensationBand>): Promise<CompensationBand> {
    return this.bandRepo.save(data);
  }

  async getBands(organizationId: string): Promise<CompensationBand[]> {
    return this.bandRepo.find({
      where: { organizationId, isActive: true },
      order: { minSalary: 'ASC' },
    });
  }

  async createReview(data: Partial<CompensationReview>): Promise<CompensationReview> {
    const count = await this.reviewRepo.count({ where: { organizationId: data.organizationId } });
    const reviewId = `COMP-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    return this.reviewRepo.save({ ...data, reviewId });
  }

  async getEmployeeReviews(employeeId: string): Promise<CompensationReview[]> {
    return this.reviewRepo.find({
      where: { employeeId },
      order: { createdAt: 'DESC' },
    });
  }

  async getPendingReviews(organizationId: string): Promise<CompensationReview[]> {
    return this.reviewRepo.find({
      where: { organizationId, status: 'PENDING_HR' },
    });
  }

  async approveReview(reviewId: string, approvedBy: string): Promise<CompensationReview> {
    const review = await this.reviewRepo.findOne({ where: { reviewId } });
    if (review) {
      review.status = 'APPROVED';
      review.approvedBy = approvedBy;
      return this.reviewRepo.save(review);
    }
    throw new Error('Review not found');
  }

  async getCompaRatio(salary: number, bandId: string): Promise<number> {
    const band = await this.bandRepo.findOne({ where: { id: bandId } });
    if (!band) return 0;
    return (salary / band.midSalary) * 100;
  }
}
