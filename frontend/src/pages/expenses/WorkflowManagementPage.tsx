import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Save,
  X,
  GripVertical,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface ApprovalRule {
  id: string;
  name: string;
  description?: string;
  type: 'AMOUNT_THRESHOLD' | 'CATEGORY' | 'DEPARTMENT' | 'EMPLOYEE_LEVEL' | 'PROJECT' | 'CUSTOM';
  action: 'AUTO_APPROVE' | 'REQUIRE_APPROVAL' | 'REQUIRE_MULTI_LEVEL' | 'ESCALATE' | 'REJECT';
  priority: number;
  isActive: boolean;
  conditions: any;
  approvalConfig: any;
}

const WorkflowManagementPage: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingRule, setEditingRule] = useState<ApprovalRule | null>(null);
  const queryClient = useQueryClient();

  // Fetch rules
  const { data: rules, isLoading } = useQuery<ApprovalRule[]>({
    queryKey: ['approval-rules'],
    queryFn: async () => {
      const response = await fetch('/api/v1/expenses/workflows/rules', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return response.json();
    },
  });

  // Fetch rule types
  const { data: ruleTypes } = useQuery({
    queryKey: ['rule-types'],
    queryFn: async () => {
      const response = await fetch('/api/v1/expenses/workflows/rule-types', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return response.json();
    },
  });

  // Toggle rule active status
  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const endpoint = isActive ? 'activate' : 'deactivate';
      const response = await fetch(`/api/v1/expenses/workflows/rules/${id}/${endpoint}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-rules'] });
    },
  });

  // Delete rule
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/v1/expenses/workflows/rules/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-rules'] });
    },
  });

  // Seed default rules
  const seedMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/v1/expenses/workflows/seed', {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-rules'] });
    },
  });

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      AMOUNT_THRESHOLD: 'bg-blue-100 text-blue-800',
      CATEGORY: 'bg-purple-100 text-purple-800',
      DEPARTMENT: 'bg-green-100 text-green-800',
      EMPLOYEE_LEVEL: 'bg-yellow-100 text-yellow-800',
      PROJECT: 'bg-pink-100 text-pink-800',
      CUSTOM: 'bg-gray-100 text-gray-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getActionColor = (action: string) => {
    const colors: { [key: string]: string } = {
      AUTO_APPROVE: 'bg-green-100 text-green-800',
      REQUIRE_APPROVAL: 'bg-blue-100 text-blue-800',
      REQUIRE_MULTI_LEVEL: 'bg-purple-100 text-purple-800',
      ESCALATE: 'bg-orange-100 text-orange-800',
      REJECT: 'bg-red-100 text-red-800',
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  const formatConditions = (rule: ApprovalRule): string => {
    const conditions = rule.conditions;
    const parts: string[] = [];

    if (conditions.minAmount !== undefined) {
      parts.push(`Min: £${conditions.minAmount}`);
    }
    if (conditions.maxAmount !== undefined) {
      parts.push(`Max: £${conditions.maxAmount}`);
    }
    if (conditions.categoryTypes?.length) {
      parts.push(`Categories: ${conditions.categoryTypes.join(', ')}`);
    }
    if (conditions.departmentIds?.length) {
      parts.push(`Departments: ${conditions.departmentIds.length}`);
    }

    return parts.join(' • ') || 'No conditions';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflow Management</h1>
          <p className="text-gray-600 mt-1">Configure approval rules and workflows</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Seed Default Rules
          </button>
          <button
            onClick={() => setIsCreating(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Rule</span>
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-blue-900">How Rules Work</h3>
            <p className="text-sm text-blue-800 mt-1">
              Rules are evaluated in priority order (lower number = higher priority). The first
              matching rule determines the approval workflow. Make sure your rules don't conflict!
            </p>
          </div>
        </div>
      </div>

      {/* Rule Type Legend */}
      {ruleTypes && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Rule Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(ruleTypes.typeDescriptions || {}).map(([type, description]) => (
              <div key={type} className="flex items-start space-x-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(type)}`}>
                  {type.replace('_', ' ')}
                </span>
                <p className="text-xs text-gray-600">{description as string}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="space-y-3">
        {rules?.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Rules Configured</h3>
            <p className="text-gray-600 mb-4">
              Get started by seeding default rules or creating your own custom rules.
            </p>
            <button
              onClick={() => seedMutation.mutate()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Seed Default Rules
            </button>
          </div>
        )}

        {rules?.map((rule) => (
          <div
            key={rule.id}
            className={`bg-white rounded-lg shadow overflow-hidden ${
              !rule.isActive ? 'opacity-60' : ''
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  {/* Drag Handle */}
                  <div className="mt-1">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                  </div>

                  {/* Rule Info */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        Priority: {rule.priority}
                      </span>
                      {rule.isActive ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <PowerOff className="w-5 h-5 text-gray-400" />
                      )}
                    </div>

                    {rule.description && (
                      <p className="text-sm text-gray-600 mb-3">{rule.description}</p>
                    )}

                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(rule.type)}`}>
                        {rule.type.replace(/_/g, ' ')}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(rule.action)}`}>
                        {rule.action.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600">
                      <strong>Conditions:</strong> {formatConditions(rule)}
                    </div>

                    {rule.approvalConfig?.approverRoles && (
                      <div className="text-sm text-gray-600 mt-1">
                        <strong>Approvers:</strong>{' '}
                        {rule.approvalConfig.approverRoles.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleMutation.mutate({ id: rule.id, isActive: !rule.isActive })}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title={rule.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {rule.isActive ? (
                      <Power className="w-5 h-5" />
                    ) : (
                      <PowerOff className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => setEditingRule(rule)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this rule?')) {
                        deleteMutation.mutate(rule.id);
                      }
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Statistics */}
      {rules && rules.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-2xl font-bold text-gray-900">{rules.length}</p>
              <p className="text-sm text-gray-600">Total Rules</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {rules.filter((r) => r.isActive).length}
              </p>
              <p className="text-sm text-gray-600">Active</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-400">
                {rules.filter((r) => !r.isActive).length}
              </p>
              <p className="text-sm text-gray-600">Inactive</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {rules.filter((r) => r.action === 'AUTO_APPROVE').length}
              </p>
              <p className="text-sm text-gray-600">Auto-Approve</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowManagementPage;
