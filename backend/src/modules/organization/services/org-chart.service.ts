import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrgChartNode, NodeType } from '../entities/org-chart-node.entity';
import { Department } from '../entities/department.entity';
import { Position, PositionLevel } from '../entities/position.entity';

export interface OrgChartTreeNode {
  id: string;
  nodeType: NodeType;
  employeeId?: string;
  employeeName?: string;
  employeeEmail?: string;
  employeeAvatar?: string;
  positionId?: string;
  positionTitle?: string;
  positionLevel?: string;
  departmentId?: string;
  departmentName?: string;
  level: number;
  directReports: number;
  totalReports: number;
  children: OrgChartTreeNode[];
  metadata?: any;
  displaySettings?: any;
  isActive: boolean;
}

export interface OrgChartStats {
  totalEmployees: number;
  totalDepartments: number;
  totalPositions: number;
  managementLevels: number;
  avgSpanOfControl: number;
  vacantPositions: number;
  departmentBreakdown: { name: string; count: number }[];
  levelBreakdown: { level: string; count: number }[];
}

@Injectable()
export class OrgChartService {
  private readonly logger = new Logger(OrgChartService.name);

  constructor(
    @InjectRepository(OrgChartNode)
    private readonly nodeRepo: Repository<OrgChartNode>,
    @InjectRepository(Department)
    private readonly deptRepo: Repository<Department>,
    @InjectRepository(Position)
    private readonly positionRepo: Repository<Position>,
  ) {}

  /**
   * Get full organization chart as tree structure
   */
  async getOrgChart(organizationId: string): Promise<OrgChartTreeNode[]> {
    // Get all nodes with relations
    const nodes = await this.nodeRepo.find({
      where: { organizationId, isActive: true },
      relations: ['position', 'department'],
      order: { level: 'ASC' },
    });

    // Build tree structure starting from root nodes (level 0)
    const rootNodes = nodes.filter((n) => !n.parentNodeId || n.level === 0);
    
    return rootNodes.map((root) => this.buildTreeNode(root, nodes));
  }

  /**
   * Get organization chart for specific department
   */
  async getDepartmentChart(departmentId: string): Promise<OrgChartTreeNode[]> {
    const nodes = await this.nodeRepo.find({
      where: { departmentId, isActive: true },
      relations: ['position', 'department'],
      order: { level: 'ASC' },
    });

    const rootNodes = nodes.filter((n) => !n.parentNodeId || n.level === 0);
    return rootNodes.map((root) => this.buildTreeNode(root, nodes));
  }

  /**
   * Get reporting structure for an employee
   */
  async getEmployeeReportingChain(employeeId: string): Promise<{
    reportsTo: OrgChartTreeNode[];
    directReports: OrgChartTreeNode[];
    allReports: OrgChartTreeNode[];
  }> {
    const node = await this.nodeRepo.findOne({
      where: { employeeId, isActive: true },
      relations: ['position', 'department', 'parentNode'],
    });

    if (!node) {
      throw new NotFoundException('Employee node not found');
    }

    // Get reporting chain upwards
    const reportsTo = await this.getReportingChainUp(node);

    // Get direct reports
    const directReports = await this.nodeRepo.find({
      where: { parentNodeId: node.id, isActive: true },
      relations: ['position', 'department'],
    });

    // Get all reports (recursive)
    const allReports = await this.getAllReportsDown(node.id);

    return {
      reportsTo: reportsTo.map((n) => this.nodeToTreeNode(n)),
      directReports: directReports.map((n) => this.nodeToTreeNode(n)),
      allReports: allReports.map((n) => this.nodeToTreeNode(n)),
    };
  }

  /**
   * Get organization chart statistics
   */
  async getOrgChartStats(organizationId: string): Promise<OrgChartStats> {
    const [nodes, departments, positions] = await Promise.all([
      this.nodeRepo.find({ where: { organizationId, isActive: true } }),
      this.deptRepo.find({ where: { organizationId, isActive: true } }),
      this.positionRepo.find({ where: { organizationId, isActive: true } }),
    ]);

    const employeeNodes = nodes.filter((n) => n.nodeType === NodeType.EMPLOYEE);
    const vacantPositions = positions.reduce((sum, p) => sum + p.vacantPositions, 0);

    // Calculate average span of control
    const managersWithReports = nodes.filter((n) => n.directReports > 0);
    const avgSpanOfControl = managersWithReports.length > 0
      ? managersWithReports.reduce((sum, n) => sum + n.directReports, 0) / managersWithReports.length
      : 0;

    // Get max level
    const managementLevels = Math.max(...nodes.map((n) => n.level), 0) + 1;

    // Department breakdown
    const deptCounts = new Map<string, number>();
    departments.forEach((dept) => {
      deptCounts.set(dept.name, dept.employeeCount);
    });

    // Level breakdown (using position levels)
    const levelCounts = new Map<string, number>();
    employeeNodes.forEach((node) => {
      const position = positions.find((p) => p.id === node.positionId);
      if (position) {
        const level = position.level;
        levelCounts.set(level, (levelCounts.get(level) || 0) + 1);
      }
    });

    return {
      totalEmployees: employeeNodes.length,
      totalDepartments: departments.length,
      totalPositions: positions.length,
      managementLevels,
      avgSpanOfControl: Math.round(avgSpanOfControl * 10) / 10,
      vacantPositions,
      departmentBreakdown: Array.from(deptCounts.entries()).map(([name, count]) => ({
        name,
        count,
      })),
      levelBreakdown: Array.from(levelCounts.entries()).map(([level, count]) => ({
        level,
        count,
      })),
    };
  }

  /**
   * Search organization chart
   */
  async searchOrgChart(organizationId: string, query: string): Promise<OrgChartTreeNode[]> {
    // This would integrate with employee search
    // For now, return nodes that match department or position
    const positions = await this.positionRepo
      .createQueryBuilder('position')
      .where('position.organizationId = :organizationId', { organizationId })
      .andWhere('LOWER(position.title) LIKE LOWER(:query)', { query: `%${query}%` })
      .getMany();

    const departments = await this.deptRepo
      .createQueryBuilder('department')
      .where('department.organizationId = :organizationId', { organizationId })
      .andWhere('LOWER(department.name) LIKE LOWER(:query)', { query: `%${query}%` })
      .getMany();

    const positionIds = positions.map((p) => p.id);
    const deptIds = departments.map((d) => d.id);

    const nodes = await this.nodeRepo
      .createQueryBuilder('node')
      .leftJoinAndSelect('node.position', 'position')
      .leftJoinAndSelect('node.department', 'department')
      .where('node.organizationId = :organizationId', { organizationId })
      .andWhere('node.isActive = :isActive', { isActive: true })
      .andWhere('(node.positionId IN (:...positionIds) OR node.departmentId IN (:...deptIds))', {
        positionIds: positionIds.length > 0 ? positionIds : [''],
        deptIds: deptIds.length > 0 ? deptIds : [''],
      })
      .getMany();

    return nodes.map((n) => this.nodeToTreeNode(n));
  }

  /**
   * Create or update organization chart node
   */
  async upsertNode(data: Partial<OrgChartNode>): Promise<OrgChartNode> {
    let node = data.id
      ? await this.nodeRepo.findOne({ where: { id: data.id } })
      : null;

    if (!node) {
      node = this.nodeRepo.create(data);
    } else {
      Object.assign(node, data);
    }

    // Calculate level and path
    if (data.parentNodeId) {
      const parent = await this.nodeRepo.findOne({ where: { id: data.parentNodeId } });
      if (parent) {
        node.level = parent.level + 1;
        node.path = [...(parent.path || []), parent.id];
      }
    } else {
      node.level = 0;
      node.path = [];
    }

    const saved = await this.nodeRepo.save(node);

    // Update parent's report counts
    if (saved.parentNodeId) {
      await this.updateReportCounts(saved.parentNodeId);
    }

    this.logger.log(`Org chart node ${saved.id} upserted`);
    return saved;
  }

  /**
   * Delete organization chart node
   */
  async deleteNode(nodeId: string): Promise<void> {
    const node = await this.nodeRepo.findOne({
      where: { id: nodeId },
      relations: ['children'],
    });

    if (!node) {
      throw new NotFoundException('Node not found');
    }

    if (node.children && node.children.length > 0) {
      throw new BadRequestException('Cannot delete node with children. Reassign them first.');
    }

    const parentId = node.parentNodeId;

    await this.nodeRepo.remove(node);

    // Update parent's counts
    if (parentId) {
      await this.updateReportCounts(parentId);
    }

    this.logger.log(`Org chart node ${nodeId} deleted`);
  }

  /**
   * Rebuild organization chart from employee data
   */
  async rebuildOrgChart(organizationId: string): Promise<void> {
    // This would sync with employee/position data
    // Implementation depends on your employee module structure
    this.logger.log(`Rebuilding org chart for organization ${organizationId}`);
    
    // Delete existing nodes
    await this.nodeRepo.delete({ organizationId });

    // Rebuild from employee manager relationships
    // This is a placeholder - actual implementation would query employees
    
    this.logger.log('Org chart rebuild completed');
  }

  // ==================== PRIVATE HELPER METHODS ====================

  private buildTreeNode(node: OrgChartNode, allNodes: OrgChartNode[]): OrgChartTreeNode {
    const children = allNodes.filter((n) => n.parentNodeId === node.id);

    return {
      id: node.id,
      nodeType: node.nodeType,
      employeeId: node.employeeId,
      employeeName: undefined, // Would come from employee join
      employeeEmail: undefined,
      employeeAvatar: undefined,
      positionId: node.positionId,
      positionTitle: node.position?.title,
      positionLevel: node.position?.level,
      departmentId: node.departmentId,
      departmentName: node.department?.name,
      level: node.level,
      directReports: node.directReports,
      totalReports: node.totalReports,
      children: children.map((child) => this.buildTreeNode(child, allNodes)),
      metadata: node.metadata,
      displaySettings: node.displaySettings,
      isActive: node.isActive,
    };
  }

  private nodeToTreeNode(node: OrgChartNode): OrgChartTreeNode {
    return {
      id: node.id,
      nodeType: node.nodeType,
      employeeId: node.employeeId,
      positionId: node.positionId,
      positionTitle: node.position?.title,
      positionLevel: node.position?.level,
      departmentId: node.departmentId,
      departmentName: node.department?.name,
      level: node.level,
      directReports: node.directReports,
      totalReports: node.totalReports,
      children: [],
      metadata: node.metadata,
      displaySettings: node.displaySettings,
      isActive: node.isActive,
    };
  }

  private async getReportingChainUp(node: OrgChartNode): Promise<OrgChartNode[]> {
    const chain: OrgChartNode[] = [];
    let current = node;

    while (current.parentNodeId) {
      const parent = await this.nodeRepo.findOne({
        where: { id: current.parentNodeId },
        relations: ['position', 'department'],
      });

      if (!parent) break;

      chain.push(parent);
      current = parent;
    }

    return chain;
  }

  private async getAllReportsDown(nodeId: string): Promise<OrgChartNode[]> {
    const directReports = await this.nodeRepo.find({
      where: { parentNodeId: nodeId, isActive: true },
      relations: ['position', 'department'],
    });

    const allReports: OrgChartNode[] = [...directReports];

    for (const report of directReports) {
      const subReports = await this.getAllReportsDown(report.id);
      allReports.push(...subReports);
    }

    return allReports;
  }

  private async updateReportCounts(nodeId: string): Promise<void> {
    const node = await this.nodeRepo.findOne({ where: { id: nodeId } });
    if (!node) return;

    const directReports = await this.nodeRepo.count({
      where: { parentNodeId: nodeId, isActive: true },
    });

    const allReports = await this.getAllReportsDown(nodeId);

    node.directReports = directReports;
    node.totalReports = allReports.length;

    await this.nodeRepo.save(node);

    // Recursively update parent
    if (node.parentNodeId) {
      await this.updateReportCounts(node.parentNodeId);
    }
  }
}
