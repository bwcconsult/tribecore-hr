import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, TrendingUp, Users, FileText, Award, HardHat, AlertCircle } from 'lucide-react';
import * as healthSafetyService from '../../services/healthSafety.service';
import { Link } from 'react-router-dom';

export default function ComplianceDashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await healthSafetyService.getComplianceDashboard('org-1');
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading compliance dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">UK Health & Safety Compliance Dashboard</h1>
        <p className="text-gray-600 mt-1">Complete HASAWA 1974 compliance monitoring</p>
      </div>

      {/* Overall Compliance Score */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-8 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 mb-2">Overall Compliance Score</p>
            <p className="text-5xl font-bold">{dashboard?.averageComplianceScore || 0}%</p>
            <p className="text-green-100 mt-2">Real-time UK health & safety compliance</p>
          </div>
          <Shield className="w-24 h-24 opacity-20" />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">H&S Policies</p>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{dashboard?.policies || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Required for 5+ employees</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Training Expiring</p>
            <Award className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{dashboard?.trainingExpiringCount || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Next 30 days</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">RIDDOR Reports</p>
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{dashboard?.riddorReports || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Reportable incidents</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Active Notices</p>
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{dashboard?.activeEnforcementNotices || 0}</p>
          <p className="text-xs text-gray-500 mt-1">HSE enforcement</p>
        </div>
      </div>

      {/* Additional Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">DSE Overdue Reviews</p>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{dashboard?.dseOverdueCount || 0}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Low Stock PPE</p>
            <HardHat className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{dashboard?.lowStockPPECount || 0}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Recent Inspections</p>
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{dashboard?.recentInspections?.length || 0}</p>
        </div>
      </div>

      {/* UK Legislation Coverage */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">UK Health & Safety Legislation Coverage</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { law: 'Health and Safety at Work etc. Act 1974', status: 'Covered', module: 'Core Framework' },
            { law: 'Management of H&S at Work Regulations 1999', status: 'Covered', module: 'Risk Assessments' },
            { law: 'RIDDOR 2013', status: 'Covered', module: 'Incident Reporting' },
            { law: 'COSHH Regulations 2002', status: 'Covered', module: 'Hazardous Substances' },
            { law: 'Display Screen Equipment Regulations 1992', status: 'Covered', module: 'DSE Assessments' },
            { law: 'Manual Handling Operations Regulations 1992', status: 'Covered', module: 'Manual Handling' },
            { law: 'PPE at Work Regulations 1992', status: 'Covered', module: 'PPE Management' },
            { law: 'Fire Safety Order 2005', status: 'Covered', module: 'Fire Risk Assessments' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{item.law}</p>
                  <p className="text-xs text-gray-500">{item.module}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/health-safety/policies"
            className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <FileText className="w-8 h-8 text-blue-600 mb-2" />
            <p className="font-medium text-gray-900">Create H&S Policy</p>
            <p className="text-sm text-gray-600">Required for 5+ employees</p>
          </Link>

          <Link
            to="/health-safety/risk-assessments"
            className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Shield className="w-8 h-8 text-green-600 mb-2" />
            <p className="font-medium text-gray-900">Risk Assessment</p>
            <p className="text-sm text-gray-600">Identify & control hazards</p>
          </Link>

          <Link
            to="/health-safety/training"
            className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Award className="w-8 h-8 text-purple-600 mb-2" />
            <p className="font-medium text-gray-900">Record Training</p>
            <p className="text-sm text-gray-600">Track competency & certificates</p>
          </Link>

          <Link
            to="/health-safety/incidents"
            className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <AlertCircle className="w-8 h-8 text-red-600 mb-2" />
            <p className="font-medium text-gray-900">Report Incident</p>
            <p className="text-sm text-gray-600">RIDDOR reporting</p>
          </Link>

          <Link
            to="/health-safety/dse"
            className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Users className="w-8 h-8 text-cyan-600 mb-2" />
            <p className="font-medium text-gray-900">DSE Assessment</p>
            <p className="text-sm text-gray-600">Workstation evaluations</p>
          </Link>

          <Link
            to="/health-safety/ppe"
            className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <HardHat className="w-8 h-8 text-orange-600 mb-2" />
            <p className="font-medium text-gray-900">Manage PPE</p>
            <p className="text-sm text-gray-600">Stock & issue tracking</p>
          </Link>
        </div>
      </div>

      {/* Employer Responsibilities */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Key Employer Responsibilities (HASAWA 1974)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Risk Assessments</p>
              <p className="text-sm text-gray-600">Identify hazards and implement controls (5+ employees must record)</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">H&S Policy</p>
              <p className="text-sm text-gray-600">Written policy required for businesses with 5+ employees</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Award className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Training & Supervision</p>
              <p className="text-sm text-gray-600">Provide information, instruction, and training</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Incident Reporting</p>
              <p className="text-sm text-gray-600">Report RIDDOR incidents to HSE within specified timeframes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
