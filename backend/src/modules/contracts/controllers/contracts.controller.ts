import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ContractService } from '../services/contract.service';
import { ApprovalService } from '../services/approval.service';
import { ObligationService } from '../services/obligation.service';
import { RenewalService } from '../services/renewal.service';
import { CreateContractDto } from '../dto/create-contract.dto';
import { UpdateContractDto } from '../dto/update-contract.dto';
import { ApprovalDecisionDto } from '../dto/approval-decision.dto';
import { TerminateContractDto } from '../dto/terminate-contract.dto';

@Controller('contracts')
@UseGuards(JwtAuthGuard)
export class ContractsController {
  constructor(
    private readonly contractService: ContractService,
    private readonly approvalService: ApprovalService,
    private readonly obligationService: ObligationService,
    private readonly renewalService: RenewalService,
  ) {}

  /**
   * Create new contract
   * POST /contracts
   */
  @Post()
  async create(@Body() createDto: CreateContractDto, @Req() req: any) {
    const organizationId = req.user.organizationId;
    const createdBy = req.user.userId;
    return await this.contractService.create(organizationId, createDto, createdBy);
  }

  /**
   * Get all contracts
   * GET /contracts
   */
  @Get()
  async findAll(@Req() req: any, @Query() filters: any) {
    const organizationId = req.user.organizationId;
    return await this.contractService.findAll(organizationId, filters);
  }

  /**
   * Get contract statistics
   * GET /contracts/stats
   */
  @Get('stats')
  async getStats(@Req() req: any) {
    const organizationId = req.user.organizationId;
    return await this.contractService.getStats(organizationId);
  }

  /**
   * Get contract by ID
   * GET /contracts/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const organizationId = req.user.organizationId;
    return await this.contractService.findOne(id, organizationId);
  }

  /**
   * Update contract
   * PUT /contracts/:id
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateContractDto, @Req() req: any) {
    const organizationId = req.user.organizationId;
    const updatedBy = req.user.userId;
    return await this.contractService.update(id, organizationId, updateDto, updatedBy);
  }

  /**
   * Delete contract
   * DELETE /contracts/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @Req() req: any) {
    const organizationId = req.user.organizationId;
    await this.contractService.delete(id, organizationId);
  }

  // ==================== WORKFLOW ENDPOINTS ====================

  /**
   * Submit contract for internal review
   * POST /contracts/:id/submit
   */
  @Post(':id/submit')
  async submitForReview(@Param('id') id: string, @Req() req: any) {
    const organizationId = req.user.organizationId;
    const submittedBy = req.user.userId;
    const contract = await this.contractService.submitForReview(id, organizationId, submittedBy);
    
    // Build approval route
    await this.approvalService.buildApprovalRoute(contract);
    
    return contract;
  }

  /**
   * Send for counterparty review
   * POST /contracts/:id/send-counterparty
   */
  @Post(':id/send-counterparty')
  async sendForCounterparty(@Param('id') id: string, @Req() req: any) {
    const organizationId = req.user.organizationId;
    const sentBy = req.user.userId;
    return await this.contractService.sendForCounterpartyReview(id, organizationId, sentBy);
  }

  /**
   * Mark contract as agreed (final)
   * POST /contracts/:id/agree
   */
  @Post(':id/agree')
  async markAsAgreed(@Param('id') id: string, @Req() req: any) {
    const organizationId = req.user.organizationId;
    const agreedBy = req.user.userId;
    return await this.contractService.markAsAgreed(id, organizationId, agreedBy);
  }

  /**
   * Launch e-signature
   * POST /contracts/:id/launch-signature
   */
  @Post(':id/launch-signature')
  async launchSignature(
    @Param('id') id: string,
    @Body() body: { provider: string; envelopeId: string },
    @Req() req: any,
  ) {
    const organizationId = req.user.organizationId;
    const launchedBy = req.user.userId;
    return await this.contractService.launchSignature(
      id,
      organizationId,
      launchedBy,
      body.provider,
      body.envelopeId,
    );
  }

  /**
   * Mark contract as executed
   * POST /contracts/:id/execute
   */
  @Post(':id/execute')
  async markAsExecuted(
    @Param('id') id: string,
    @Body() body: { documentHash: string; signedCertificateUrl: string; repositoryUrl: string },
    @Req() req: any,
  ) {
    const organizationId = req.user.organizationId;
    const executedBy = req.user.userId;
    return await this.contractService.markAsExecuted(
      id,
      organizationId,
      executedBy,
      body.documentHash,
      body.signedCertificateUrl,
      body.repositoryUrl,
    );
  }

  /**
   * Activate contract (start obligation tracking)
   * POST /contracts/:id/activate
   */
  @Post(':id/activate')
  async activate(@Param('id') id: string, @Req() req: any) {
    const organizationId = req.user.organizationId;
    const activatedBy = req.user.userId;
    const contract = await this.contractService.activate(id, organizationId, activatedBy);
    
    // Seed obligations
    await this.obligationService.seedFromContract(contract);
    
    // Create renewal tracking
    await this.renewalService.createRenewalTracking(contract);
    
    return contract;
  }

  // ==================== APPROVAL ENDPOINTS ====================

  /**
   * Get approvals for contract
   * GET /contracts/:id/approvals
   */
  @Get(':id/approvals')
  async getApprovals(@Param('id') id: string) {
    return await this.approvalService.getApprovals(id);
  }

  /**
   * Make approval decision
   * POST /contracts/approvals/:approvalId/decide
   */
  @Post('approvals/:approvalId/decide')
  async makeApprovalDecision(
    @Param('approvalId') approvalId: string,
    @Body() decision: ApprovalDecisionDto,
    @Req() req: any,
  ) {
    const approverId = req.user.userId;
    return await this.approvalService.makeDecision(approvalId, approverId, decision);
  }

  // ==================== OBLIGATION ENDPOINTS ====================

  /**
   * Get obligations for contract
   * GET /contracts/:id/obligations
   */
  @Get(':id/obligations')
  async getObligations(@Param('id') id: string) {
    return await this.obligationService.getByContract(id);
  }

  // ==================== RENEWAL ENDPOINTS ====================

  /**
   * Get renewal for contract
   * GET /contracts/:id/renewal
   */
  @Get(':id/renewal')
  async getRenewal(@Param('id') id: string, @Req() req: any) {
    const contract = await this.contractService.findOne(id, req.user.organizationId);
    return contract.renewals?.[0] || null;
  }

  /**
   * Get renewal radar (all upcoming renewals)
   * GET /contracts/renewals/radar
   */
  @Get('renewals/radar')
  async getRenewalRadar(@Req() req: any) {
    const organizationId = req.user.organizationId;
    return await this.renewalService.getRenewalRadar(organizationId);
  }
}
