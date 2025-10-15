import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { SecurityGroup } from './entities/security-group.entity';
import { Role } from './entities/role.entity';
import { RoleDelegation } from './entities/role-delegation.entity';
import { AccessAuditLog } from './entities/access-audit-log.entity';
import { IamUser } from './entities/iam-user.entity';
import { User } from '../users/entities/user.entity';

// Services
import { PolicyEvaluationService } from './services/policy-evaluation.service';
import { SoDCheckerService } from './services/sod-checker.service';
import { DelegationManagementService } from './services/delegation-management.service';
import { RoleAnalyticsService } from './services/role-analytics.service';
import { IamUserService } from './services/iam-user.service';

// Guards
import { PolicyGuard } from './guards/policy.guard';

// Controllers
import { RBACController } from './controllers/rbac.controller';
import { IamUsersController } from './controllers/iam-users.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Permission,
      SecurityGroup,
      Role,
      RoleDelegation,
      AccessAuditLog,
      IamUser,
      User,
    ]),
  ],
  providers: [
    PolicyEvaluationService,
    SoDCheckerService,
    DelegationManagementService,
    RoleAnalyticsService,
    IamUserService,
    PolicyGuard,
  ],
  controllers: [RBACController, IamUsersController],
  exports: [
    TypeOrmModule,
    PolicyEvaluationService,
    SoDCheckerService,
    DelegationManagementService,
    RoleAnalyticsService,
    IamUserService,
    PolicyGuard,
  ],
})
export class RbacModule {}
