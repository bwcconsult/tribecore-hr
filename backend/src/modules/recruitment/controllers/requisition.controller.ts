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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { Requisition, RequisitionStatus } from '../entities/requisition.entity';
import { ApprovalService } from '../services/approval.service';

@Controller('api/v1/recruitment/requisitions')
@UseGuards(JwtAuthGuard)
export class RequisitionController {
  constructor(
    @InjectRepository(Requisition)
    private readonly requisitionRepo: Repository<Requisition>,
    private readonly approvalService: ApprovalService,
  ) {}

  /**
   * Create new requisition
   * POST /api/v1/recruitment/requisitions
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: any, @Req() req: any) {
    const requisition = this.requisitionRepo.create({
      ...dto,
      organizationId: req.user.organizationId,
      createdBy: req.user.id,
      status: RequisitionStatus.DRAFT,
    });

    return await this.requisitionRepo.save(requisition);
  }

  /**
   * Get all requisitions with filters
   * GET /api/v1/recruitment/requisitions?status=OPEN&department=eng
   */
  @Get()
  async findAll(@Query() query: any, @Req() req: any) {
    const {
      status,
      departmentId,
      hiringManagerId,
      isUrgent,
      search,
      page = 1,
      limit = 20,
    } = query;

    const qb = this.requisitionRepo
      .createQueryBuilder('req')
      .where('req.organizationId = :organizationId', {
        organizationId: req.user.organizationId,
      });

    if (status) {
      qb.andWhere('req.status = :status', { status });
    }

    if (departmentId) {
      qb.andWhere('req.departmentId = :departmentId', { departmentId });
    }

    if (hiringManagerId) {
      qb.andWhere('req.hiringManagerId = :hiringManagerId', { hiringManagerId });
    }

    if (isUrgent === 'true') {
      qb.andWhere('req.isUrgent = :isUrgent', { isUrgent: true });
    }

    if (search) {
      qb.andWhere('req.jobTitle ILIKE :search', { search: `%${search}%` });
    }

    qb.orderBy('req.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single requisition
   * GET /api/v1/recruitment/requisitions/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return await this.requisitionRepo.findOne({
      where: {
        id,
        organizationId: req.user.organizationId,
      },
    });
  }

  /**
   * Update requisition
   * PATCH /api/v1/recruitment/requisitions/:id
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: any,
    @Req() req: any,
  ) {
    const requisition = await this.requisitionRepo.findOne({
      where: { id, organizationId: req.user.organizationId },
    });

    if (!requisition) {
      throw new Error('Requisition not found');
    }

    // Only draft requisitions can be edited
    if (requisition.status !== RequisitionStatus.DRAFT) {
      throw new Error('Only draft requisitions can be edited');
    }

    Object.assign(requisition, dto);
    return await this.requisitionRepo.save(requisition);
  }

  /**
   * Delete requisition
   * DELETE /api/v1/recruitment/requisitions/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @Req() req: any) {
    const requisition = await this.requisitionRepo.findOne({
      where: { id, organizationId: req.user.organizationId },
    });

    if (!requisition) {
      throw new Error('Requisition not found');
    }

    if (requisition.status !== RequisitionStatus.DRAFT) {
      throw new Error('Only draft requisitions can be deleted');
    }

    await this.requisitionRepo.remove(requisition);
  }

  /**
   * Submit requisition for approval
   * POST /api/v1/recruitment/requisitions/:id/submit
   */
  @Post(':id/submit')
  async submit(@Param('id') id: string, @Req() req: any) {
    return await this.approvalService.submitRequisitionForApproval({
      requisitionId: id,
      submittedBy: req.user.id,
      submittedByName: req.user.name,
      organizationId: req.user.organizationId,
    });
  }

  /**
   * Approve requisition
   * POST /api/v1/recruitment/requisitions/:id/approve
   */
  @Post(':id/approve')
  async approve(
    @Param('id') id: string,
    @Body('comments') comments: string,
    @Req() req: any,
  ) {
    return await this.approvalService.approveRequisition({
      requisitionId: id,
      approverId: req.user.id,
      approverName: req.user.name,
      comments,
      organizationId: req.user.organizationId,
    });
  }

  /**
   * Reject requisition
   * POST /api/v1/recruitment/requisitions/:id/reject
   */
  @Post(':id/reject')
  async reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    return await this.approvalService.rejectRequisition({
      requisitionId: id,
      approverId: req.user.id,
      approverName: req.user.name,
      reason,
      organizationId: req.user.organizationId,
    });
  }

  /**
   * Get my pending approvals
   * GET /api/v1/recruitment/requisitions/pending-approvals
   */
  @Get('pending-approvals/list')
  async getPendingApprovals(@Req() req: any) {
    const requisitions = await this.requisitionRepo
      .createQueryBuilder('req')
      .where('req.organizationId = :organizationId', {
        organizationId: req.user.organizationId,
      })
      .andWhere('req.status = :status', { status: RequisitionStatus.PENDING_APPROVAL })
      .andWhere(
        `EXISTS (
          SELECT 1 FROM jsonb_array_elements(req.approvals) AS approval
          WHERE approval->>'approverId' = :userId
          AND approval->>'status' = 'PENDING'
        )`,
        { userId: req.user.id }
      )
      .orderBy('req.createdAt', 'DESC')
      .getMany();

    return requisitions;
  }

  /**
   * Get requisition statistics
   * GET /api/v1/recruitment/requisitions/stats
   */
  @Get('stats/summary')
  async getStats(@Req() req: any) {
    const organizationId = req.user.organizationId;

    const [
      totalOpen,
      totalPendingApproval,
      totalFilled,
      totalUrgent,
    ] = await Promise.all([
      this.requisitionRepo.count({
        where: { organizationId, status: RequisitionStatus.OPEN },
      }),
      this.requisitionRepo.count({
        where: { organizationId, status: RequisitionStatus.PENDING_APPROVAL },
      }),
      this.requisitionRepo.count({
        where: { organizationId, status: RequisitionStatus.FILLED },
      }),
      this.requisitionRepo.count({
        where: { organizationId, isUrgent: true },
      }),
    ]);

    return {
      totalOpen,
      totalPendingApproval,
      totalFilled,
      totalUrgent,
    };
  }

  /**
   * Clone requisition
   * POST /api/v1/recruitment/requisitions/:id/clone
   */
  @Post(':id/clone')
  async clone(@Param('id') id: string, @Req() req: any) {
    const original = await this.requisitionRepo.findOne({
      where: { id, organizationId: req.user.organizationId },
    });

    if (!original) {
      throw new Error('Requisition not found');
    }

    const { id: _id, approvals: _approvals, approvedAt: _approvedAt, ...rest } = original;
    const clone = this.requisitionRepo.create({
      ...rest,
      createdBy: req.user.id,
      status: RequisitionStatus.DRAFT,
      approvals: [],
      fullyApproved: false,
      approvedAt: undefined,
      jobsCreated: 0,
      applicationsReceived: 0,
      hiredCount: 0,
    });

    return await this.requisitionRepo.save(clone);
  }

  /**
   * Cancel requisition
   * POST /api/v1/recruitment/requisitions/:id/cancel
   */
  @Post(':id/cancel')
  async cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Req() req: any,
  ) {
    const requisition = await this.requisitionRepo.findOne({
      where: { id, organizationId: req.user.organizationId },
    });

    if (!requisition) {
      throw new Error('Requisition not found');
    }

    requisition.status = RequisitionStatus.CANCELLED;
    return await this.requisitionRepo.save(requisition);
  }

  /**
   * Put requisition on hold
   * POST /api/v1/recruitment/requisitions/:id/hold
   */
  @Post(':id/hold')
  async hold(@Param('id') id: string, @Req() req: any) {
    const requisition = await this.requisitionRepo.findOne({
      where: { id, organizationId: req.user.organizationId },
    });

    if (!requisition) {
      throw new Error('Requisition not found');
    }

    requisition.status = RequisitionStatus.ON_HOLD;
    return await this.requisitionRepo.save(requisition);
  }

  /**
   * Reopen requisition
   * POST /api/v1/recruitment/requisitions/:id/reopen
   */
  @Post(':id/reopen')
  async reopen(@Param('id') id: string, @Req() req: any) {
    const requisition = await this.requisitionRepo.findOne({
      where: { id, organizationId: req.user.organizationId },
    });

    if (!requisition) {
      throw new Error('Requisition not found');
    }

    if (requisition.status === RequisitionStatus.ON_HOLD) {
      requisition.status = RequisitionStatus.OPEN;
    }

    return await this.requisitionRepo.save(requisition);
  }
}
