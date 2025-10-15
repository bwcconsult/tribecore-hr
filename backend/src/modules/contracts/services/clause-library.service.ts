import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClauseLibrary, ClauseCategory } from '../entities/clause-library.entity';

export interface CreateClauseLibraryDto {
  key: string;
  title: string;
  text: string;
  category: ClauseCategory;
  jurisdiction?: string;
  riskScore?: number;
  riskLevel?: string;
  isStandard?: boolean;
  applicableContractTypes?: string[];
  notes?: string;
  mergeFields?: string[];
}

@Injectable()
export class ClauseLibraryService {
  constructor(
    @InjectRepository(ClauseLibrary)
    private clauseLibraryRepository: Repository<ClauseLibrary>,
  ) {}

  /**
   * Create clause in library
   */
  async create(
    organizationId: string,
    createDto: CreateClauseLibraryDto,
    approvedBy?: string,
  ): Promise<ClauseLibrary> {
    const clause = this.clauseLibraryRepository.create({
      ...createDto,
      organizationId,
      approvedBy,
      approvedAt: approvedBy ? new Date() : undefined,
      isActive: true,
    });

    return await this.clauseLibraryRepository.save(clause);
  }

  /**
   * Get all clauses
   */
  async findAll(
    organizationId: string,
    filters?: {
      category?: ClauseCategory;
      jurisdiction?: string;
      contractType?: string;
    },
  ): Promise<ClauseLibrary[]> {
    const query = this.clauseLibraryRepository
      .createQueryBuilder('clause')
      .where('clause.organizationId = :organizationId', { organizationId })
      .andWhere('clause.isActive = :isActive', { isActive: true });

    if (filters?.category) {
      query.andWhere('clause.category = :category', { category: filters.category });
    }
    if (filters?.jurisdiction) {
      query.andWhere('clause.jurisdiction = :jurisdiction', { jurisdiction: filters.jurisdiction });
    }
    if (filters?.contractType) {
      query.andWhere(':contractType = ANY(clause.applicableContractTypes)', {
        contractType: filters.contractType,
      });
    }

    return await query.orderBy('clause.category', 'ASC').addOrderBy('clause.title', 'ASC').getMany();
  }

  /**
   * Get clause by key
   */
  async findByKey(organizationId: string, key: string): Promise<ClauseLibrary> {
    const clause = await this.clauseLibraryRepository.findOne({
      where: { organizationId, key, isActive: true },
    });

    if (!clause) {
      throw new NotFoundException('Clause not found');
    }

    return clause;
  }

  /**
   * Get standard clauses for contract type
   */
  async getStandardClauses(
    organizationId: string,
    contractType: string,
    jurisdiction?: string,
  ): Promise<ClauseLibrary[]> {
    const query = this.clauseLibraryRepository
      .createQueryBuilder('clause')
      .where('clause.organizationId = :organizationId', { organizationId })
      .andWhere('clause.isActive = :isActive', { isActive: true })
      .andWhere('clause.isStandard = :isStandard', { isStandard: true })
      .andWhere(':contractType = ANY(clause.applicableContractTypes)', { contractType });

    if (jurisdiction) {
      query.andWhere('clause.jurisdiction = :jurisdiction', { jurisdiction });
    }

    return await query.orderBy('clause.category', 'ASC').getMany();
  }

  /**
   * Seed default clauses for organization
   */
  async seedDefaults(organizationId: string): Promise<void> {
    const defaultClauses = [
      {
        key: 'CONFIDENTIALITY_STANDARD',
        title: 'Confidentiality',
        text: 'The Parties agree to maintain the confidentiality of all proprietary information disclosed during the term of this Agreement...',
        category: ClauseCategory.CONFIDENTIALITY,
        jurisdiction: 'UK',
        riskScore: 2,
        riskLevel: 'LOW',
        isStandard: true,
        applicableContractTypes: ['EMPLOYMENT', 'VENDOR', 'NDA'],
      },
      {
        key: 'TERMINATION_STANDARD',
        title: 'Termination',
        text: 'Either party may terminate this Agreement with 30 days written notice...',
        category: ClauseCategory.TERMINATION,
        jurisdiction: 'UK',
        riskScore: 3,
        riskLevel: 'MEDIUM',
        isStandard: true,
        applicableContractTypes: ['EMPLOYMENT', 'VENDOR', 'CUSTOMER'],
      },
      {
        key: 'DATA_PROTECTION_GDPR',
        title: 'Data Protection (GDPR)',
        text: 'The Parties agree to comply with all applicable data protection laws including the General Data Protection Regulation (GDPR)...',
        category: ClauseCategory.DATA_PROTECTION,
        jurisdiction: 'UK',
        riskScore: 5,
        riskLevel: 'HIGH',
        isStandard: true,
        applicableContractTypes: ['VENDOR', 'CUSTOMER', 'MSA'],
      },
    ];

    for (const clause of defaultClauses) {
      await this.create(organizationId, clause as CreateClauseLibraryDto);
    }
  }
}
