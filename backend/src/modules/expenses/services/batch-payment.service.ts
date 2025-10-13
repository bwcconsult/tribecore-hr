import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { BatchPayment, BatchPaymentStatus } from '../entities/batch-payment.entity';
import { CreateBatchPaymentDto } from '../dto/create-batch-payment.dto';
import { Reimbursement } from '../entities/reimbursement.entity';

@Injectable()
export class BatchPaymentService {
  constructor(
    @InjectRepository(BatchPayment)
    private readonly batchPaymentRepository: Repository<BatchPayment>,
    @InjectRepository(Reimbursement)
    private readonly reimbursementRepository: Repository<Reimbursement>,
  ) {}

  async create(createBatchPaymentDto: CreateBatchPaymentDto, createdBy: string): Promise<BatchPayment> {
    const batch = this.batchPaymentRepository.create({
      ...createBatchPaymentDto,
      createdBy,
      status: BatchPaymentStatus.DRAFT,
      totalAmount: 0,
      itemCount: 0,
      items: [],
    });

    return await this.batchPaymentRepository.save(batch);
  }

  async findAll(filters?: { status?: BatchPaymentStatus }): Promise<BatchPayment[]> {
    const query = this.batchPaymentRepository.createQueryBuilder('batch')
      .leftJoinAndSelect('batch.creator', 'creator')
      .leftJoinAndSelect('batch.processor', 'processor');

    if (filters?.status) {
      query.andWhere('batch.status = :status', { status: filters.status });
    }

    query.orderBy('batch.createdAt', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<BatchPayment> {
    const batch = await this.batchPaymentRepository.findOne({
      where: { id },
      relations: ['creator', 'processor'],
    });

    if (!batch) {
      throw new NotFoundException(`Batch payment with ID ${id} not found`);
    }

    return batch;
  }

  async addItems(id: string, reimbursementIds: string[]): Promise<BatchPayment> {
    const batch = await this.findOne(id);

    if (batch.status !== BatchPaymentStatus.DRAFT) {
      throw new BadRequestException('Can only add items to draft batches');
    }

    // Fetch reimbursements
    const reimbursements = await this.reimbursementRepository.findBy({
      id: In(reimbursementIds),
    });

    if (reimbursements.length !== reimbursementIds.length) {
      throw new BadRequestException('Some reimbursements not found');
    }

    // Add to batch items
    const newItems = reimbursements.map(r => ({
      id: r.id,
      claimId: r.claimId,
      amount: r.amount,
      currency: r.currency || 'GBP',
    }));

    batch.items = [...(batch.items || []), ...newItems];
    batch.itemCount = batch.items.length;
    batch.totalAmount = batch.items.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0);

    return await this.batchPaymentRepository.save(batch);
  }

  async removeItem(id: string, itemId: string): Promise<BatchPayment> {
    const batch = await this.findOne(id);

    if (batch.status !== BatchPaymentStatus.DRAFT) {
      throw new BadRequestException('Can only remove items from draft batches');
    }

    batch.items = (batch.items || []).filter(item => item.id !== itemId);
    batch.itemCount = batch.items.length;
    batch.totalAmount = batch.items.reduce((sum, item) => sum + parseFloat(item.amount.toString()), 0);

    return await this.batchPaymentRepository.save(batch);
  }

  async markReadyToProcess(id: string): Promise<BatchPayment> {
    const batch = await this.findOne(id);

    if (batch.status !== BatchPaymentStatus.DRAFT) {
      throw new BadRequestException('Only draft batches can be marked ready to process');
    }

    if (batch.itemCount === 0) {
      throw new BadRequestException('Cannot process empty batch');
    }

    batch.status = BatchPaymentStatus.READY_TO_PROCESS;

    return await this.batchPaymentRepository.save(batch);
  }

  async process(id: string, processedBy: string): Promise<BatchPayment> {
    const batch = await this.findOne(id);

    if (batch.status !== BatchPaymentStatus.READY_TO_PROCESS) {
      throw new BadRequestException('Only batches ready to process can be processed');
    }

    batch.status = BatchPaymentStatus.PROCESSING;
    batch.processedBy = processedBy;
    batch.processedAt = new Date();

    const updatedBatch = await this.batchPaymentRepository.save(batch);

    // Here you would integrate with payment gateway
    // For now, we'll mark it as completed
    setTimeout(async () => {
      updatedBatch.status = BatchPaymentStatus.COMPLETED;
      await this.batchPaymentRepository.save(updatedBatch);
    }, 1000);

    return updatedBatch;
  }

  async getStatistics(): Promise<any> {
    const query = this.batchPaymentRepository.createQueryBuilder('batch');

    const [
      total,
      draft,
      readyToProcess,
      processing,
      completed,
      failed,
    ] = await Promise.all([
      query.getCount(),
      query.clone().andWhere('batch.status = :status', { status: BatchPaymentStatus.DRAFT }).getCount(),
      query.clone().andWhere('batch.status = :status', { status: BatchPaymentStatus.READY_TO_PROCESS }).getCount(),
      query.clone().andWhere('batch.status = :status', { status: BatchPaymentStatus.PROCESSING }).getCount(),
      query.clone().andWhere('batch.status = :status', { status: BatchPaymentStatus.COMPLETED }).getCount(),
      query.clone().andWhere('batch.status = :status', { status: BatchPaymentStatus.FAILED }).getCount(),
    ]);

    const totalAmount = await query.clone()
      .select('SUM(batch.totalAmount)', 'sum')
      .getRawOne();

    return {
      total,
      byStatus: {
        draft,
        readyToProcess,
        processing,
        completed,
        failed,
      },
      totalAmount: parseFloat(totalAmount?.sum || '0'),
    };
  }

  async remove(id: string): Promise<void> {
    const batch = await this.findOne(id);
    
    if (batch.status !== BatchPaymentStatus.DRAFT) {
      throw new BadRequestException('Only draft batches can be deleted');
    }

    await this.batchPaymentRepository.remove(batch);
  }
}
