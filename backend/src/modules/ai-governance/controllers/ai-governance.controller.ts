import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AIGovernanceService } from '../services/ai-governance.service';
import {
  CreateAISystemDto,
  UpdateAISystemDto,
  RecordBiasTestDto,
  UpdateModelVersionDto,
  CertifyAISystemDto,
  LogAIDecisionDto,
  ReviewAIDecisionDto,
  RecordDecisionOutcomeDto,
  GetAIDecisionLogsQueryDto,
  GenerateComplianceReportDto,
} from '../dto/ai-governance.dto';

@ApiTags('AI Governance')
@Controller('ai-governance')
export class AIGovernanceController {
  constructor(private readonly aiGovernanceService: AIGovernanceService) {}

  // ============ AI System Management ============

  @Post('systems')
  @ApiOperation({ summary: 'Register new AI system' })
  @ApiResponse({ status: 201, description: 'AI system registered successfully' })
  async createAISystem(@Body() dto: CreateAISystemDto) {
    return this.aiGovernanceService.createAISystem(dto);
  }

  @Put('systems/:id')
  @ApiOperation({ summary: 'Update AI system' })
  async updateAISystem(@Param('id') id: string, @Body() dto: UpdateAISystemDto) {
    return this.aiGovernanceService.updateAISystem(id, dto);
  }

  @Get('systems/:id')
  @ApiOperation({ summary: 'Get AI system details' })
  async getAISystem(@Param('id') id: string) {
    return this.aiGovernanceService.getAISystem(id);
  }

  @Get('organizations/:organizationId/systems')
  @ApiOperation({ summary: 'Get all AI systems for organization' })
  async getAISystemsByOrg(@Param('organizationId') organizationId: string) {
    return this.aiGovernanceService.getAISystemsByOrg(organizationId);
  }

  @Get('organizations/:organizationId/systems/high-risk')
  @ApiOperation({ summary: 'Get high-risk AI systems' })
  async getHighRiskAISystems(@Param('organizationId') organizationId: string) {
    return this.aiGovernanceService.getHighRiskAISystems(organizationId);
  }

  @Post('systems/bias-test')
  @ApiOperation({ summary: 'Record bias test results' })
  async recordBiasTest(@Body() dto: RecordBiasTestDto) {
    return this.aiGovernanceService.recordBiasTest(dto);
  }

  @Post('systems/model-version')
  @ApiOperation({ summary: 'Update model version' })
  async updateModelVersion(@Body() dto: UpdateModelVersionDto) {
    return this.aiGovernanceService.updateModelVersion(dto);
  }

  @Post('systems/certify')
  @ApiOperation({ summary: 'Certify AI system' })
  async certifyAISystem(@Body() dto: CertifyAISystemDto) {
    return this.aiGovernanceService.certifyAISystem(dto);
  }

  @Put('systems/:id/decommission')
  @ApiOperation({ summary: 'Decommission AI system' })
  async decommissionAISystem(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.aiGovernanceService.decommissionAISystem(id, reason);
  }

  // ============ AI Decision Logging ============

  @Post('decisions/log')
  @ApiOperation({ summary: 'Log AI decision' })
  @ApiResponse({ status: 201, description: 'Decision logged successfully' })
  async logAIDecision(@Body() dto: LogAIDecisionDto) {
    return this.aiGovernanceService.logAIDecision(dto);
  }

  @Put('decisions/:id/review')
  @ApiOperation({ summary: 'Review AI decision' })
  async reviewAIDecision(
    @Param('id') id: string,
    @Body() dto: Omit<ReviewAIDecisionDto, 'decisionLogId'>,
  ) {
    return this.aiGovernanceService.reviewAIDecision({
      ...dto,
      decisionLogId: id,
    });
  }

  @Put('decisions/:id/outcome')
  @ApiOperation({ summary: 'Record actual outcome of AI decision' })
  async recordDecisionOutcome(
    @Param('id') id: string,
    @Body() dto: Omit<RecordDecisionOutcomeDto, 'decisionLogId'>,
  ) {
    return this.aiGovernanceService.recordDecisionOutcome({
      ...dto,
      decisionLogId: id,
    });
  }

  @Get('decisions')
  @ApiOperation({ summary: 'Get AI decision logs' })
  async getAIDecisionLogs(@Query() query: GetAIDecisionLogsQueryDto) {
    return this.aiGovernanceService.getAIDecisionLogs(query);
  }

  @Get('decisions/subject/:subjectType/:subjectId')
  @ApiOperation({ summary: 'Get decision logs for specific subject' })
  async getDecisionLogsBySubject(
    @Param('subjectType') subjectType: string,
    @Param('subjectId') subjectId: string,
  ) {
    return this.aiGovernanceService.getDecisionLogsBySubject(subjectType, subjectId);
  }

  @Get('organizations/:organizationId/decisions/flagged')
  @ApiOperation({ summary: 'Get flagged decisions requiring review' })
  async getFlaggedDecisions(@Param('organizationId') organizationId: string) {
    return this.aiGovernanceService.getFlaggedDecisions(organizationId);
  }

  // ============ Compliance & Reporting ============

  @Post('compliance/report')
  @ApiOperation({ summary: 'Generate compliance report' })
  async generateComplianceReport(@Body() dto: GenerateComplianceReportDto) {
    return this.aiGovernanceService.generateComplianceReport(dto);
  }

  @Get('organizations/:organizationId/systems/due-for-review')
  @ApiOperation({ summary: 'Get systems due for review' })
  async getSystemsDueForReview(@Param('organizationId') organizationId: string) {
    return this.aiGovernanceService.getSystemsDueForReview(organizationId);
  }

  // ============ Dashboard & Analytics ============

  @Get('organizations/:organizationId/dashboard')
  @ApiOperation({ summary: 'Get AI governance dashboard data' })
  async getDashboard(@Param('organizationId') organizationId: string) {
    const [
      allSystems,
      highRiskSystems,
      systemsDueForReview,
      flaggedDecisions,
    ] = await Promise.all([
      this.aiGovernanceService.getAISystemsByOrg(organizationId),
      this.aiGovernanceService.getHighRiskAISystems(organizationId),
      this.aiGovernanceService.getSystemsDueForReview(organizationId),
      this.aiGovernanceService.getFlaggedDecisions(organizationId),
    ]);

    const certifiedSystems = allSystems.filter(s => s.certified).length;
    const systemsWithBiasTests = allSystems.filter(s => s.biasTested).length;
    const systemsWithDPIA = allSystems.filter(s => s.hasDataProtectionImpactAssessment).length;

    return {
      summary: {
        totalSystems: allSystems.length,
        highRiskSystems: highRiskSystems.length,
        certifiedSystems,
        certificationRate: allSystems.length > 0 ? (certifiedSystems / allSystems.length) * 100 : 0,
      },
      compliance: {
        biasTestCoverage: allSystems.length > 0 ? (systemsWithBiasTests / allSystems.length) * 100 : 0,
        dpiaCoverage: highRiskSystems.length > 0 ? (systemsWithDPIA / highRiskSystems.length) * 100 : 0,
      },
      alerts: {
        systemsDueForReview: systemsDueForReview.length,
        decisionsRequiringReview: flaggedDecisions.length,
      },
      systems: allSystems.map(s => ({
        id: s.id,
        name: s.name,
        riskLevel: s.riskLevel,
        status: s.status,
        certified: s.certified,
        nextReviewDate: s.nextReviewDate,
      })),
    };
  }
}
