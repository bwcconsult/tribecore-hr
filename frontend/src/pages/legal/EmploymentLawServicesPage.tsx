import { useState, useEffect } from 'react';
import { Scale, MessageCircle, Phone, FileText, Shield, Clock, Users, AlertTriangle, TrendingUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import * as employmentLawService from '../../services/employmentLaw.service';

export default function EmploymentLawServicesPage() {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [dashboard, setDashboard] = useState<any>(null);
  const [adviceRequests, setAdviceRequests] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
    loadAdviceRequests();
  }, []);

  const loadDashboardData = async () => {
    try {
      const data = await employmentLawService.getEmploymentLawDashboard('org-1');
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load dashboard', error);
    }
  };

  const loadAdviceRequests = async () => {
    try {
      const data = await employmentLawService.getAllAdviceRequests('org-1');
      setAdviceRequests(data.slice(0, 5));
    } catch (error) {
      console.error('Failed to load advice requests', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">UK Employment Law Compliance</h1>
        <p className="text-gray-600 mt-1">Comprehensive compliance platform for all UK employment regulations</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <button 
          onClick={() => setShowRequestForm(true)}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white hover:shadow-lg transition-shadow text-left"
        >
          <MessageCircle className="w-12 h-12 mb-3" />
          <h3 className="text-xl font-semibold mb-2">24/7 Employment Law Advice</h3>
          <p className="text-blue-100 text-sm">Get expert legal advice anytime</p>
        </button>

        <button className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white hover:shadow-lg transition-shadow text-left">
          <FileText className="w-12 h-12 mb-3" />
          <h3 className="text-xl font-semibold mb-2">Document Library</h3>
          <p className="text-green-100 text-sm">Access 500+ HR templates</p>
        </button>

        <button className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white hover:shadow-lg transition-shadow text-left">
          <Shield className="w-12 h-12 mb-3" />
          <h3 className="text-xl font-semibold mb-2">HR Insurance</h3>
          <p className="text-purple-100 text-sm">Protect against claims</p>
        </button>
      </div>

      {/* Compliance Overview */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-8 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-100 mb-2">Overall Compliance Score</p>
            <p className="text-5xl font-bold">{dashboard?.overallComplianceScore || 0}%</p>
            <p className="text-purple-100 mt-2">Real-time UK employment law compliance</p>
          </div>
          <Shield className="w-24 h-24 opacity-20" />
        </div>
      </div>

      {/* UK Employment Law Modules */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">UK Employment Law Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/legal/employment-law-dashboard" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <Shield className="w-10 h-10 text-blue-600" />
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Compliance Dashboard</h3>
            <p className="text-sm text-gray-600 mb-3">Comprehensive overview of all employment law compliance</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">{dashboard?.overallComplianceScore || 0}%</span>
              <span className="text-sm text-gray-500">Score</span>
            </div>
          </Link>

          <Link to="/legal/equality-compliance" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <Users className="w-10 h-10 text-purple-600" />
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Equality Act 2010</h3>
            <p className="text-sm text-gray-600 mb-3">Anti-discrimination & protected characteristics</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">{dashboard?.equalityCases || 0}</span>
              <span className="text-sm text-gray-500">Cases</span>
            </div>
          </Link>

          <Link to="/legal/working-time" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <Clock className="w-10 h-10 text-orange-600" />
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Working Time Regulations</h3>
            <p className="text-sm text-gray-600 mb-3">48-hour week, rest breaks & annual leave</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">{dashboard?.workingTimeViolations || 0}</span>
              <span className="text-sm text-gray-500">Violations</span>
            </div>
          </Link>

          <Link to="/legal/redundancy" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <Users className="w-10 h-10 text-red-600" />
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Redundancy Process</h3>
            <p className="text-sm text-gray-600 mb-3">Fair consultation, selection & payment</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">{dashboard?.redundancyProcesses || 0}</span>
              <span className="text-sm text-gray-500">Active</span>
            </div>
          </Link>

          <Link to="/legal/minimum-wage" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-10 h-10 text-green-600" />
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Minimum Wage Compliance</h3>
            <p className="text-sm text-gray-600 mb-3">National Living Wage & age bands</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">{dashboard?.minimumWageViolations || 0}</span>
              <span className="text-sm text-gray-500">Issues</span>
            </div>
          </Link>

          <Link to="/legal/whistleblowing" className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <AlertTriangle className="w-10 h-10 text-yellow-600" />
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Whistleblowing</h3>
            <p className="text-sm text-gray-600 mb-3">Protected disclosures & public interest</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">{dashboard?.whistleblowingCases || 0}</span>
              <span className="text-sm text-gray-500">Cases</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          { label: 'Advice Requests', value: adviceRequests.length.toString(), icon: MessageCircle, color: 'blue' },
          { label: 'Avg Response Time', value: '< 2hrs', icon: Clock, color: 'green' },
          { label: 'Templates Available', value: '500+', icon: FileText, color: 'purple' },
          { label: 'GDPR Requests', value: dashboard?.gdprRequests || '0', icon: Scale, color: 'orange' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Advice Requests</h3>
        <div className="space-y-3">
          {adviceRequests.map((request) => (
            <div key={request.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-medium text-gray-900">{request.subject}</span>
                  <span className="text-xs text-gray-500">{request.requestNumber}</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    request.priority === 'URGENT' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {request.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{new Date(request.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                request.status === 'RESPONDED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {request.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Features List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">What's Included</h3>
          <ul className="space-y-3">
            {[
              '24/7 access to employment law experts',
              'Unlimited advice requests',
              '500+ HR document templates',
              'Template customization',
              'Compliance updates',
              'Tribunal support',
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-gray-700">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Need Urgent Help?</h3>
          <p className="text-gray-700 mb-4">Our employment law experts are available 24/7 to help with:</p>
          <ul className="space-y-2 mb-6">
            {['Dismissals & redundancies', 'Disciplinary procedures', 'Discrimination cases', 'Contract disputes'].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <Phone className="w-4 h-4 mt-0.5 text-blue-600" />
                {item}
              </li>
            ))}
          </ul>
          <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
            <Phone className="w-5 h-5" />
            Request Callback
          </button>
        </div>
      </div>
    </div>
  );
}
