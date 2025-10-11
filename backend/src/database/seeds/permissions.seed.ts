import { DataSource } from 'typeorm';
import { Permission } from '../../modules/rbac/entities/permission.entity';
import { UserRole } from '../../common/enums';

/**
 * Seed Default Permissions
 * Creates granular permissions for all features
 */
export async function seedPermissions(dataSource: DataSource) {
  const permissionRepository = dataSource.getRepository(Permission);

  const defaultPermissions: Partial<Permission>[] = [
    // Absence Permissions
    { name: 'View Own Absences', feature: 'absence', action: 'view', scope: 'self', assignableRoles: [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'Request Absence', feature: 'absence', action: 'create', scope: 'self', assignableRoles: [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'Cancel Own Absence', feature: 'absence', action: 'cancel', scope: 'self', assignableRoles: [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'View Team Absences', feature: 'absence', action: 'view', scope: 'team', assignableRoles: [UserRole.MANAGER, UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'Approve Team Absences', feature: 'absence', action: 'approve', scope: 'team', assignableRoles: [UserRole.MANAGER, UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'Reject Team Absences', feature: 'absence', action: 'reject', scope: 'team', assignableRoles: [UserRole.MANAGER, UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'View All Absences', feature: 'absence', action: 'view', scope: 'org', assignableRoles: [UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'Configure Absence Plans', feature: 'absence', action: 'configure', scope: 'org', assignableRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },

    // Employee Permissions
    { name: 'View Own Profile', feature: 'employee', action: 'view', scope: 'self', assignableRoles: [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'Edit Own Profile', feature: 'employee', action: 'update', scope: 'self', assignableRoles: [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'View Team Profiles', feature: 'employee', action: 'view', scope: 'team', assignableRoles: [UserRole.MANAGER, UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'Edit Team Profiles', feature: 'employee', action: 'update', scope: 'team', assignableRoles: [UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'View All Employees', feature: 'employee', action: 'view', scope: 'org', assignableRoles: [UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'Create Employee', feature: 'employee', action: 'create', scope: 'org', assignableRoles: [UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'Terminate Employee', feature: 'employee', action: 'terminate', scope: 'org', assignableRoles: [UserRole.HR_MANAGER, UserRole.ADMIN] },

    // Task Permissions
    { name: 'View Own Tasks', feature: 'task', action: 'view', scope: 'self', assignableRoles: [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'Complete Own Tasks', feature: 'task', action: 'complete', scope: 'self', assignableRoles: [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'View Team Tasks', feature: 'task', action: 'view', scope: 'team', assignableRoles: [UserRole.MANAGER, UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'Assign Team Tasks', feature: 'task', action: 'assign', scope: 'team', assignableRoles: [UserRole.MANAGER, UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'Create Checklists', feature: 'task', action: 'create_checklist', scope: 'org', assignableRoles: [UserRole.HR_MANAGER, UserRole.ADMIN] },

    // Document Permissions
    { name: 'View Own Documents', feature: 'document', action: 'view', scope: 'self', assignableRoles: [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'Upload Own Documents', feature: 'document', action: 'upload', scope: 'self', assignableRoles: [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'View Team Documents', feature: 'document', action: 'view', scope: 'team', assignableRoles: [UserRole.MANAGER, UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'Manage All Documents', feature: 'document', action: 'manage', scope: 'org', assignableRoles: [UserRole.HR_MANAGER, UserRole.ADMIN] },

    // Dashboard Permissions
    { name: 'Configure Own Dashboard', feature: 'dashboard', action: 'configure', scope: 'self', assignableRoles: [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'Configure Role Dashboards', feature: 'dashboard', action: 'configure', scope: 'org', assignableRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    { name: 'Create Saved Searches', feature: 'dashboard', action: 'create_search', scope: 'self', assignableRoles: [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'Share Saved Searches', feature: 'dashboard', action: 'share_search', scope: 'team', assignableRoles: [UserRole.MANAGER, UserRole.HR_MANAGER, UserRole.ADMIN] },

    // Report Permissions
    { name: 'View Standard Reports', feature: 'report', action: 'view', scope: 'self', assignableRoles: [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'View Team Reports', feature: 'report', action: 'view', scope: 'team', assignableRoles: [UserRole.MANAGER, UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'View Organization Reports', feature: 'report', action: 'view', scope: 'org', assignableRoles: [UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'Export Reports', feature: 'report', action: 'export', scope: 'org', assignableRoles: [UserRole.HR_MANAGER, UserRole.ADMIN] },

    // Audit Permissions
    { name: 'View Own Audit Log', feature: 'audit', action: 'view', scope: 'self', assignableRoles: [UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'View Team Audit Log', feature: 'audit', action: 'view', scope: 'team', assignableRoles: [UserRole.MANAGER, UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'View System Audit Log', feature: 'audit', action: 'view', scope: 'system', assignableRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },

    // System Permissions
    { name: 'Manage Users', feature: 'system', action: 'manage_users', scope: 'org', assignableRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
    { name: 'Manage Roles', feature: 'system', action: 'manage_roles', scope: 'system', assignableRoles: [UserRole.SUPER_ADMIN] },
    { name: 'Manage Permissions', feature: 'system', action: 'manage_permissions', scope: 'system', assignableRoles: [UserRole.SUPER_ADMIN] },
    { name: 'Impersonate Users', feature: 'system', action: 'impersonate', scope: 'org', assignableRoles: [UserRole.SUPER_ADMIN] },
    { name: 'System Configuration', feature: 'system', action: 'configure', scope: 'system', assignableRoles: [UserRole.SUPER_ADMIN] },
  ];

  for (const permData of defaultPermissions) {
    const existing = await permissionRepository.findOne({
      where: {
        feature: permData.feature,
        action: permData.action,
        scope: permData.scope,
      },
    });

    if (!existing) {
      const permission = permissionRepository.create(permData);
      await permissionRepository.save(permission);
      console.log(`✅ Created permission: ${permData.name}`);
    } else {
      console.log(`⏭️  Permission already exists: ${permData.name}`);
    }
  }

  console.log('✅ Permissions seeding completed');
}
