import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog, ActivityType } from '../entities/activity-log.entity';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
  ) {}

  async findAll(filters?: any): Promise<ActivityLog[]> {
    const query = this.activityLogRepository.createQueryBuilder('log');

    query.leftJoinAndSelect('log.document', 'document');
    query.leftJoinAndSelect('log.user', 'user');

    if (filters?.documentId) {
      query.andWhere('log.documentId = :documentId', {
        documentId: filters.documentId,
      });
    }

    if (filters?.activity) {
      query.andWhere('log.activity = :activity', {
        activity: filters.activity,
      });
    }

    if (filters?.startDate) {
      query.andWhere('log.performedAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      query.andWhere('log.performedAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    query.orderBy('log.performedAt', 'DESC');
    query.take(filters?.limit || 100);

    return await query.getMany();
  }

  async getStatistics(filters?: any): Promise<any> {
    const query = this.activityLogRepository.createQueryBuilder('log');

    if (filters?.startDate) {
      query.where('log.performedAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      query.andWhere('log.performedAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    const [
      totalActivities,
      documentsSent,
      documentsSigned,
      documentsCompleted,
      documentsDeclined,
      failedAccess,
    ] = await Promise.all([
      query.getCount(),
      this.activityLogRepository.count({
        where: { activity: ActivityType.DOCUMENT_SENT },
      }),
      this.activityLogRepository.count({
        where: { activity: ActivityType.DOCUMENT_SIGNED },
      }),
      this.activityLogRepository.count({
        where: { activity: ActivityType.DOCUMENT_COMPLETED },
      }),
      this.activityLogRepository.count({
        where: { activity: ActivityType.DOCUMENT_DECLINED },
      }),
      this.activityLogRepository.count({
        where: { activity: ActivityType.ACCESS_FAILED },
      }),
    ]);

    return {
      total: totalActivities,
      sent: documentsSent,
      signed: documentsSigned,
      completed: documentsCompleted,
      declined: documentsDeclined,
      failedAccess,
    };
  }
}
