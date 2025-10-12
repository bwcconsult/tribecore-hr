import React from 'react';
import { FileText, Download, CheckCircle, AlertTriangle, Clock, Send } from 'lucide-react';

export const TaxComplianceDashboard: React.FC = () => {
  const filings = [
    {
      id: '1',
      country: 'UK',
      type: 'PAYE RTI',
      period: 'January 2025',
      dueDate: '2025-02-19',
      status: 'PENDING',
      amount: 324567,
    },
    {
      id: '2',
      country: 'USA',
      type: 'Form 941',
      period: 'Q4 2024',
      dueDate: '2025-01-31',
      status: 'FILED',
      amount: 125400,
    },
    {
      id: '3',
      country: 'Nigeria',
      type: 'PAYE',
      period: 'December 2024',
      dueDate: '2025-01-10',
      status: 'ACCEPTED',
      amount: 45800,
    },
    {
      id: '4',
      country: 'South Africa',
      type: 'PAYE/UIF',
      period: 'December 2024',
      dueDate: '2025-01-07',
      status: 'PENDING',
      amount: 32100,
    },
  ];

  const upcomingFilings = [
    { country: 'UK', type: 'P60', dueDate: '2025-05-31', employees: 120 },
    { country: 'USA', type: 'W-2', dueDate: '2025-01-31', employees: 85 },
    { country: 'UK', type: 'P11D', dueDate: '2025-07-06', employees: 45 },
  ];

  const stats = [
    {
      label: 'Pending Filings',
      value: '4',
      icon: Clock,
      color: 'yellow',
    },
    {
      label: 'Filed This Month',
      value: '12',
      icon: Send,
      color: 'blue',
    },
    {
      label: 'Accepted',
      value: '156',
      icon: CheckCircle,
      color: 'green',
    },
    {
      label: 'Requires Attention',
      value: '2',
      icon: AlertTriangle,
      color: 'red',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tax Compliance & Filings</h1>
        <p className="text-gray-600">Manage statutory tax filings across all countries</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Current Filings */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Current Period Filings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Filing Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filings.map((filing) => (
                <tr key={filing.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                        {filing.country.substring(0, 2)}
                      </div>
                      <span className="font-medium text-gray-900">{filing.country}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{filing.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{filing.period}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{filing.dueDate}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">
                      ${filing.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {filing.status === 'PENDING' && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded flex items-center gap-1 w-fit">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                    {filing.status === 'FILED' && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded flex items-center gap-1 w-fit">
                        <Send className="w-3 h-3" />
                        Filed
                      </span>
                    )}
                    {filing.status === 'ACCEPTED' && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded flex items-center gap-1 w-fit">
                        <CheckCircle className="w-3 h-3" />
                        Accepted
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded">
                        Generate
                      </button>
                      <button className="p-1 text-gray-600 hover:bg-gray-100 rounded">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upcoming Filings */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Filings</h3>
          <div className="space-y-3">
            {upcomingFilings.map((filing, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">{filing.type}</p>
                  <p className="text-sm text-gray-600">
                    {filing.country} • {filing.employees} employees
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{filing.dueDate}</p>
                  <p className="text-xs text-gray-500">Due Date</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">All On Track</p>
                  <p className="text-sm text-gray-600">No overdue filings</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">100%</span>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-3">Filing Statistics</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">This Year</span>
                  <span className="font-semibold text-gray-900">156 filed</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold text-green-600">98.7%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg. Processing Time</span>
                  <span className="font-semibold text-gray-900">2.4 days</span>
                </div>
              </div>
            </div>

            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              Generate Annual Report
            </button>
          </div>
        </div>
      </div>

      {/* Country-specific Alerts */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-yellow-900 mb-2">Compliance Updates</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• UK: New National Insurance rates effective April 2025</li>
              <li>• Nigeria: Updated PAYE thresholds for 2025 tax year</li>
              <li>• USA: IRS Form 941 deadline extended to February 10th</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
