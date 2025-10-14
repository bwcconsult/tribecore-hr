import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Brain,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  FileCheck,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { aiGovernanceService } from '../../services/aiGovernanceService';

export default function AIGovernanceDashboard() {
  const organizationId = '0aaea52a-7f95-41d4-a7a2-cb12877 2f2ba'; // Get from auth context

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['ai-governance-dashboard', organizationId],
    queryFn: () => aiGovernanceService.getDashboard(organizationId),
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Loading AI Governance dashboard...</p>
      </div>
    );
  }

  const summary = dashboard?.summary || {};
  const compliance = dashboard?.compliance || {};
  const alerts = dashboard?.alerts || {};
  const systems = dashboard?.systems || [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-600" />
            AI Governance & EU AI Act Compliance
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage AI systems in compliance with EU AI Act regulations
          </p>
        </div>
        <Link to="/ai-governance/register">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Register AI System
          </Button>
        </Link>
      </div>

      {/* Alert Banner */}
      {(alerts.systemsDueForReview > 0 || alerts.decisionsRequiringReview > 0) && (
        <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900">Action Required</h3>
              <ul className="mt-2 space-y-1 text-sm text-amber-800">
                {alerts.systemsDueForReview > 0 && (
                  <li>• {alerts.systemsDueForReview} AI system(s) due for review</li>
                )}
                {alerts.decisionsRequiringReview > 0 && (
                  <li>• {alerts.decisionsRequiringReview} AI decision(s) requiring human review</li>
                )}
              </ul>
              <div className="mt-3 flex gap-3">
                {alerts.systemsDueForReview > 0 && (
                  <Link to="/ai-governance/systems?filter=dueForReview">
                    <Button variant="outline" size="sm">
                      Review Systems
                    </Button>
                  </Link>
                )}
                {alerts.decisionsRequiringReview > 0 && (
                  <Link to="/ai-governance/decisions?filter=flagged">
                    <Button variant="outline" size="sm">
                      Review Decisions
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total AI Systems</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {summary.totalSystems || 0}
                </p>
              </div>
              <Brain className="h-12 w-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High-Risk Systems</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {summary.highRiskSystems || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Require oversight</p>
              </div>
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Certified Systems</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {summary.certifiedSystems || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {summary.certificationRate?.toFixed(1)}% certification rate
                </p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Reviews</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">
                  {alerts.systemsDueForReview + alerts.decisionsRequiringReview || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Actions needed</p>
              </div>
              <Clock className="h-12 w-12 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              Compliance Status
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Bias Test Coverage */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Bias Test Coverage
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {compliance.biasTestCoverage?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${compliance.biasTestCoverage || 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  All high-risk AI must undergo bias testing
                </p>
              </div>

              {/* DPIA Coverage */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    DPIA Coverage (High-Risk)
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {compliance.dpiaCoverage?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${compliance.dpiaCoverage || 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Data Protection Impact Assessments required for high-risk AI
                </p>
              </div>

              {/* Certification Rate */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Certification Rate
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {summary.certificationRate?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${summary.certificationRate || 0}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Systems approved for production use
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Quick Actions
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Link to="/ai-governance/systems">
                <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">View All AI Systems</span>
                    </div>
                    <span className="text-gray-400">→</span>
                  </div>
                </button>
              </Link>

              <Link to="/ai-governance/decisions">
                <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileCheck className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Review AI Decisions</span>
                    </div>
                    {alerts.decisionsRequiringReview > 0 && (
                      <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-1 rounded-full">
                        {alerts.decisionsRequiringReview}
                      </span>
                    )}
                  </div>
                </button>
              </Link>

              <Link to="/ai-governance/compliance-report">
                <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Generate Compliance Report</span>
                    </div>
                    <span className="text-gray-400">→</span>
                  </div>
                </button>
              </Link>

              <Link to="/ai-governance/register">
                <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Plus className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Register New AI System</span>
                    </div>
                    <span className="text-gray-400">→</span>
                  </div>
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Systems List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Registered AI Systems</h2>
            <Link to="/ai-governance/systems">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {systems.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium mb-2">No AI systems registered</p>
              <p className="text-gray-400 mb-6">Register your first AI system to start tracking compliance</p>
              <Link to="/ai-governance/register">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Register AI System
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm text-gray-500">
                    <th className="pb-3 font-medium">System Name</th>
                    <th className="pb-3 font-medium">Risk Level</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Certified</th>
                    <th className="pb-3 font-medium">Next Review</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {systems.map((system: any) => (
                    <tr key={system.id} className="text-sm">
                      <td className="py-3 font-medium">{system.name}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            system.riskLevel === 'HIGH'
                              ? 'bg-red-100 text-red-800'
                              : system.riskLevel === 'LIMITED'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {system.riskLevel === 'HIGH' && <AlertCircle className="h-3 w-3" />}
                          {system.riskLevel}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            system.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : system.status === 'UNDER_REVIEW'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {system.status}
                        </span>
                      </td>
                      <td className="py-3">
                        {system.certified ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-400" />
                        )}
                      </td>
                      <td className="py-3 text-gray-600">
                        {system.nextReviewDate
                          ? new Date(system.nextReviewDate).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="py-3">
                        <Link to={`/ai-governance/systems/${system.id}`}>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
