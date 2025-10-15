import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Obligation, ObligationStatus, ObligationType } from '../entities/obligation.entity';
import { Contract } from '../entities/contract.entity';
import { CreateObligationDto, CompleteObligationDto } from '../dto/create-obligation.dto';

@Injectable()
export class ObligationService {
  constructor(
    @InjectRepository(Obligation)
    private obligationRepository: Repository<Obligation>,
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
  ) {}

  /**
   * Create obligation
   */
  async create(createDto: CreateObligationDto): Promise<Obligation> {
    const obligation = this.obligationRepository.create({
      ...createDto,
      status: ObligationStatus.PENDING,
    });

    return await this.obligationRepository.save(obligation);
  }

  /**
   * Seed obligations from contract
   */
  async seedFromContract(contract: Contract): Promise<Obligation[]> {
    const obligations: Partial<Obligation>[] = [];

    // Payment obligations
    if (contract.value && contract.billingCycle) {
      obligations.push({
        contractId: contract.id,
        type: ObligationType.PAYMENT,
        title: `${contract.billingCycle} Payment`,
        ownerId: contract.ownerId,
        ownerTeam: 'FINANCE',
        dueDate: this.calculateNextPaymentDate(contract),
        amount: contract.value,
        currency: contract.currency,
        isRecurring: true,
        recurrencePattern: contract.billingCycle,
        status: ObligationStatus.PENDING,
      });
    }

    // Renewal decision obligation
    if (contract.endDate && contract.noticeDate) {
      obligations.push({
        contractId: contract.id,
        type: ObligationType.RENEWAL_DECISION,
        title: 'Renewal Decision Required',
        ownerId: contract.ownerId,
        dueDate: new Date(contract.noticeDate),
        status: ObligationStatus.PENDING,
      });
    }

    const created = await this.obligationRepository.save(obligations);
    return created as Obligation[];
  }

  /**
   * Get obligations for contract
   */
  async getByContract(contractId: string): Promise<Obligation[]> {
    return await this.obligationRepository.find({
      where: { contractId },
      relations: ['owner'],
      order: { dueDate: 'ASC' },
    });
  }

  /**
   * Get obligations for owner
   */
  async getByOwner(ownerId: string, status?: ObligationStatus): Promise<Obligation[]> {
    const where: any = { ownerId };
    if (status) where.status = status;

    return await this.obligationRepository.find({
      where,
      relations: ['contract'],
      order: { dueDate: 'ASC' },
    });
  }

  /**
   * Complete obligation
   */
  async complete(id: string, completeDto: CompleteObligationDto): Promise<Obligation> {
    const obligation = await this.obligationRepository.findOne({ where: { id } });
    if (!obligation) {
      throw new NotFoundException('Obligation not found');
    }

    obligation.status = ObligationStatus.COMPLETED;
    obligation.completedDate = completeDto.completedDate
      ? new Date(completeDto.completedDate)
      : new Date();
    obligation.kpiActual = completeDto.kpiActual;
    obligation.evidenceUrls = completeDto.evidenceUrls;
    obligation.completionNotes = completeDto.completionNotes;

    // Check KPI met
    if (obligation.kpiTarget && obligation.kpiActual) {
      obligation.kpiMet = obligation.kpiActual >= obligation.kpiTarget;
    }

    return await this.obligationRepository.save(obligation);
  }

  /**
   * Check overdue obligations
   */
  async checkOverdue(): Promise<Obligation[]> {
    const overdue = await this.obligationRepository.find({
      where: {
        status: ObligationStatus.PENDING,
        dueDate: LessThan(new Date()),
      },
    });

    // Mark as overdue
    for (const obligation of overdue) {
      obligation.status = ObligationStatus.OVERDUE;
      await this.obligationRepository.save(obligation);
    }

    return overdue;
  }

  /**
   * Get obligations dashboard
   */
  async getDashboard(ownerId?: string) {
    const query = this.obligationRepository.createQueryBuilder('obligation');

    if (ownerId) {
      query.where('obligation.ownerId = :ownerId', { ownerId });
    }

    const obligations = await query.getMany();

    return {
      total: obligations.length,
      pending: obligations.filter((o) => o.status === ObligationStatus.PENDING).length,
      overdue: obligations.filter((o) => o.status === ObligationStatus.OVERDUE).length,
      completed: obligations.filter((o) => o.status === ObligationStatus.COMPLETED).length,
      dueSoon: obligations.filter((o) => {
        const daysUntilDue = Math.ceil(
          (new Date(o.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
        );
        return daysUntilDue > 0 && daysUntilDue <= 30 && o.status === ObligationStatus.PENDING;
      }).length,
      byType: obligations.reduce((acc, o) => {
        acc[o.type] = (acc[o.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  /**
   * Calculate next payment date
   */
  private calculateNextPaymentDate(contract: Contract): Date {
    const start = contract.startDate ? new Date(contract.startDate) : new Date();
    const nextDate = new Date(start);

    switch (contract.billingCycle) {
      case 'MONTHLY':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'QUARTERLY':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'ANNUALLY':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        nextDate.setMonth(nextDate.getMonth() + 1);
    }

    return nextDate;
  }
}
