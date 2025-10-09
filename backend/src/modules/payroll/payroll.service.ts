import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Payroll } from './entities/payroll.entity';
import { CreatePayrollDto } from './dto/create-payroll.dto';
import { UpdatePayrollDto } from './dto/update-payroll.dto';
import { TaxCalculatorService } from './services/tax-calculator.service';
import { PayslipService } from './services/payslip.service';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(Payroll)
    private payrollRepository: Repository<Payroll>,
    private taxCalculatorService: TaxCalculatorService,
    private payslipService: PayslipService,
  ) {}

  async create(createPayrollDto: CreatePayrollDto): Promise<Payroll> {
    // Calculate tax and deductions based on country
    const taxCalculation = await this.taxCalculatorService.calculateTax(
      createPayrollDto.country,
      createPayrollDto.grossPay,
      createPayrollDto.frequency,
    );

    const payroll = this.payrollRepository.create({
      ...createPayrollDto,
      incomeTax: taxCalculation.incomeTax,
      nationalInsurance: taxCalculation.nationalInsurance,
      pensionContribution: taxCalculation.pensionContribution,
      totalDeductions: taxCalculation.totalDeductions,
      netPay: createPayrollDto.grossPay - taxCalculation.totalDeductions,
      taxBreakdown: taxCalculation.breakdown,
    });

    return this.payrollRepository.save(payroll);
  }

  async findAll(
    organizationId: string,
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Payroll>> {
    const { page, limit, search, sortBy, sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.payrollRepository
      .createQueryBuilder('payroll')
      .leftJoinAndSelect('payroll.employee', 'employee')
      .where('payroll.organizationId = :organizationId', { organizationId });

    if (search) {
      queryBuilder.andWhere(
        '(employee.firstName ILIKE :search OR employee.lastName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (sortBy) {
      queryBuilder.orderBy(`payroll.${sortBy}`, sortOrder);
    } else {
      queryBuilder.orderBy('payroll.payDate', 'DESC');
    }

    const [data, total] = await queryBuilder.skip(skip).take(limit).getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Payroll> {
    const payroll = await this.payrollRepository.findOne({
      where: { id },
      relations: ['employee', 'organization'],
    });

    if (!payroll) {
      throw new NotFoundException('Payroll record not found');
    }

    return payroll;
  }

  async findByEmployee(employeeId: string): Promise<Payroll[]> {
    return this.payrollRepository.find({
      where: { employeeId },
      order: { payDate: 'DESC' },
    });
  }

  async update(id: string, updatePayrollDto: UpdatePayrollDto): Promise<Payroll> {
    const payroll = await this.findOne(id);
    Object.assign(payroll, updatePayrollDto);
    return this.payrollRepository.save(payroll);
  }

  async approvePayroll(id: string, approvedBy: string): Promise<Payroll> {
    const payroll = await this.findOne(id);
    payroll.status = 'APPROVED' as any;
    payroll.approvedBy = approvedBy;
    payroll.approvedAt = new Date();
    return this.payrollRepository.save(payroll);
  }

  async processPayroll(id: string, paidBy: string): Promise<Payroll> {
    const payroll = await this.findOne(id);
    payroll.status = 'PAID' as any;
    payroll.paidBy = paidBy;
    payroll.paidAt = new Date();

    // Generate payslip
    const payslipUrl = await this.payslipService.generatePayslip(payroll);
    payroll.payslipUrl = payslipUrl;

    return this.payrollRepository.save(payroll);
  }

  async generatePayslip(id: string): Promise<string> {
    const payroll = await this.findOne(id);
    return this.payslipService.generatePayslip(payroll);
  }

  async getPayrollSummary(organizationId: string, startDate: Date, endDate: Date) {
    const payrolls = await this.payrollRepository.find({
      where: {
        organizationId,
        payDate: Between(startDate, endDate),
      },
    });

    const totalGrossPay = payrolls.reduce((sum, p) => sum + Number(p.grossPay), 0);
    const totalNetPay = payrolls.reduce((sum, p) => sum + Number(p.netPay), 0);
    const totalDeductions = payrolls.reduce((sum, p) => sum + Number(p.totalDeductions), 0);
    const totalTax = payrolls.reduce((sum, p) => sum + Number(p.incomeTax), 0);

    return {
      totalPayrolls: payrolls.length,
      totalGrossPay,
      totalNetPay,
      totalDeductions,
      totalTax,
      currency: payrolls[0]?.currency || 'GBP',
    };
  }

  async remove(id: string): Promise<void> {
    const payroll = await this.findOne(id);
    await this.payrollRepository.softDelete(id);
  }
}
