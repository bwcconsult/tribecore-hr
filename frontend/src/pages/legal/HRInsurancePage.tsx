import { useState } from 'react';
import { Shield, AlertCircle, CheckCircle, TrendingUp, Plus } from 'lucide-react';

export default function HRInsurancePage() {
  const claims = [
    { id: '1', claimNumber: 'CLM-2025001', type: 'UNFAIR_DISMISSAL', status: 'UNDER_REVIEW', amount: 15000, employee: 'John Doe' },
    { id: '2', claimNumber: 'CLM-2025002', type: 'DISCRIMINATION', status: 'SETTLED', amount: 25000, employee: 'Jane Smith', settlementAmount: 18000 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">HR Insurance</h1>
            <p className="text-gray-600 mt-1">Protection against employment claims up to £1 million</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            <Plus className="w-4 h-4" />
            Report Claim
          </button>
        </div>
      </div>

      {/* Coverage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          { label: 'Coverage Limit', value: '£1M', icon: Shield, color: 'purple' },
          { label: 'Active Claims', value: '2', icon: AlertCircle, color: 'orange' },
          { label: 'Settled Claims', value: '5', icon: CheckCircle, color: 'green' },
          { label: 'Total Saved', value: '£42K', icon: TrendingUp, color: 'blue' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <div className={`w-10 h-10 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Coverage Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">What's Covered</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Unfair dismissal claims',
              'Discrimination cases',
              'Wrongful termination',
              'Harassment claims',
              'Breach of contract',
              'Employment tribunal costs',
              'Legal representation',
              'Settlement negotiations',
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <Shield className="w-12 h-12 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Premium Protection</h3>
          <p className="text-purple-100 mb-6">Coverage up to £1 million per claim with no excess</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
              24/7 legal support
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
              No claim limit
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
              Fast claim processing
            </li>
          </ul>
        </div>
      </div>

      {/* Claims List */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Claims History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-700">Claim Number</th>
                <th className="text-left p-4 font-medium text-gray-700">Type</th>
                <th className="text-left p-4 font-medium text-gray-700">Employee</th>
                <th className="text-left p-4 font-medium text-gray-700">Amount</th>
                <th className="text-left p-4 font-medium text-gray-700">Status</th>
                <th className="text-left p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium text-blue-600">{claim.claimNumber}</td>
                  <td className="p-4 text-gray-600">{claim.type.replace('_', ' ')}</td>
                  <td className="p-4 text-gray-600">{claim.employee}</td>
                  <td className="p-4 font-semibold text-gray-900">
                    £{claim.amount.toLocaleString()}
                    {claim.settlementAmount && (
                      <span className="text-sm text-green-600 block">
                        Settled: £{claim.settlementAmount.toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      claim.status === 'SETTLED' ? 'bg-green-100 text-green-700' :
                      claim.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {claim.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
