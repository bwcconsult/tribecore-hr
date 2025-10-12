import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Recognition, RecognitionCategory, RecognitionType } from './entities/recognition.entity';
import { Badge } from './entities/badge.entity';
import { EmployeeBadge } from './entities/employee-badge.entity';
import { RewardPoints, PointsTransaction, PointsTransactionType } from './entities/reward-points.entity';
import { CreateRecognitionDto, CreateBadgeDto, AwardBadgeDto } from './dto/create-recognition.dto';

@Injectable()
export class RecognitionService {
  constructor(
    @InjectRepository(Recognition)
    private recognitionRepository: Repository<Recognition>,
    @InjectRepository(Badge)
    private badgeRepository: Repository<Badge>,
    @InjectRepository(EmployeeBadge)
    private employeeBadgeRepository: Repository<EmployeeBadge>,
    @InjectRepository(RewardPoints)
    private rewardPointsRepository: Repository<RewardPoints>,
    @InjectRepository(PointsTransaction)
    private transactionRepository: Repository<PointsTransaction>,
  ) {}

  // ===== RECOGNITIONS =====

  async createRecognition(createDto: CreateRecognitionDto, giverId: string): Promise<Recognition> {
    const recognition = this.recognitionRepository.create({
      ...createDto,
      giverId,
      likedBy: [],
    });

    const saved = await this.recognitionRepository.save(recognition);

    // Award points if specified
    if (createDto.pointsAwarded && createDto.pointsAwarded > 0) {
      await this.addPoints(
        createDto.recipientId,
        createDto.pointsAwarded,
        saved.id,
        `Recognition: ${createDto.title}`,
      );
    }

    // Award badge if specified
    if (createDto.badgeId) {
      await this.awardBadge({
        employeeId: createDto.recipientId,
        badgeId: createDto.badgeId,
        recognitionId: saved.id,
      }, giverId);
    }

    // TODO: Send notification to recipient
    // TODO: Post to company feed if isPublic

    return saved;
  }

  async findAllRecognitions(filters: {
    organizationId?: string;
    recipientId?: string;
    giverId?: string;
    isPublic?: boolean;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Recognition[]> {
    const queryBuilder = this.recognitionRepository.createQueryBuilder('recognition');

    if (filters.organizationId) {
      queryBuilder.andWhere('recognition.organizationId = :orgId', { orgId: filters.organizationId });
    }

    if (filters.recipientId) {
      queryBuilder.andWhere('recognition.recipientId = :recipientId', { recipientId: filters.recipientId });
    }

    if (filters.giverId) {
      queryBuilder.andWhere('recognition.giverId = :giverId', { giverId: filters.giverId });
    }

    if (filters.isPublic !== undefined) {
      queryBuilder.andWhere('recognition.isPublic = :isPublic', { isPublic: filters.isPublic });
    }

    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere('recognition.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    return queryBuilder.orderBy('recognition.createdAt', 'DESC').getMany();
  }

  async getRecognitionById(id: string): Promise<Recognition> {
    const recognition = await this.recognitionRepository.findOne({ where: { id } });
    if (!recognition) {
      throw new NotFoundException('Recognition not found');
    }
    return recognition;
  }

  async likeRecognition(id: string, userId: string): Promise<Recognition> {
    const recognition = await this.getRecognitionById(id);

    if (!recognition.likedBy) {
      recognition.likedBy = [];
    }

    if (recognition.likedBy.includes(userId)) {
      // Unlike
      recognition.likedBy = recognition.likedBy.filter((id) => id !== userId);
      recognition.likes = Math.max(0, recognition.likes - 1);
    } else {
      // Like
      recognition.likedBy.push(userId);
      recognition.likes += 1;
    }

    return this.recognitionRepository.save(recognition);
  }

  async deleteRecognition(id: string): Promise<void> {
    const recognition = await this.getRecognitionById(id);
    await this.recognitionRepository.remove(recognition);
  }

  // ===== BADGES =====

  async createBadge(createDto: CreateBadgeDto): Promise<Badge> {
    const badge = this.badgeRepository.create(createDto);
    return this.badgeRepository.save(badge);
  }

  async findAllBadges(organizationId: string): Promise<Badge[]> {
    return this.badgeRepository.find({
      where: { organizationId, isActive: true },
      order: { name: 'ASC' },
    });
  }

  async getBadgeById(id: string): Promise<Badge> {
    const badge = await this.badgeRepository.findOne({ where: { id } });
    if (!badge) {
      throw new NotFoundException('Badge not found');
    }
    return badge;
  }

  async awardBadge(awardDto: AwardBadgeDto, awardedBy: string): Promise<EmployeeBadge> {
    const badge = await this.getBadgeById(awardDto.badgeId);

    const employeeBadge = this.employeeBadgeRepository.create({
      ...awardDto,
      awardedBy,
    });

    const saved = await this.employeeBadgeRepository.save(employeeBadge);

    // Award points if badge has point value
    if (badge.pointsValue && badge.pointsValue > 0) {
      await this.addPoints(
        awardDto.employeeId,
        badge.pointsValue,
        awardDto.recognitionId,
        `Badge awarded: ${badge.name}`,
      );
    }

    // TODO: Send notification

    return saved;
  }

  async getEmployeeBadges(employeeId: string): Promise<EmployeeBadge[]> {
    return this.employeeBadgeRepository.find({
      where: { employeeId },
      order: { awardedAt: 'DESC' },
    });
  }

  // ===== REWARD POINTS =====

  async getEmployeePoints(employeeId: string, organizationId: string): Promise<RewardPoints> {
    let points = await this.rewardPointsRepository.findOne({
      where: { employeeId, organizationId },
    });

    if (!points) {
      points = this.rewardPointsRepository.create({
        employeeId,
        organizationId,
        totalPoints: 0,
        availablePoints: 0,
        redeemedPoints: 0,
      });
      points = await this.rewardPointsRepository.save(points);
    }

    return points;
  }

  async addPoints(
    employeeId: string,
    points: number,
    recognitionId?: string,
    description?: string,
  ): Promise<void> {
    // Get or create points record
    const rewardPoints = await this.rewardPointsRepository.findOne({
      where: { employeeId },
    });

    if (rewardPoints) {
      rewardPoints.totalPoints += points;
      rewardPoints.availablePoints += points;
      await this.rewardPointsRepository.save(rewardPoints);
    }

    // Create transaction
    const transaction = this.transactionRepository.create({
      employeeId,
      type: PointsTransactionType.EARNED,
      points,
      recognitionId,
      description,
    });

    await this.transactionRepository.save(transaction);
  }

  async redeemPoints(
    employeeId: string,
    points: number,
    redemptionId: string,
    description: string,
  ): Promise<void> {
    const rewardPoints = await this.rewardPointsRepository.findOne({
      where: { employeeId },
    });

    if (!rewardPoints || rewardPoints.availablePoints < points) {
      throw new BadRequestException('Insufficient points');
    }

    rewardPoints.availablePoints -= points;
    rewardPoints.redeemedPoints += points;
    await this.rewardPointsRepository.save(rewardPoints);

    // Create transaction
    const transaction = this.transactionRepository.create({
      employeeId,
      type: PointsTransactionType.REDEEMED,
      points,
      redemptionId,
      description,
    });

    await this.transactionRepository.save(transaction);
  }

  async getPointsTransactions(employeeId: string): Promise<PointsTransaction[]> {
    return this.transactionRepository.find({
      where: { employeeId },
      order: { createdAt: 'DESC' },
    });
  }

  // ===== ANALYTICS =====

  async getRecognitionAnalytics(organizationId: string, startDate: Date, endDate: Date) {
    const recognitions = await this.findAllRecognitions({
      organizationId,
      startDate,
      endDate,
    });

    const totalRecognitions = recognitions.length;
    const byCategory = recognitions.reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byType = recognitions.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topRecipients = recognitions.reduce((acc, r) => {
      acc[r.recipientId] = (acc[r.recipientId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topGivers = recognitions.reduce((acc, r) => {
      acc[r.giverId] = (acc[r.giverId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalPointsAwarded = recognitions.reduce((sum, r) => sum + r.pointsAwarded, 0);

    return {
      totalRecognitions,
      byCategory,
      byType,
      topRecipients: Object.entries(topRecipients)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10),
      topGivers: Object.entries(topGivers)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10),
      totalPointsAwarded,
      averagePointsPerRecognition: totalRecognitions > 0 ? totalPointsAwarded / totalRecognitions : 0,
    };
  }

  async getEmployeeRecognitionStats(employeeId: string) {
    const received = await this.recognitionRepository.count({ where: { recipientId: employeeId } });
    const given = await this.recognitionRepository.count({ where: { giverId: employeeId } });
    const badges = await this.employeeBadgeRepository.count({ where: { employeeId } });
    const points = await this.getEmployeePoints(employeeId, '');

    return {
      recognitionsReceived: received,
      recognitionsGiven: given,
      badgesEarned: badges,
      totalPoints: points?.totalPoints || 0,
      availablePoints: points?.availablePoints || 0,
    };
  }
}
