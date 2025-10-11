import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY, PermissionCheck } from '../decorators/permissions.decorator';
import { UserRole } from '../enums';

/**
 * PermissionsGuard
 * Validates user has required permissions based on @RequirePermissions decorator
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<PermissionCheck[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true; // No permissions required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Super Admin has all permissions
    if (user.roles?.includes(UserRole.SUPER_ADMIN)) {
      return true;
    }

    // Check if user has any of the required permissions
    const hasPermission = this.checkPermissions(user, requiredPermissions);

    if (!hasPermission) {
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${JSON.stringify(requiredPermissions)}`,
      );
    }

    return true;
  }

  private checkPermissions(user: any, requiredPermissions: PermissionCheck[]): boolean {
    // For now, use role-based logic until Permission entity is fully wired
    // This will be enhanced to check actual Permission records from database

    for (const permission of requiredPermissions) {
      if (this.hasPermissionByRole(user, permission)) {
        return true;
      }
    }

    return false;
  }

  private hasPermissionByRole(user: any, permission: PermissionCheck): boolean {
    const { feature, action, scope } = permission;
    const roles = user.roles || [];

    // Employee - self scope only
    if (roles.includes(UserRole.EMPLOYEE)) {
      if (scope === 'self') {
        if (feature === 'absence' && ['view', 'create', 'cancel'].includes(action)) return true;
        if (feature === 'employee' && ['view', 'update'].includes(action)) return true;
        if (feature === 'task' && ['view', 'complete'].includes(action)) return true;
        if (feature === 'document' && ['view', 'upload'].includes(action)) return true;
        if (feature === 'dashboard' && action === 'configure') return true;
      }
    }

    // Manager - self + team scope
    if (roles.includes(UserRole.MANAGER)) {
      if (scope === 'self' || scope === 'team') {
        if (feature === 'absence' && ['view', 'create', 'cancel', 'approve', 'reject'].includes(action)) return true;
        if (feature === 'employee' && ['view'].includes(action)) return true;
        if (feature === 'task' && ['view', 'complete', 'assign'].includes(action)) return true;
        if (feature === 'document' && ['view'].includes(action)) return true;
        if (feature === 'dashboard' && ['configure', 'create_search', 'share_search'].includes(action)) return true;
      }
    }

    // HR Manager - all scopes except system
    if (roles.includes(UserRole.HR_MANAGER)) {
      if (['self', 'team', 'org'].includes(scope)) {
        if (feature === 'absence') return true;
        if (feature === 'employee' && action !== 'terminate') return true;
        if (feature === 'task') return true;
        if (feature === 'document') return true;
        if (feature === 'dashboard') return true;
        if (feature === 'report') return true;
      }
    }

    // Admin - org scope
    if (roles.includes(UserRole.ADMIN)) {
      if (['self', 'team', 'org'].includes(scope)) {
        return true;
      }
    }

    // Super Admin handled earlier
    return false;
  }
}
