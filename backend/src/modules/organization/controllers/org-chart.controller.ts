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
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { OrgChartService } from '../services/org-chart.service';
import { DepartmentService, CreateDepartmentDto } from '../services/department.service';
import { PositionService, CreatePositionDto } from '../services/position.service';
import { PositionLevel } from '../entities/position.entity';

@Controller('organization')
@UseGuards(JwtAuthGuard)
export class OrgChartController {
  constructor(
    private readonly orgChartService: OrgChartService,
    private readonly departmentService: DepartmentService,
    private readonly positionService: PositionService,
  ) {}

  // ==================== ORG CHART ENDPOINTS ====================

  /**
   * Get full organization chart
   * GET /api/organization/chart
   */
  @Get('chart')
  async getOrgChart(@Req() req: any) {
    const organizationId = req.user.organizationId;
    return this.orgChartService.getOrgChart(organizationId);
  }

  /**
   * Get organization chart statistics
   * GET /api/organization/chart/stats
   */
  @Get('chart/stats')
  async getOrgChartStats(@Req() req: any) {
    const organizationId = req.user.organizationId;
    return this.orgChartService.getOrgChartStats(organizationId);
  }

  /**
   * Get department org chart
   * GET /api/organization/chart/department/:id
   */
  @Get('chart/department/:id')
  async getDepartmentChart(@Param('id') departmentId: string) {
    return this.orgChartService.getDepartmentChart(departmentId);
  }

  /**
   * Get employee reporting structure
   * GET /api/organization/chart/employee/:id/reporting
   */
  @Get('chart/employee/:id/reporting')
  async getEmployeeReporting(@Param('id') employeeId: string) {
    return this.orgChartService.getEmployeeReportingChain(employeeId);
  }

  /**
   * Search organization chart
   * GET /api/organization/chart/search?q=...
   */
  @Get('chart/search')
  async searchOrgChart(@Req() req: any, @Query('q') query: string) {
    const organizationId = req.user.organizationId;
    return this.orgChartService.searchOrgChart(organizationId, query);
  }

  /**
   * Rebuild organization chart
   * POST /api/organization/chart/rebuild
   */
  @Post('chart/rebuild')
  async rebuildOrgChart(@Req() req: any) {
    const organizationId = req.user.organizationId;
    await this.orgChartService.rebuildOrgChart(organizationId);
    return { message: 'Organization chart rebuild initiated' };
  }

  // ==================== DEPARTMENT ENDPOINTS ====================

  /**
   * Get all departments
   * GET /api/organization/departments
   */
  @Get('departments')
  async getDepartments(@Req() req: any) {
    const organizationId = req.user.organizationId;
    return this.departmentService.findAll(organizationId);
  }

  /**
   * Get department tree
   * GET /api/organization/departments/tree
   */
  @Get('departments/tree')
  async getDepartmentTree(@Req() req: any) {
    const organizationId = req.user.organizationId;
    return this.departmentService.getDepartmentTree(organizationId);
  }

  /**
   * Get department by ID
   * GET /api/organization/departments/:id
   */
  @Get('departments/:id')
  async getDepartment(@Param('id') id: string) {
    return this.departmentService.findOne(id);
  }

  /**
   * Create department
   * POST /api/organization/departments
   */
  @Post('departments')
  async createDepartment(@Req() req: any, @Body() data: CreateDepartmentDto) {
    data.organizationId = req.user.organizationId;
    return this.departmentService.create(data);
  }

  /**
   * Update department
   * PUT /api/organization/departments/:id
   */
  @Put('departments/:id')
  async updateDepartment(@Param('id') id: string, @Body() data: Partial<CreateDepartmentDto>) {
    return this.departmentService.update(id, data);
  }

  /**
   * Delete department
   * DELETE /api/organization/departments/:id
   */
  @Delete('departments/:id')
  async deleteDepartment(@Param('id') id: string) {
    await this.departmentService.delete(id);
    return { message: 'Department deleted successfully' };
  }

  /**
   * Get department hierarchy path
   * GET /api/organization/departments/:id/path
   */
  @Get('departments/:id/path')
  async getDepartmentPath(@Param('id') id: string) {
    return this.departmentService.getHierarchyPath(id);
  }

  // ==================== POSITION ENDPOINTS ====================

  /**
   * Get all positions
   * GET /api/organization/positions
   */
  @Get('positions')
  async getPositions(
    @Req() req: any,
    @Query('departmentId') departmentId?: string,
    @Query('level') level?: PositionLevel,
  ) {
    const organizationId = req.user.organizationId;
    return this.positionService.findAll(organizationId, { departmentId, level });
  }

  /**
   * Get vacant positions
   * GET /api/organization/positions/vacant
   */
  @Get('positions/vacant')
  async getVacantPositions(@Req() req: any) {
    const organizationId = req.user.organizationId;
    return this.positionService.getVacantPositions(organizationId);
  }

  /**
   * Get positions by level
   * GET /api/organization/positions/level/:level
   */
  @Get('positions/level/:level')
  async getPositionsByLevel(@Req() req: any, @Param('level') level: PositionLevel) {
    const organizationId = req.user.organizationId;
    return this.positionService.getByLevel(organizationId, level);
  }

  /**
   * Get position by ID
   * GET /api/organization/positions/:id
   */
  @Get('positions/:id')
  async getPosition(@Param('id') id: string) {
    return this.positionService.findOne(id);
  }

  /**
   * Create position
   * POST /api/organization/positions
   */
  @Post('positions')
  async createPosition(@Req() req: any, @Body() data: CreatePositionDto) {
    data.organizationId = req.user.organizationId;
    return this.positionService.create(data);
  }

  /**
   * Update position
   * PUT /api/organization/positions/:id
   */
  @Put('positions/:id')
  async updatePosition(@Param('id') id: string, @Body() data: Partial<CreatePositionDto>) {
    return this.positionService.update(id, data);
  }

  /**
   * Delete position
   * DELETE /api/organization/positions/:id
   */
  @Delete('positions/:id')
  async deletePosition(@Param('id') id: string) {
    await this.positionService.delete(id);
    return { message: 'Position deleted successfully' };
  }
}
