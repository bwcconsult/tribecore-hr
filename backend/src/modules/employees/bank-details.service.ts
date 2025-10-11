import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankDetails, VerificationStatus } from './entities/bank-details.entity';
import { CreateBankDetailsDto, UpdateBankDetailsDto, VerifyBankDetailsDto } from './dto/bank-details.dto';

@Injectable()
export class BankDetailsService {
  constructor(
    @InjectRepository(BankDetails)
    private bankDetailsRepository: Repository<BankDetails>,
  ) {}

  /**
   * Create bank details for a user
   */
  async create(userId: string, dto: CreateBankDetailsDto): Promise<BankDetails> {
    // If setting as primary, unset other primary accounts
    if (dto.isPrimary) {
      await this.bankDetailsRepository.update(
        { userId, isPrimary: true },
        { isPrimary: false },
      );
    }

    const bankDetails = this.bankDetailsRepository.create({
      ...dto,
      userId,
      verificationStatus: VerificationStatus.UNVERIFIED,
      consentIpAddress: 'TODO', // Should be captured from request
      createdByUserId: userId,
    });

    return this.bankDetailsRepository.save(bankDetails);
  }

  /**
   * Get all bank details for a user
   */
  async getUserBankDetails(userId: string): Promise<BankDetails[]> {
    return this.bankDetailsRepository.find({
      where: { userId },
      order: {
        isPrimary: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  /**
   * Get primary bank details for a user
   */
  async getPrimaryBankDetails(userId: string): Promise<BankDetails | null> {
    return this.bankDetailsRepository.findOne({
      where: { userId, isPrimary: true },
    });
  }

  /**
   * Get bank details by ID
   */
  async getBankDetailsById(id: string, userId: string): Promise<BankDetails> {
    const bankDetails = await this.bankDetailsRepository.findOne({
      where: { id, userId },
    });

    if (!bankDetails) {
      throw new NotFoundException('Bank details not found');
    }

    return bankDetails;
  }

  /**
   * Update bank details
   */
  async update(
    id: string,
    userId: string,
    dto: UpdateBankDetailsDto,
  ): Promise<BankDetails> {
    const bankDetails = await this.getBankDetailsById(id, userId);

    // If setting as primary, unset other primary accounts
    if (dto.isPrimary) {
      await this.bankDetailsRepository.update(
        { userId, isPrimary: true },
        { isPrimary: false },
      );
    }

    Object.assign(bankDetails, dto);
    bankDetails.modifiedByUserId = userId;

    return this.bankDetailsRepository.save(bankDetails);
  }

  /**
   * Delete bank details
   */
  async delete(id: string, userId: string): Promise<void> {
    const bankDetails = await this.getBankDetailsById(id, userId);

    if (bankDetails.isPrimary) {
      throw new BadRequestException('Cannot delete primary bank details. Set another account as primary first.');
    }

    await this.bankDetailsRepository.remove(bankDetails);
  }

  /**
   * Verify bank details (admin/HR only)
   */
  async verify(dto: VerifyBankDetailsDto, verifiedByUserId: string): Promise<BankDetails> {
    const bankDetails = await this.bankDetailsRepository.findOne({
      where: { id: dto.bankDetailsId },
    });

    if (!bankDetails) {
      throw new NotFoundException('Bank details not found');
    }

    bankDetails.verificationStatus = VerificationStatus.VERIFIED;
    bankDetails.verifiedByUserId = verifiedByUserId;
    bankDetails.verifiedAt = new Date();
    bankDetails.verificationNotes = dto.verificationNotes;

    return this.bankDetailsRepository.save(bankDetails);
  }

  /**
   * Reject verification (admin/HR only)
   */
  async rejectVerification(
    bankDetailsId: string,
    reason: string,
    verifiedByUserId: string,
  ): Promise<BankDetails> {
    const bankDetails = await this.bankDetailsRepository.findOne({
      where: { id: bankDetailsId },
    });

    if (!bankDetails) {
      throw new NotFoundException('Bank details not found');
    }

    bankDetails.verificationStatus = VerificationStatus.REJECTED;
    bankDetails.verifiedByUserId = verifiedByUserId;
    bankDetails.verifiedAt = new Date();
    bankDetails.verificationNotes = reason;

    return this.bankDetailsRepository.save(bankDetails);
  }

  /**
   * Get pending verifications (admin/HR only)
   */
  async getPendingVerifications(): Promise<BankDetails[]> {
    return this.bankDetailsRepository.find({
      where: {
        verificationStatus: VerificationStatus.PENDING,
      },
      order: {
        createdAt: 'ASC',
      },
      relations: ['user'],
    });
  }
}
