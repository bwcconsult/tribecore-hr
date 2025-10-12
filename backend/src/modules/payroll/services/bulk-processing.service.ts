import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Payroll } from '../entities/payroll.entity';
import { Employee } from '../../employees/entities/employee.entity';

export interface BulkProcessingResult {
  batchId: string;
  status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  totalAmount: number;
  errors: Array<{
    employeeId: string;
    employeeName: string;
    error: string;
  }>;
  rollbackAvailable: boolean;
  processedAt: Date;
}

export interface RollbackResult {
  batchId: string;
  status: 'SUCCESS' | 'FAILED';
  rollbackCount: number;
  message: string;
}

@Injectable()
export class BulkProcessingService {
  private readonly logger = new Logger(BulkProcessingService.name);
  private rollbackStore = new Map<string, any[]>(); // In production, use Redis or database

  constructor(
    @InjectRepository(Payroll)
    private payrollRepository: Repository<Payroll>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private dataSource: DataSource,
  ) {}

  async processBulkPayroll(
    organizationId: string,
    employeeIds: string[],
    payrollData: {
      payPeriodStart: Date;
      payPeriodEnd: Date;
      payDate: Date;
      frequency: string;
    },
  ): Promise<BulkProcessingResult> {
    const batchId = `BATCH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.logger.log(`Starting bulk payroll processing: ${batchId}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    const result: BulkProcessingResult = {
      batchId,
      status: 'SUCCESS',
      totalProcessed: 0,
      successCount: 0,
      failureCount: 0,
      totalAmount: 0,
      errors: [],
      rollbackAvailable: true,
      processedAt: new Date(),
    };

    const processedPayrolls: Payroll[] = [];

    try {
      for (const employeeId of employeeIds) {
        try {
          const employee = await this.employeeRepository.findOne({
            where: { id: employeeId, organizationId },
          });

          if (!employee) {
            result.errors.push({
              employeeId,
              employeeName: 'Unknown',
              error: 'Employee not found',
            });
            result.failureCount++;
            continue;
          }

          // Calculate payroll (simplified - use your existing calculation logic)
          const payroll = await this.calculateEmployeePayroll(
            employee,
            payrollData,
            organizationId,
          );

          const savedPayroll = await queryRunner.manager.save(Payroll, payroll);
          processedPayrolls.push(savedPayroll);

          result.successCount++;
          result.totalAmount += Number(savedPayroll.netPay);
        } catch (error) {
          this.logger.error(`Error processing employee ${employeeId}:`, error);
          result.errors.push({
            employeeId,
            employeeName: 'Error',
            error: error.message,
          });
          result.failureCount++;
        }

        result.totalProcessed++;
      }

      // Commit transaction
      await queryRunner.commitTransaction();

      // Store for rollback
      this.rollbackStore.set(batchId, processedPayrolls.map(p => p.id));

      // Auto-cleanup after 24 hours
      setTimeout(() => this.rollbackStore.delete(batchId), 24 * 60 * 60 * 1000);

      result.status = result.failureCount === 0 ? 'SUCCESS' : result.failureCount < employeeIds.length ? 'PARTIAL' : 'FAILED';

      this.logger.log(`Bulk processing completed: ${batchId} - ${result.status}`);
      return result;
    } catch (error) {
      this.logger.error(`Bulk processing failed: ${batchId}`, error);
      await queryRunner.rollbackTransaction();

      result.status = 'FAILED';
      result.errors.push({
        employeeId: 'SYSTEM',
        employeeName: 'System Error',
        error: error.message,
      });

      return result;
    } finally {
      await queryRunner.release();
    }
  }

  async rollbackBatch(batchId: string): Promise<RollbackResult> {
    this.logger.log(`Attempting rollback for batch: ${batchId}`);

    const payrollIds = this.rollbackStore.get(batchId);

    if (!payrollIds) {
      return {
        batchId,
        status: 'FAILED',
        rollbackCount: 0,
        message: 'Batch not found or rollback period expired (24 hours)',
      };
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Soft delete all payrolls in the batch
      await queryRunner.manager.softDelete(Payroll, payrollIds);

      await queryRunner.commitTransaction();

      // Remove from rollback store
      this.rollbackStore.delete(batchId);

      this.logger.log(`Batch rolled back successfully: ${batchId}`);
      return {
        batchId,
        status: 'SUCCESS',
        rollbackCount: payrollIds.length,
        message: `Successfully rolled back ${payrollIds.length} payroll records`,
      };
    } catch (error) {
      this.logger.error(`Rollback failed for batch: ${batchId}`, error);
      await queryRunner.rollbackTransaction();

      return {
        batchId,
        status: 'FAILED',
        rollbackCount: 0,
        message: `Rollback failed: ${error.message}`,
      };
    } finally {
      await queryRunner.release();
    }
  }

  async processMultiEntity(
    entities: Array<{
      organizationId: string;
      employeeIds: string[];
      payrollData: any;
    }>,
  ): Promise<Array<BulkProcessingResult>> {
    this.logger.log(`Processing multi-entity payroll for ${entities.length} entities`);

    const results: BulkProcessingResult[] = [];

    // Process entities in parallel
    const promises = entities.map(entity =>
      this.processBulkPayroll(entity.organizationId, entity.employeeIds, entity.payrollData),
    );

    const settledResults = await Promise.allSettled(promises);

    settledResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        this.logger.error(`Entity ${index} processing failed:`, result.reason);
        results.push({
          batchId: `FAILED-${Date.now()}-${index}`,
          status: 'FAILED',
          totalProcessed: 0,
          successCount: 0,
          failureCount: entities[index].employeeIds.length,
          totalAmount: 0,
          errors: [{
            employeeId: 'SYSTEM',
            employeeName: 'Multi-entity Error',
            error: result.reason?.message || 'Unknown error',
          }],
          rollbackAvailable: false,
          processedAt: new Date(),
        });
      }
    });

    return results;
  }

  private async calculateEmployeePayroll(
    employee: Employee,
    payrollData: any,
    organizationId: string,
  ): Promise<Partial<Payroll>> {
    // Use existing payroll calculation logic
    const grossPay = Number(employee.salary) || 0;
    const incomeTax = this.calculateTax(grossPay, employee.taxCode);
    const pensionContribution = grossPay * 0.05; // 5% pension
    const totalDeductions = incomeTax + pensionContribution;
    const netPay = grossPay - totalDeductions;

    return {
      organizationId,
      employeeId: employee.id,
      payPeriodStart: payrollData.payPeriodStart,
      payPeriodEnd: payrollData.payPeriodEnd,
      payDate: payrollData.payDate,
      grossPay,
      incomeTax,
      pensionContribution,
      totalDeductions,
      netPay,
      frequency: payrollData.frequency,
      status: 'PENDING',
    } as Partial<Payroll>;
  }

  private calculateTax(grossPay: number, taxCode?: string): number {
    // Simplified tax calculation - use your actual tax engine
    if (grossPay <= 1000) return 0;
    if (grossPay <= 5000) return grossPay * 0.15;
    if (grossPay <= 10000) return grossPay * 0.20;
    return grossPay * 0.25;
  }
}
