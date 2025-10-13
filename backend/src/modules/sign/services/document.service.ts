import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentStatus } from '../entities/document.entity';
import { Recipient, RecipientStatus } from '../entities/recipient.entity';
import { ActivityLog, ActivityType } from '../entities/activity-log.entity';
import { CreateDocumentDto } from '../dto/create-document.dto';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(Recipient)
    private recipientRepository: Repository<Recipient>,
    @InjectRepository(ActivityLog)
    private activityLogRepository: Repository<ActivityLog>,
  ) {}

  async create(
    createDocumentDto: CreateDocumentDto,
    userId: string,
  ): Promise<Document> {
    const document = this.documentRepository.create({
      ...createDocumentDto,
      createdBy: userId,
      status: DocumentStatus.DRAFT,
    });

    const savedDocument = await this.documentRepository.save(document);

    // Create activity log
    await this.createActivityLog(
      savedDocument.id,
      userId,
      ActivityType.DOCUMENT_CREATED,
      'Document created',
    );

    return savedDocument;
  }

  async findAll(userId: string, filters?: any): Promise<Document[]> {
    const query = this.documentRepository.createQueryBuilder('document');

    query.where('document.createdBy = :userId', { userId });

    // Apply filters
    if (filters?.status) {
      query.andWhere('document.status = :status', { status: filters.status });
    }

    if (filters?.type) {
      query.andWhere('document.type = :type', { type: filters.type });
    }

    if (filters?.search) {
      query.andWhere('document.name ILIKE :search', {
        search: `%${filters.search}%`,
      });
    }

    query.leftJoinAndSelect('document.recipients', 'recipients');
    query.orderBy('document.createdAt', 'DESC');

    return await query.getMany();
  }

  async findReceived(userId: string): Promise<Recipient[]> {
    return await this.recipientRepository
      .createQueryBuilder('recipient')
      .leftJoinAndSelect('recipient.document', 'document')
      .where('recipient.email = :email', { email: userId })
      .orderBy('recipient.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id },
      relations: ['recipients', 'activityLogs'],
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async sendDocument(id: string, userId: string): Promise<Document> {
    const document = await this.findOne(id);

    document.status = DocumentStatus.SENT;
    document.sentAt = new Date();

    // Update all recipients to SENT status
    for (const recipient of document.recipients) {
      recipient.status = RecipientStatus.SENT;
      recipient.sentAt = new Date();
    }

    await this.documentRepository.save(document);

    await this.createActivityLog(
      id,
      userId,
      ActivityType.DOCUMENT_SENT,
      'Document sent to recipients',
    );

    return document;
  }

  async recallDocument(id: string, userId: string): Promise<Document> {
    const document = await this.findOne(id);

    document.status = DocumentStatus.RECALLED;
    await this.documentRepository.save(document);

    await this.createActivityLog(
      id,
      userId,
      ActivityType.DOCUMENT_RECALLED,
      'Document recalled',
    );

    return document;
  }

  async signDocument(
    documentId: string,
    recipientId: string,
    signatureData: string,
  ): Promise<Recipient> {
    const recipient = await this.recipientRepository.findOne({
      where: { id: recipientId, documentId },
    });

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    recipient.status = RecipientStatus.SIGNED;
    recipient.signedAt = new Date();
    recipient.signatureData = signatureData;

    await this.recipientRepository.save(recipient);

    await this.createActivityLog(
      documentId,
      null,
      ActivityType.DOCUMENT_SIGNED,
      `Document signed by ${recipient.name}`,
    );

    // Check if all recipients have signed
    await this.checkDocumentCompletion(documentId);

    return recipient;
  }

  async declineDocument(
    documentId: string,
    recipientId: string,
    reason: string,
  ): Promise<Recipient> {
    const recipient = await this.recipientRepository.findOne({
      where: { id: recipientId, documentId },
    });

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    recipient.status = RecipientStatus.DECLINED;
    recipient.declineReason = reason;

    await this.recipientRepository.save(recipient);

    // Update document status to DECLINED
    const document = await this.findOne(documentId);
    document.status = DocumentStatus.DECLINED;
    await this.documentRepository.save(document);

    await this.createActivityLog(
      documentId,
      null,
      ActivityType.DOCUMENT_DECLINED,
      `Document declined by ${recipient.name}`,
    );

    return recipient;
  }

  async delete(id: string): Promise<void> {
    const document = await this.findOne(id);
    await this.documentRepository.remove(document);
  }

  async getStatistics(userId: string): Promise<any> {
    const [
      totalDocuments,
      sentDocuments,
      completedDocuments,
      inProgressDocuments,
      draftDocuments,
    ] = await Promise.all([
      this.documentRepository.count({ where: { createdBy: userId } }),
      this.documentRepository.count({
        where: { createdBy: userId, status: DocumentStatus.SENT },
      }),
      this.documentRepository.count({
        where: { createdBy: userId, status: DocumentStatus.COMPLETED },
      }),
      this.documentRepository.count({
        where: { createdBy: userId, status: DocumentStatus.IN_PROGRESS },
      }),
      this.documentRepository.count({
        where: { createdBy: userId, status: DocumentStatus.DRAFT },
      }),
    ]);

    return {
      total: totalDocuments,
      sent: sentDocuments,
      completed: completedDocuments,
      inProgress: inProgressDocuments,
      draft: draftDocuments,
    };
  }

  private async checkDocumentCompletion(documentId: string): Promise<void> {
    const document = await this.findOne(documentId);

    const allSigned = document.recipients.every(
      (r) => r.status === RecipientStatus.SIGNED,
    );

    if (allSigned) {
      document.status = DocumentStatus.COMPLETED;
      document.completedAt = new Date();
      await this.documentRepository.save(document);

      await this.createActivityLog(
        documentId,
        null,
        ActivityType.DOCUMENT_COMPLETED,
        'All recipients have signed',
      );
    } else {
      document.status = DocumentStatus.IN_PROGRESS;
      await this.documentRepository.save(document);
    }
  }

  private async createActivityLog(
    documentId: string,
    userId: string | null,
    activity: ActivityType,
    description: string,
  ): Promise<void> {
    const log = this.activityLogRepository.create({
      documentId,
      userId: userId || undefined,
      activity,
      description,
    });

    await this.activityLogRepository.save(log);
  }
}
