import { useState } from 'react';
import { Scale, MessageCircle, Phone, FileText, Shield, Clock } from 'lucide-react';

export default function EmploymentLawServicesPage() {
  const [showRequestForm, setShowRequestForm] = useState(false);

  const adviceRequests = [
    { id: '1', requestNumber: 'ADV-2025001', subject: 'Disciplinary procedure query', status: 'RESPONDED', priority: 'HIGH', createdAt: '2025-10-10' },
    { id: '2', requestNumber: 'ADV-2025002', subject: 'Contract termination advice', status: 'IN_PROGRESS', priority: 'URGENT', createdAt: '2025-10-12' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Employment Law Services</h1>
        <p className="text-gray-600 mt-1">Expert advice and document library</p>
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          { label: 'Advice Requests', value: '24', icon: MessageCircle, color: 'blue' },
          { label: 'Avg Response Time', value: '< 2hrs', icon: Clock, color: 'green' },
          { label: 'Templates Used', value: '156', icon: FileText, color: 'purple' },
          { label: 'Active Claims', value: '2', icon: Scale, color: 'orange' },
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
