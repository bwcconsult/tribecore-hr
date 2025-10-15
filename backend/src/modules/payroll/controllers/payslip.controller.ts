import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
// import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard'; // TODO: Import from your auth module
import { PayslipCalculationEngineService } from '../services/payslip-calculation-engine.service';
import { PayslipService } from '../services/payslip.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payslip, PayslipStatus } from '../entities/payslip.entity';
import {
  EarningCode,
  DeductionCode,
  TaxCode,
  BenefitPlan,
  PayslipTemplate,
} from '../entities/payslip-codes.entity';
import {
  GeneratePayslipDto,
  BulkGeneratePayslipsDto,
  RegeneratePayslipDto,
  PayslipFilterDto,
  DisputePayslipDto,
  PublishPayslipsDto,
  PayslipComparisonDto,
  CreateEarningCodeDto,
  CreateDeductionCodeDto,
  CreateTaxCodeDto,
} from '../dto/payslip.dto';
import { Response } from 'express';

@Controller('payslips')
// @UseGuards(JwtAuthGuard) // TODO: Enable auth guard
export class PayslipController {
  constructor(
    private payslipCalculationEngine: PayslipCalculationEngineService,
    private payslipService: PayslipService,
    @InjectRepository(Payslip)
    private payslipRepository: Repository<Payslip>,
    @InjectRepository(EarningCode)
    private earningCodeRepository: Repository<EarningCode>,
    @InjectRepository(DeductionCode)
    private deductionCodeRepository: Repository<DeductionCode>,
    @InjectRepository(TaxCode)
    private taxCodeRepository: Repository<TaxCode>,
    @InjectRepository(BenefitPlan)
    private benefitPlanRepository: Repository<BenefitPlan>,
    @InjectRepository(PayslipTemplate)
    private payslipTemplateRepository: Repository<PayslipTemplate>,
  ) {}

  // ==================== Payslip Generation ====================

  @Post('generate')
  async generatePayslip(@Body() dto: GeneratePayslipDto, @Req() req: any) {
    const payslip = await this.payslipCalculationEngine.calculatePayslip({
      ...dto,
      periodStart: new Date(dto.periodStart),
      periodEnd: new Date(dto.periodEnd),
      payDate: new Date(dto.payDate),
    });

    const saved = await this.payslipRepository.save(payslip);
    return saved;
  }

  @Post('bulk-generate')
  async bulkGeneratePayslips(
    @Body() dto: BulkGeneratePayslipsDto,
    @Req() req: any,
  ) {
    const results: any[] = [];
    const errors: any[] = [];

    for (const employeeId of dto.employeeIds) {
      try {
        const payslip = await this.payslipCalculationEngine.calculatePayslip({
          employeeId,
          payRunId: dto.payRunId,
          periodStart: new Date(dto.periodStart),
          periodEnd: new Date(dto.periodEnd),
          payDate: new Date(dto.payDate),
          country: 'UK', // Would fetch from employee record
          currency: 'GBP',
          baseSalary: 50000, // Would fetch from employee record
          payFrequency: 'MONTHLY',
        });

        const saved = await this.payslipRepository.save(payslip);
        results.push({ employeeId, payslipId: saved.id, status: 'success' });
      } catch (error) {
        errors.push({
          employeeId,
          error: error.message,
          status: 'failed',
        });
      }
    }

    return {
      success: results.length,
      failed: errors.length,
      results,
      errors,
    };
  }

  @Post(':id/regenerate')
  async regeneratePayslip(
    @Param('id') id: string,
    @Body() dto: RegeneratePayslipDto,
    @Req() req: any,
  ) {
    const amended = await this.payslipCalculationEngine.regeneratePayslip(
      id,
      dto.reason,
    );
    return this.payslipRepository.save(amended);
  }

  @Post('preview')
  async previewPayslip(@Body() dto: GeneratePayslipDto, @Req() req: any) {
    // Dry run - don't save
    const payslip = await this.payslipCalculationEngine.calculatePayslip({
      ...dto,
      periodStart: new Date(dto.periodStart),
      periodEnd: new Date(dto.periodEnd),
      payDate: new Date(dto.payDate),
    });

    return payslip;
  }

  // ==================== Payslip Access ====================

  @Get()
  async getPayslips(@Query() filters: PayslipFilterDto, @Req() req: any) {
    const query = this.payslipRepository.createQueryBuilder('payslip');

    if (filters.employeeId) {
      query.andWhere('payslip.employeeId = :employeeId', {
        employeeId: filters.employeeId,
      });
    }

    if (filters.payRunId) {
      query.andWhere('payslip.payRunId = :payRunId', {
        payRunId: filters.payRunId,
      });
    }

    if (filters.year) {
      query.andWhere(
        "EXTRACT(YEAR FROM payslip.periodStart) = :year",
        { year: filters.year },
      );
    }

    if (filters.period) {
      const [year, month] = filters.period.split('-');
      query.andWhere(
        "EXTRACT(YEAR FROM payslip.periodStart) = :year AND EXTRACT(MONTH FROM payslip.periodStart) = :month",
        { year, month },
      );
    }

    if (filters.status) {
      query.andWhere('payslip.status = :status', { status: filters.status });
    }

    if (filters.country) {
      query.andWhere('payslip.country = :country', {
        country: filters.country,
      });
    }

    query.orderBy('payslip.periodStart', 'DESC');

    const page = filters.page || 1;
    const limit = filters.limit || 20;
    query.skip((page - 1) * limit).take(limit);

    const [payslips, total] = await query.getManyAndCount();

    return {
      data: payslips,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  @Get('employees/:employeeId')
  async getEmployeePayslips(
    @Param('employeeId') employeeId: string,
    @Query() filters: PayslipFilterDto,
    @Req() req: any,
  ) {
    return this.getPayslips({ ...filters, employeeId }, req);
  }

  @Get(':id')
  async getPayslipById(@Param('id') id: string, @Req() req: any) {
    const payslip = await this.payslipRepository.findOne({
      where: { id },
      relations: [
        'employee',
        'payRun',
        'earnings',
        'preTaxDeductions',
        'taxes',
        'postTaxDeductions',
        'garnishments',
        'employerContributions',
        'allowances',
        'reimbursements',
      ],
    });

    if (!payslip) {
      throw new Error('Payslip not found');
    }

    return payslip;
  }

  @Get(':id/pdf')
  async downloadPayslipPDF(
    @Param('id') id: string,
    @Res() res: Response,
    @Req() req: any,
  ) {
    const payslip = await this.getPayslipById(id, req);
    
    // Generate PDF if not exists
    if (!payslip.pdfUrl) {
      const pdfUrl = await this.payslipService.generatePayslip(payslip as any);
      payslip.pdfUrl = pdfUrl;
      await this.payslipRepository.save(payslip);
    }

    // In production, stream from S3/Azure
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="payslip-${payslip.id}.pdf"`,
    );
    
    return res.status(HttpStatus.OK).send({
      message: 'PDF generation not yet implemented',
      pdfUrl: payslip.pdfUrl,
    });
  }

  @Get(':id/verify')
  async verifyPayslip(
    @Param('id') id: string,
    @Query('token') token: string,
  ) {
    const payslip = await this.payslipRepository.findOne({ where: { id } });

    if (!payslip) {
      return { valid: false, message: 'Payslip not found' };
    }

    // Verify signature
    const isValid = payslip.signedBy === token;

    return {
      valid: isValid,
      message: isValid ? 'Payslip is authentic' : 'Invalid signature - possible tampering',
      payslipId: id,
      generatedAt: payslip.generatedAt,
    };
  }

  @Post(':id/compare')
  async comparePayslips(@Body() dto: PayslipComparisonDto, @Req() req: any) {
    const payslip1 = await this.getPayslipById(dto.payslip1Id, req);
    const payslip2 = await this.getPayslipById(dto.payslip2Id, req);

    const comparison = {
      period1: {
        start: payslip1.periodStart,
        end: payslip1.periodEnd,
      },
      period2: {
        start: payslip2.periodStart,
        end: payslip2.periodEnd,
      },
      differences: {
        grossPay: {
          period1: payslip1.grossPay,
          period2: payslip2.grossPay,
          delta: Number(payslip2.grossPay) - Number(payslip1.grossPay),
          percentChange:
            ((Number(payslip2.grossPay) - Number(payslip1.grossPay)) /
              Number(payslip1.grossPay)) *
            100,
        },
        totalDeductions: {
          period1: payslip1.totalDeductions,
          period2: payslip2.totalDeductions,
          delta: Number(payslip2.totalDeductions) - Number(payslip1.totalDeductions),
        },
        netPay: {
          period1: payslip1.netPay,
          period2: payslip2.netPay,
          delta: Number(payslip2.netPay) - Number(payslip1.netPay),
          percentChange:
            ((Number(payslip2.netPay) - Number(payslip1.netPay)) /
              Number(payslip1.netPay)) *
            100,
        },
      },
      // Could expand with line-by-line comparison
    };

    return comparison;
  }

  // ==================== Disputes ====================

  @Post(':id/disputes')
  async createDispute(@Body() dto: DisputePayslipDto, @Req() req: any) {
    // In production, create a Dispute entity and workflow
    return {
      id: 'DISPUTE-' + Date.now(),
      payslipId: dto.payslipId,
      reason: dto.reason,
      status: 'PENDING',
      createdAt: new Date(),
      createdBy: req.user.id,
    };
  }

  // ==================== Publishing ====================

  @Post('publish')
  async publishPayslips(@Body() dto: PublishPayslipsDto, @Req() req: any) {
    const results: any[] = [];

    for (const payslipId of dto.payslipIds) {
      const payslip = await this.payslipRepository.findOne({
        where: { id: payslipId },
        relations: ['employee'],
      });

      if (!payslip) {
        results.push({ payslipId, status: 'not_found' });
        continue;
      }

      // Update status
      payslip.status = PayslipStatus.ISSUED;
      payslip.generatedAt = new Date();

      // Generate PDF if requested
      if (dto.generatePDF && !payslip.pdfUrl) {
        try {
          payslip.pdfUrl = await this.payslipService.generatePayslip(payslip as any);
        } catch (error) {
          results.push({ payslipId, status: 'pdf_generation_failed', error: error.message });
          continue;
        }
      }

      // Send email if requested
      if (dto.sendEmail) {
        try {
          await this.payslipService.emailPayslip(
            payslip as any,
            payslip.employee.email,
          );
          payslip.emailSent = true;
          payslip.emailSentAt = new Date();
        } catch (error) {
          results.push({ payslipId, status: 'email_failed', error: error.message });
          continue;
        }
      }

      await this.payslipRepository.save(payslip);
      results.push({ payslipId, status: 'published' });
    }

    return {
      total: dto.payslipIds.length,
      results,
    };
  }

  // ==================== Catalog Endpoints ====================

  @Get('catalog/earning-codes')
  async getEarningCodes(@Query('country') country?: string) {
    const query = this.earningCodeRepository.createQueryBuilder('code');
    query.where('code.isActive = :isActive', { isActive: true });

    if (country) {
      query.andWhere(':country = ANY(code.countries)', { country });
    }

    query.orderBy('code.displayOrder', 'ASC');
    return query.getMany();
  }

  @Post('catalog/earning-codes')
  async createEarningCode(@Body() dto: CreateEarningCodeDto) {
    const code = this.earningCodeRepository.create(dto);
    return this.earningCodeRepository.save(code);
  }

  @Get('catalog/deduction-codes')
  async getDeductionCodes(@Query('country') country?: string) {
    const query = this.deductionCodeRepository.createQueryBuilder('code');
    query.where('code.isActive = :isActive', { isActive: true });

    if (country) {
      query.andWhere(':country = ANY(code.countries)', { country });
    }

    query.orderBy('code.displayOrder', 'ASC');
    return query.getMany();
  }

  @Post('catalog/deduction-codes')
  async createDeductionCode(@Body() dto: CreateDeductionCodeDto) {
    const code = this.deductionCodeRepository.create(dto);
    return this.deductionCodeRepository.save(code);
  }

  @Get('catalog/tax-codes')
  async getTaxCodes(@Query('country') country?: string) {
    const query = this.taxCodeRepository.createQueryBuilder('code');
    query.where('code.isActive = :isActive', { isActive: true });

    if (country) {
      query.andWhere('code.country = :country', { country });
    }

    query.orderBy('code.effectiveFrom', 'DESC');
    return query.getMany();
  }

  @Post('catalog/tax-codes')
  async createTaxCode(@Body() dto: CreateTaxCodeDto) {
    const code = this.taxCodeRepository.create({
      ...dto,
      effectiveFrom: new Date(dto.effectiveFrom),
      effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : undefined,
    } as any);
    return this.taxCodeRepository.save(code);
  }

  @Get('catalog/benefit-plans')
  async getBenefitPlans(@Query('country') country?: string) {
    const query = this.benefitPlanRepository.createQueryBuilder('plan');
    query.where('plan.isActive = :isActive', { isActive: true });

    if (country) {
      query.andWhere('plan.country = :country', { country });
    }

    return query.getMany();
  }

  @Get('templates/:country')
  async getPayslipTemplate(@Param('country') country: string) {
    const template = await this.payslipTemplateRepository.findOne({
      where: { country, isActive: true, isDefault: true },
    });

    return template || { message: 'No default template found for country' };
  }

  // ==================== Audit ====================

  @Get(':id/audit')
  async getPayslipAudit(@Param('id') id: string) {
    const payslip = await this.payslipRepository.findOne({
      where: { id },
      relations: ['employee', 'payRun', 'supersedesPayslip'],
    });

    if (!payslip) {
      throw new Error('Payslip not found');
    }

    return {
      payslipId: id,
      version: payslip.version,
      status: payslip.status,
      generatedAt: payslip.generatedAt,
      signedBy: payslip.signedBy,
      supersedesPayslipId: payslip.supersedesPayslipId,
      calculationTrace: payslip.calculationTrace,
      amendments: payslip.supersedesPayslipId
        ? await this.payslipRepository.find({
            where: { supersedesPayslipId: payslip.supersedesPayslipId },
            order: { version: 'ASC' },
          })
        : [],
    };
  }
}
