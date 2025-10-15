import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { Organization } from './entities/organization.entity';

// Org Chart Entities
import { Department } from './entities/department.entity';
import { Position } from './entities/position.entity';
import { OrgChartNode } from './entities/org-chart-node.entity';

// Org Chart Services
import { OrgChartService } from './services/org-chart.service';
import { DepartmentService } from './services/department.service';
import { PositionService } from './services/position.service';

// Org Chart Controllers
import { OrgChartController } from './controllers/org-chart.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization,
      Department,
      Position,
      OrgChartNode,
    ]),
  ],
  controllers: [
    OrganizationController,
    OrgChartController,
  ],
  providers: [
    OrganizationService,
    OrgChartService,
    DepartmentService,
    PositionService,
  ],
  exports: [
    OrganizationService,
    OrgChartService,
    DepartmentService,
    PositionService,
  ],
})
export class OrganizationModule {}
