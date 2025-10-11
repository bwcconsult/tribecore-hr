import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Permission Decorator
 * Requires specific permissions (feature, action, scope)
 * 
 * @example
 * @RequirePermissions({ feature: 'absence', action: 'approve', scope: 'team' })
 * async approveAbsence() {}
 */
export interface PermissionCheck {
  feature: string;
  action: string;
  scope: string;
}

export const RequirePermissions = (...permissions: PermissionCheck[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Shorthand decorators for common permission patterns
 */
export const CanViewSelf = (feature: string) =>
  RequirePermissions({ feature, action: 'view', scope: 'self' });

export const CanViewTeam = (feature: string) =>
  RequirePermissions({ feature, action: 'view', scope: 'team' });

export const CanViewOrg = (feature: string) =>
  RequirePermissions({ feature, action: 'view', scope: 'org' });

export const CanCreate = (feature: string, scope: string = 'self') =>
  RequirePermissions({ feature, action: 'create', scope });

export const CanUpdate = (feature: string, scope: string = 'self') =>
  RequirePermissions({ feature, action: 'update', scope });

export const CanDelete = (feature: string, scope: string = 'self') =>
  RequirePermissions({ feature, action: 'delete', scope });

export const CanApprove = (feature: string, scope: string = 'team') =>
  RequirePermissions({ feature, action: 'approve', scope });
