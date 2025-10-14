import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PolicyEvaluationService, PolicyContext } from '../services/policy-evaluation.service';
import { SetMetadata } from '@nestjs/common';

export const POLICY_KEY = 'policy';

export interface PolicyRequirement {
  action: string;
  resource: string;
  requireMFA?: boolean;
}

/**
 * Decorator to define policy requirements for routes
 * Usage: @RequirePolicy({ action: 'update', resource: 'employee' })
 */
export const RequirePolicy = (policy: PolicyRequirement) => SetMetadata(POLICY_KEY, policy);

/**
 * Policy Guard
 * Intercepts all API calls and evaluates RBAC+ABAC policies
 * Automatically protects routes with @RequirePolicy decorator
 */
@Injectable()
export class PolicyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private policyService: PolicyEvaluationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get policy requirement from route metadata
    const policyReq = this.reflector.getAllAndOverride<PolicyRequirement>(POLICY_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no policy requirement defined, allow access
    if (!policyReq) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Assumes user is attached by AuthGuard

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Build policy context
    const policyContext: PolicyContext = {
      userId: user.id,
      action: policyReq.action,
      resource: policyReq.resource,
      resourceId: request.params.id || request.body?.id,
      attributes: this.extractAttributes(request),
      ipAddress: request.ip || request.connection.remoteAddress,
      userAgent: request.headers['user-agent'],
      requestUrl: request.url,
    };

    // Evaluate policy
    const decision = await this.policyService.evaluatePolicy(policyContext);

    if (!decision.allowed) {
      throw new ForbiddenException(decision.reason || 'Access denied by policy');
    }

    // Check MFA requirement
    if (decision.requiresMFA && !user.mfaVerified) {
      throw new ForbiddenException('MFA verification required for this action');
    }

    // Attach policy decision to request for use in controllers
    request.policyDecision = decision;

    return true;
  }

  /**
   * Extract ABAC attributes from request
   */
  private extractAttributes(request: any): Record<string, any> {
    const attributes: Record<string, any> = {};

    // Extract from query params
    if (request.query.country) attributes.country = request.query.country;
    if (request.query.businessUnit) attributes.businessUnit = request.query.businessUnit;
    if (request.query.department) attributes.department = request.query.department;

    // Extract from body
    if (request.body?.country) attributes.country = request.body.country;
    if (request.body?.businessUnit) attributes.businessUnit = request.body.businessUnit;
    if (request.body?.department) attributes.department = request.body.department;

    // Extract from user context
    if (request.user?.country) attributes.userCountry = request.user.country;
    if (request.user?.businessUnit) attributes.userBusinessUnit = request.user.businessUnit;
    if (request.user?.department) attributes.userDepartment = request.user.department;

    return attributes;
  }
}
