import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditTrail } from '../entities/audit-trail.entity';

interface LogEntry {
  claimId?: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  notes?: string;
}

@Injectable()
export class AuditTrailService {
  constructor(
    @InjectRepository(AuditTrail)
    private auditRepository: Repository<AuditTrail>,
  ) {}

  async log(entry: LogEntry): Promise<AuditTrail> {
    const audit = this.auditRepository.create(entry);
    return this.auditRepository.save(audit);
  }

  async getClaimHistory(claimId: string): Promise<AuditTrail[]> {
    return this.auditRepository.find({
      where: { claimId },
      relations: ['user'],
      order: { timestamp: 'DESC' },
    });
  }

  async getUserActivity(userId: string, limit: number = 50): Promise<AuditTrail[]> {
    return this.auditRepository.find({
      where: { userId },
      relations: ['user', 'claim'],
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async getRecentActivity(limit: number = 100): Promise<AuditTrail[]> {
    return this.auditRepository.find({
      relations: ['user', 'claim'],
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }
}
