import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Filter, Download, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../constants/currencies';

export const ContractorPayments: React.FC = () => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const stats = [
    { label: 'Total Contractors', value: '45', icon: DollarSign, color: 'blue' },
    { label: 'Pending Payments', value: '12', icon: Clock, color: 'yellow' },
    { label: 'Approved', value: '8', icon: CheckCircle, color: 'green' },
    { label: 'This Month', value: '$125,400', icon: DollarSign, color: 'purple' },
  ];

  const payments = [
    {
      id: '1',
      contractor: 'John Smith',
      contract: 'CON-2025-001',
      amount: 5000,
      currency: 'USD',
      rateType: 'PROJECT',
      status: 'PENDING',
      invoiceDate: '2025-01-15',
      dueDate: '2025-01-31',
    },
    {
      id: '2',
      contractor: 'Sarah Johnson',
      contract: 'CON-2025-002',
      amount: 3200,
      currency: 'GBP',
      rateType: 'HOURLY',
      status: 'APPROVED',
      invoiceDate: '2025-01-14',
      dueDate: '2025-01-28',
    },
    {
      id: '3',
      contractor: 'Mike Chen',
      contract: 'CON-2025-003',
      amount: 8500,
      currency: 'EUR',
      rateType: 'MONTHLY',
      status: 'PAID',
      invoiceDate: '2025-01-10',
      dueDate: '2025-01-25',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contractor Payments</h1>
          <p className="text-gray-600">Manage freelancer and contractor payments</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Payment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{stat.label}</span>
              <div className={`p-2 bg-${stat.color}-100 rounded-lg`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search contractors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </button>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left">
                <input type="checkbox" className="rounded" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Contractor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Contract
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Rate Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Invoice Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Due Date
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
            {payments.map((payment) => (
              <tr key={payment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input type="checkbox" className="rounded" />
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900">{payment.contractor}</p>
                    <p className="text-sm text-gray-500">ID: {payment.id}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{payment.contract}</td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(payment.amount, payment.currency)}
                  </p>
                  <p className="text-xs text-gray-500">{payment.currency}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                    {payment.rateType}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{payment.invoiceDate}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{payment.dueDate}</td>
                <td className="px-6 py-4">
                  {payment.status === 'PENDING' && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded flex items-center gap-1 w-fit">
                      <Clock className="w-3 h-3" />
                      Pending
                    </span>
                  )}
                  {payment.status === 'APPROVED' && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded flex items-center gap-1 w-fit">
                      <CheckCircle className="w-3 h-3" />
                      Approved
                    </span>
                  )}
                  {payment.status === 'PAID' && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded flex items-center gap-1 w-fit">
                      <DollarSign className="w-3 h-3" />
                      Paid
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                      <Download className="w-4 h-4" />
                    </button>
                    {payment.status === 'PENDING' && (
                      <>
                        <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Batch Actions */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">2 items selected</span>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
              Batch Approve
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              Batch Process Payment
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              Export Selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
