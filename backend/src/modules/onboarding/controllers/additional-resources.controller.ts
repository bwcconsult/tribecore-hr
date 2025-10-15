import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OnboardingDocument } from '../entities/onboarding-document.entity';
import { ProvisioningTicket } from '../entities/provisioning-ticket.entity';
import { Checkin } from '../entities/checkin.entity';
import { CODocument } from '../entities/co-document.entity';
import { Environment } from '../entities/environment.entity';
import { RiskService } from '../services/risk.service';
import { Risk } from '../entities/risk.entity';
import { SuccessPlan } from '../entities/success-plan.entity';
import { CreateOnboardingDocumentDto } from '../dto/create-onboarding-document.dto';
import { CreateProvisioningTicketDto, UpdateProvisioningTicketDto } from '../dto/create-provisioning-ticket.dto';
import { CreateCheckinDto, UpdateCheckinDto } from '../dto/create-checkin.dto';
import { CreateCODocumentDto, UpdateCODocumentDto } from '../dto/create-co-document.dto';
import { CreateEnvironmentDto, UpdateEnvironmentDto } from '../dto/create-environment.dto';
import { CreateRiskDto, UpdateRiskDto } from '../dto/create-risk.dto';
import { CreateSuccessPlanDto, UpdateSuccessPlanDto } from '../dto/create-success-plan.dto';

@Controller('api/v1/onboarding')
export class AdditionalResourcesController {
  constructor(
    @InjectRepository(OnboardingDocument)
    private readonly documentRepository: Repository<OnboardingDocument>,
    @InjectRepository(ProvisioningTicket)
    private readonly provisioningRepository: Repository<ProvisioningTicket>,
    @InjectRepository(Checkin)
    private readonly checkinRepository: Repository<Checkin>,
    @InjectRepository(CODocument)
    private readonly coDocumentRepository: Repository<CODocument>,
    @InjectRepository(Environment)
    private readonly environmentRepository: Repository<Environment>,
    @InjectRepository(SuccessPlan)
    private readonly successPlanRepository: Repository<SuccessPlan>,
    private readonly riskService: RiskService,
  ) {}

  // ========== ONBOARDING DOCUMENTS ==========
  @Post('cases/:caseId/documents')
  async createDocument(@Param('caseId') caseId: string, @Body() dto: CreateOnboardingDocumentDto) {
    const document = this.documentRepository.create({ ...dto, caseId });
    return this.documentRepository.save(document);
  }

  @Get('cases/:caseId/documents')
  async getDocuments(@Param('caseId') caseId: string) {
    return this.documentRepository.find({
      where: { caseId },
      order: { createdAt: 'DESC' },
    });
  }

  @Patch('documents/:id/verify')
  async verifyDocument(@Param('id') id: string, @Body('verifiedBy') verifiedBy: string) {
    await this.documentRepository.update(id, {
      verifiedBy,
      verifiedAt: new Date(),
    });
    return this.documentRepository.findOne({ where: { id } });
  }

  // ========== PROVISIONING TICKETS ==========
  @Post('cases/:caseId/provisioning')
  async createProvisioningTicket(
    @Param('caseId') caseId: string,
    @Body() dto: CreateProvisioningTicketDto,
  ) {
    const ticket = this.provisioningRepository.create({ ...dto, caseId });
    return this.provisioningRepository.save(ticket);
  }

  @Get('cases/:caseId/provisioning')
  async getProvisioningTickets(@Param('caseId') caseId: string) {
    return this.provisioningRepository.find({
      where: { caseId },
      order: { createdAt: 'DESC' },
    });
  }

  @Patch('provisioning/:id')
  async updateProvisioningTicket(
    @Param('id') id: string,
    @Body() dto: UpdateProvisioningTicketDto,
  ) {
    await this.provisioningRepository.update(id, dto);
    return this.provisioningRepository.findOne({ where: { id } });
  }

  // ========== CHECKINS (30/60/90) ==========
  @Post('cases/:caseId/checkins')
  async createCheckin(@Param('caseId') caseId: string, @Body() dto: CreateCheckinDto) {
    const checkin = this.checkinRepository.create({ ...dto, caseId });
    return this.checkinRepository.save(checkin);
  }

  @Get('cases/:caseId/checkins')
  async getCheckins(@Param('caseId') caseId: string) {
    return this.checkinRepository.find({
      where: { caseId },
      order: { scheduledFor: 'ASC' },
    });
  }

  @Patch('checkins/:id')
  async updateCheckin(@Param('id') id: string, @Body() dto: UpdateCheckinDto) {
    await this.checkinRepository.update(id, dto);
    return this.checkinRepository.findOne({ where: { id } });
  }

  @Patch('checkins/:id/submit')
  async submitCheckin(
    @Param('id') id: string,
    @Body() dto: { rating: number; comments: string; formJson?: any; submittedBy: string },
  ) {
    await this.checkinRepository.update(id, {
      rating: dto.rating,
      comments: dto.comments,
      formJson: dto.formJson,
      submittedBy: dto.submittedBy,
      submittedAt: new Date(),
      completed: true,
    });
    return this.checkinRepository.findOne({ where: { id } });
  }
}

// ========== CXO RESOURCES CONTROLLER ==========
@Controller('api/v1/cxo')
export class CXOResourcesController {
  constructor(
    @InjectRepository(CODocument)
    private readonly documentRepository: Repository<CODocument>,
    @InjectRepository(Environment)
    private readonly environmentRepository: Repository<Environment>,
    @InjectRepository(SuccessPlan)
    private readonly successPlanRepository: Repository<SuccessPlan>,
    private readonly riskService: RiskService,
  ) {}

  // ========== CO DOCUMENTS ==========
  @Post('cases/:caseId/documents')
  async createDocument(@Param('caseId') caseId: string, @Body() dto: CreateCODocumentDto) {
    const document = this.documentRepository.create({ ...dto, caseId });
    return this.documentRepository.save(document);
  }

  @Get('cases/:caseId/documents')
  async getDocuments(@Param('caseId') caseId: string) {
    return this.documentRepository.find({
      where: { caseId },
      order: { createdAt: 'DESC' },
    });
  }

  @Patch('documents/:id')
  async updateDocument(@Param('id') id: string, @Body() dto: UpdateCODocumentDto) {
    await this.documentRepository.update(id, dto);
    return this.documentRepository.findOne({ where: { id } });
  }

  // ========== ENVIRONMENTS ==========
  @Post('cases/:caseId/environments')
  async createEnvironment(@Param('caseId') caseId: string, @Body() dto: CreateEnvironmentDto) {
    const environment = this.environmentRepository.create({ ...dto, caseId });
    return this.environmentRepository.save(environment);
  }

  @Get('cases/:caseId/environments')
  async getEnvironments(@Param('caseId') caseId: string) {
    return this.environmentRepository.find({
      where: { caseId },
      order: { createdAt: 'DESC' },
    });
  }

  @Patch('environments/:id')
  async updateEnvironment(@Param('id') id: string, @Body() dto: UpdateEnvironmentDto) {
    await this.environmentRepository.update(id, dto);
    return this.environmentRepository.findOne({ where: { id } });
  }

  // ========== RISKS ==========
  @Post('cases/:caseId/risks')
  async createRisk(@Param('caseId') caseId: string, @Body() dto: CreateRiskDto) {
    return this.riskService.addRisk({ ...dto, caseId });
  }

  @Get('cases/:caseId/risks')
  async getRisks(@Param('caseId') caseId: string) {
    return this.riskService.getRisksForCase(caseId);
  }

  @Get('cases/:caseId/risks/burndown')
  async getRiskBurndown(@Param('caseId') caseId: string) {
    return this.riskService.getRiskBurndown(caseId);
  }

  @Get('cases/:caseId/risks/critical')
  async getCriticalRisks(@Param('caseId') caseId: string) {
    return this.riskService.getCriticalRisks(caseId);
  }

  @Patch('risks/:id')
  async updateRisk(@Param('id') id: string, @Body() dto: UpdateRiskDto) {
    return this.riskService.updateRisk(id, dto);
  }

  @Delete('risks/:id')
  async deleteRisk(@Param('id') id: string) {
    await this.riskService.deleteRisk(id);
    return { message: 'Risk deleted successfully' };
  }

  // ========== SUCCESS PLANS ==========
  @Post('cases/:caseId/success-plan')
  async createSuccessPlan(@Param('caseId') caseId: string, @Body() dto: CreateSuccessPlanDto) {
    const plan = this.successPlanRepository.create({ ...dto, caseId });
    return this.successPlanRepository.save(plan);
  }

  @Get('cases/:caseId/success-plan')
  async getSuccessPlan(@Param('caseId') caseId: string) {
    return this.successPlanRepository.findOne({ where: { caseId } });
  }

  @Patch('success-plans/:id')
  async updateSuccessPlan(@Param('id') id: string, @Body() dto: UpdateSuccessPlanDto) {
    await this.successPlanRepository.update(id, dto);
    return this.successPlanRepository.findOne({ where: { id } });
  }
}
