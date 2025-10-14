import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Contractor, ContractorPayment, ContractorInvoice, ContractorStatus, IR35Status } from './entities/contractor.entity';
import { CreateContractorDto } from './dto/create-contractor.dto';
import { UpdateContractorDto } from './dto/update-contractor.dto';

@Injectable()
export class ContractorsService {
  constructor(
    @InjectRepository(Contractor)
    private contractorRepo: Repository<Contractor>,
    @InjectRepository(ContractorPayment)
    private paymentRepo: Repository<ContractorPayment>,
    @InjectRepository(ContractorInvoice)
    private invoiceRepo: Repository<ContractorInvoice>,
  ) {}

  async create(createDto: CreateContractorDto): Promise<Contractor> {
    const contractor = this.contractorRepo.create(createDto);
    return await this.contractorRepo.save(contractor);
  }

  async findAll(organizationId: string, filters?: any): Promise<Contractor[]> {
    const where: any = { organizationId };
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.search) {
      return await this.contractorRepo.find({
        where: [
          { organizationId, firstName: Like(`%${filters.search}%`) },
          { organizationId, lastName: Like(`%${filters.search}%`) },
          { organizationId, email: Like(`%${filters.search}%`) },
          { organizationId, company: Like(`%${filters.search}%`) },
        ],
      });
    }
    
    return await this.contractorRepo.find({ where });
  }

  async findOne(id: string): Promise<Contractor> {
    const contractor = await this.contractorRepo.findOne({ where: { id } });
    if (!contractor) {
      throw new NotFoundException(`Contractor with ID ${id} not found`);
    }
    return contractor;
  }

  async update(id: string, updateDto: UpdateContractorDto): Promise<Contractor> {
    const contractor = await this.findOne(id);
    Object.assign(contractor, updateDto);
    return await this.contractorRepo.save(contractor);
  }

  async remove(id: string): Promise<void> {
    const contractor = await this.findOne(id);
    await this.contractorRepo.remove(contractor);
  }

  async getStats(organizationId: string) {
    const contractors = await this.findAll(organizationId);
    const active = contractors.filter(c => c.status === ContractorStatus.ACTIVE).length;
    const inactive = contractors.filter(c => c.status === ContractorStatus.INACTIVE).length;
    
    const totalPaid = contractors.reduce((sum, c) => sum + Number(c.totalPaid || 0), 0);
    
    const invoices = await this.invoiceRepo.find({ where: { organizationId } });
    const pendingInvoices = invoices.filter(i => i.status === 'SENT').length;
    
    return {
      total: contractors.length,
      active,
      inactive,
      totalPaid,
      pendingInvoices,
      ir35Inside: contractors.filter(c => c.ir35Status === IR35Status.INSIDE).length,
      ir35Outside: contractors.filter(c => c.ir35Status === IR35Status.OUTSIDE).length,
    };
  }

  // Payment Management
  async createPayment(contractorId: string, paymentData: any): Promise<ContractorPayment> {
    const contractor = await this.findOne(contractorId);
    
    const payment = this.paymentRepo.create({
      ...paymentData,
      contractorId,
      organizationId: contractor.organizationId,
    });
    
    const savedPayment = await this.paymentRepo.save(payment);
    
    // Update contractor total
    contractor.totalPaid = Number(contractor.totalPaid || 0) + Number(payment.amount);
    await this.contractorRepo.save(contractor);
    
    return savedPayment;
  }

  async getPayments(contractorId: string): Promise<ContractorPayment[]> {
    return await this.paymentRepo.find({
      where: { contractorId },
      order: { periodEnd: 'DESC' },
    });
  }

  // Invoice Management
  async generateInvoice(contractorId: string, invoiceData: any): Promise<ContractorInvoice> {
    const contractor = await this.findOne(contractorId);
    
    const invoiceNumber = `INV-${contractor.contractorId}-${Date.now()}`;
    
    const invoice = this.invoiceRepo.create({
      ...invoiceData,
      contractorId,
      organizationId: contractor.organizationId,
      invoiceNumber,
    });
    
    const savedInvoice = await this.invoiceRepo.save(invoice);
    
    // Update contractor invoice count
    contractor.invoiceCount = (contractor.invoiceCount || 0) + 1;
    await this.contractorRepo.save(contractor);
    
    return savedInvoice;
  }

  async getInvoices(contractorId: string): Promise<ContractorInvoice[]> {
    return await this.invoiceRepo.find({
      where: { contractorId },
      order: { invoiceDate: 'DESC' },
    });
  }

  async markInvoicePaid(invoiceId: string, paidDate: Date): Promise<ContractorInvoice> {
    const invoice = await this.invoiceRepo.findOne({ where: { id: invoiceId } });
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
    }
    
    invoice.status = 'PAID';
    invoice.paidDate = paidDate;
    
    return await this.invoiceRepo.save(invoice);
  }

  // IR35 Assessment
  async assessIR35(contractorId: string, assessment: { status: IR35Status; notes?: string }): Promise<Contractor> {
    const contractor = await this.findOne(contractorId);
    
    contractor.ir35Status = assessment.status;
    contractor.ir35AssessmentDate = new Date();
    if (assessment.notes) {
      contractor.ir35Notes = assessment.notes;
    }
    
    return await this.contractorRepo.save(contractor);
  }

  async getIR35Report(organizationId: string) {
    const contractors = await this.findAll(organizationId);
    
    return {
      inside: contractors.filter(c => c.ir35Status === IR35Status.INSIDE),
      outside: contractors.filter(c => c.ir35Status === IR35Status.OUTSIDE),
      undetermined: contractors.filter(c => c.ir35Status === IR35Status.UNDETERMINED),
      summary: {
        totalContractors: contractors.length,
        insideCount: contractors.filter(c => c.ir35Status === IR35Status.INSIDE).length,
        outsideCount: contractors.filter(c => c.ir35Status === IR35Status.OUTSIDE).length,
        undeterminedCount: contractors.filter(c => c.ir35Status === IR35Status.UNDETERMINED).length,
      },
    };
  }
}
