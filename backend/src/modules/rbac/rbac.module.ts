import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { SecurityGroup } from './entities/security-group.entity';
import { Role } from './entities/role.entity';
import { RoleDelegation } from './entities/role-delegation.entity';
import { AccessAuditLog } from './entities/access-audit-log.entity';
import { User } from '../users/entities/user.entity';

// Services
import { PolicyEvaluationService } from './services/policy-evaluation.service';
import { SoDCheckerService } from './services/sod-checker.service';
import { DelegationManagementService } from './services/delegation-management.service';
import { RoleAnalyticsService } from './services/role-analytics.service';

// Guards
import { PolicyGuard } from './guards/policy.guard';

// Controllers
import { RBACController } from './controllers/rbac.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Permission,
      SecurityGroup,
      Role,
      RoleDelegation,
      AccessAuditLog,
      User,
    ]),
  ],
  providers: [
    PolicyEvaluationService,
    SoDCheckerService,
    DelegationManagementService,
    RoleAnalyticsService,
    PolicyGuard,
  ],
  controllers: [RBACController],
  exports: [
    TypeOrmModule,
    PolicyEvaluationService,
    SoDCheckerService,
    DelegationManagementService,
    RoleAnalyticsService,
    PolicyGuard,
  ],
})
export class RbacModule {}
