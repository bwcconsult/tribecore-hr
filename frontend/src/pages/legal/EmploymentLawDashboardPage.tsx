import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, TrendingUp, FileText, Users, Clock, DollarSign, UserCheck } from 'lucide-react';
import * as employmentLawService from '../../services/employmentLaw.service';
import { Link } from 'react-router-dom';

export default function EmploymentLawDashboardPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await employmentLawService.getEmploymentLawDashboard('org-1');
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceLabel = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Attention';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">UK Employment Law Compliance Dashboard</h1>
        <p className="text-gray-600 mt-1">Comprehensive compliance monitoring across all regulations</p>
      </div>

      {/* Overall Compliance Score */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-8 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 mb-2">Overall Compliance Score</p>
            <p className="text-5xl font-bold">{dashboard?.overallComplianceScore || 0}%</p>
            <p className="text-blue-100 mt-2">{getComplianceLabel(dashboard?.overallComplianceScore || 0)}</p>
          </div>
          <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Shield className="w-16 h-16" />
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Link to="/legal/equality-compliance" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Equality Cases</p>
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{dashboard?.equalityCases || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Equality Act 2010</p>
        </Link>

        <Link to="/legal/working-time" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Time Violations</p>
            <Clock className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{dashboard?.workingTimeViolations || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Working Time Regs 1998</p>
        </Link>

        <Link to="/legal/redundancy" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Redundancy Processes</p>
            <Users className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{dashboard?.redundancyProcesses || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Fair redundancy</p>
        </Link>

        <Link to="/legal/minimum-wage" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Wage Issues</p>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{dashboard?.minimumWageViolations || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Min Wage Act 1998</p>
        </Link>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Whistleblowing</p>
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{dashboard?.whistleblowingCases || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Protected disclosures</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">GDPR Requests</p>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{dashboard?.gdprRequests || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Data Protection 2018</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Agency Workers</p>
            <UserCheck className="w-5 h-5 text-cyan-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{dashboard?.agencyWorkerComplianceIssues || 0}</p>
          <p className="text-sm text-gray-500 mt-1">Compliance issues</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Compliance Trend</p>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">+5%</p>
          <p className="text-sm text-gray-500 mt-1">vs last month</p>
        </div>
      </div>

      {/* Key Legislation Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">UK Employment Law Coverage</h3>
          <div className="space-y-4">
            {[
              { law: 'Equality Act 2010', status: 'Covered', color: 'green' },
              { law: 'Employment Rights Act 1996', status: 'Covered', color: 'green' },
              { law: 'Working Time Regulations 1998', status: 'Covered', color: 'green' },
              { law: 'National Minimum Wage Act 1998', status: 'Covered', color: 'green' },
              { law: 'Health & Safety at Work Act 1974', status: 'Covered', color: 'green' },
              { law: 'Data Protection Act 2018', status: 'Covered', color: 'green' },
              { law: 'Agency Workers Regulations 2010', status: 'Covered', color: 'green' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-gray-900">{item.law}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm bg-${item.color}-100 text-${item.color}-700`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/legal/equality-compliance"
              className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Report Discrimination Case</p>
                  <p className="text-sm text-gray-600">Equality Act 2010 compliance</p>
                </div>
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
            </Link>

            <Link
              to="/legal/redundancy"
              className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Start Redundancy Process</p>
                  <p className="text-sm text-gray-600">Fair consultation & selection</p>
                </div>
                <Users className="w-5 h-5 text-orange-600" />
              </div>
            </Link>

            <Link
              to="/legal/contracts"
              className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Generate Employment Contract</p>
                  <p className="text-sm text-gray-600">UK-compliant templates</p>
                </div>
                <FileText className="w-5 h-5 text-green-600" />
              </div>
            </Link>

            <Link
              to="/legal/whistleblowing"
              className="block p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Report Whistleblowing Case</p>
                  <p className="text-sm text-gray-600">Protected disclosure</p>
                </div>
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Protected Characteristics Reference */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Protected Characteristics (Equality Act 2010)</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            'Age', 'Disability', 'Gender Reassignment', 'Marriage & Civil Partnership',
            'Pregnancy & Maternity', 'Race', 'Religion or Belief', 'Sex', 'Sexual Orientation'
          ].map((characteristic, idx) => (
            <div key={idx} className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
              <Shield className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <span className="text-sm font-medium text-purple-900">{characteristic}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CheckCircle({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
