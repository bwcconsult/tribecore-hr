import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IamUser, IamUserStatus } from '../entities/iam-user.entity';
import { CreateIamUserDto } from '../dto/create-iam-user.dto';
import { UpdateIamUserDto } from '../dto/update-iam-user.dto';
import * as crypto from 'crypto';

@Injectable()
export class IamUserService {
  constructor(
    @InjectRepository(IamUser)
    private iamUserRepository: Repository<IamUser>,
  ) {}

  /**
   * Create a new IAM user (external/service account)
   */
  async create(
    organizationId: string,
    createDto: CreateIamUserDto,
    createdBy: string,
  ): Promise<IamUser> {
    // Check if username already exists
    const existing = await this.iamUserRepository.findOne({
      where: { organizationId, username: createDto.username },
    });

    if (existing) {
      throw new BadRequestException('Username already exists');
    }

    const iamUser = this.iamUserRepository.create({
      ...createDto,
      organizationId,
      createdBy,
      status: IamUserStatus.ACTIVE,
    });

    // Generate API key for service accounts
    if (createDto.isServiceAccount) {
      iamUser.apiKey = this.generateApiKey();
      // Default to 1 year expiration
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      iamUser.apiKeyExpiresAt = expiresAt;
    }

    return await this.iamUserRepository.save(iamUser);
  }

  /**
   * Find all IAM users for an organization
   */
  async findAll(organizationId: string): Promise<IamUser[]> {
    return await this.iamUserRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find IAM user by ID
   */
  async findOne(id: string, organizationId: string): Promise<IamUser> {
    const iamUser = await this.iamUserRepository.findOne({
      where: { id, organizationId },
    });

    if (!iamUser) {
      throw new NotFoundException('IAM user not found');
    }

    return iamUser;
  }

  /**
   * Find IAM user by username
   */
  async findByUsername(username: string, organizationId: string): Promise<IamUser | null> {
    return await this.iamUserRepository.findOne({
      where: { username, organizationId },
    });
  }

  /**
   * Find IAM user by API key
   */
  async findByApiKey(apiKey: string): Promise<IamUser | null> {
    return await this.iamUserRepository.findOne({
      where: { apiKey, status: IamUserStatus.ACTIVE },
    });
  }

  /**
   * Update IAM user
   */
  async update(
    id: string,
    organizationId: string,
    updateDto: UpdateIamUserDto,
    modifiedBy: string,
  ): Promise<IamUser> {
    const iamUser = await this.findOne(id, organizationId);

    // Check username uniqueness if changing
    if (updateDto.username && updateDto.username !== iamUser.username) {
      const existing = await this.findByUsername(updateDto.username, organizationId);
      if (existing) {
        throw new BadRequestException('Username already exists');
      }
    }

    Object.assign(iamUser, updateDto);
    iamUser.modifiedBy = modifiedBy;

    return await this.iamUserRepository.save(iamUser);
  }

  /**
   * Assign roles to IAM user
   */
  async assignRoles(
    id: string,
    organizationId: string,
    roles: string[],
    modifiedBy: string,
  ): Promise<IamUser> {
    const iamUser = await this.findOne(id, organizationId);
    iamUser.roles = roles;
    iamUser.modifiedBy = modifiedBy;
    return await this.iamUserRepository.save(iamUser);
  }

  /**
   * Deactivate IAM user
   */
  async deactivate(
    id: string,
    organizationId: string,
    reason: string,
    deactivatedBy: string,
  ): Promise<IamUser> {
    const iamUser = await this.findOne(id, organizationId);
    iamUser.status = IamUserStatus.INACTIVE;
    iamUser.deactivatedAt = new Date();
    iamUser.deactivatedBy = deactivatedBy;
    iamUser.deactivationReason = reason;
    return await this.iamUserRepository.save(iamUser);
  }

  /**
   * Reactivate IAM user
   */
  async reactivate(
    id: string,
    organizationId: string,
    modifiedBy: string,
  ): Promise<IamUser> {
    const iamUser = await this.findOne(id, organizationId);
    iamUser.status = IamUserStatus.ACTIVE;
    iamUser.deactivatedAt = null;
    iamUser.deactivatedBy = null;
    iamUser.deactivationReason = null;
    iamUser.modifiedBy = modifiedBy;
    return await this.iamUserRepository.save(iamUser);
  }

  /**
   * Suspend IAM user (temporary)
   */
  async suspend(
    id: string,
    organizationId: string,
    reason: string,
    modifiedBy: string,
  ): Promise<IamUser> {
    const iamUser = await this.findOne(id, organizationId);
    iamUser.status = IamUserStatus.SUSPENDED;
    iamUser.deactivationReason = reason;
    iamUser.modifiedBy = modifiedBy;
    return await this.iamUserRepository.save(iamUser);
  }

  /**
   * Regenerate API key for service account
   */
  async regenerateApiKey(
    id: string,
    organizationId: string,
    modifiedBy: string,
  ): Promise<IamUser> {
    const iamUser = await this.findOne(id, organizationId);

    if (!iamUser.isServiceAccount) {
      throw new BadRequestException('Only service accounts can have API keys');
    }

    iamUser.apiKey = this.generateApiKey();
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    iamUser.apiKeyExpiresAt = expiresAt;
    iamUser.modifiedBy = modifiedBy;

    return await this.iamUserRepository.save(iamUser);
  }

  /**
   * Record login activity
   */
  async recordLogin(id: string, ipAddress: string): Promise<void> {
    await this.iamUserRepository.update(id, {
      lastLoginAt: new Date(),
      lastLoginIp: ipAddress,
      loginCount: () => 'loginCount + 1',
    });
  }

  /**
   * Delete IAM user (hard delete)
   */
  async delete(id: string, organizationId: string): Promise<void> {
    const iamUser = await this.findOne(id, organizationId);
    await this.iamUserRepository.remove(iamUser);
  }

  /**
   * Get statistics
   */
  async getStats(organizationId: string) {
    const users = await this.findAll(organizationId);

    return {
      total: users.length,
      active: users.filter(u => u.status === IamUserStatus.ACTIVE).length,
      inactive: users.filter(u => u.status === IamUserStatus.INACTIVE).length,
      suspended: users.filter(u => u.status === IamUserStatus.SUSPENDED).length,
      serviceAccounts: users.filter(u => u.isServiceAccount).length,
      byType: {
        serviceAccount: users.filter(u => u.type === 'SERVICE_ACCOUNT').length,
        externalUser: users.filter(u => u.type === 'EXTERNAL_USER').length,
        contractor: users.filter(u => u.type === 'CONTRACTOR').length,
        consultant: users.filter(u => u.type === 'CONSULTANT').length,
        auditor: users.filter(u => u.type === 'AUDITOR').length,
        temporary: users.filter(u => u.type === 'TEMPORARY').length,
      },
    };
  }

  /**
   * Check for expired users
   */
  async checkExpiredUsers(organizationId: string): Promise<IamUser[]> {
    const now = new Date();
    const users = await this.findAll(organizationId);

    const expired = users.filter(
      u => u.accessExpiresAt && u.accessExpiresAt < now && u.status === IamUserStatus.ACTIVE
    );

    // Auto-mark as expired
    for (const user of expired) {
      user.status = IamUserStatus.EXPIRED;
      await this.iamUserRepository.save(user);
    }

    return expired;
  }

  /**
   * Generate secure API key
   */
  private generateApiKey(): string {
    return `tc_${crypto.randomBytes(32).toString('hex')}`;
  }
}
