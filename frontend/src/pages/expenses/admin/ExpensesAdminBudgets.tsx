import React, { useState } from 'react';
import { PiggyBank, Plus, Calendar, TrendingUp } from 'lucide-react';

export default function ExpensesAdminBudgets() {
  const [activeTab, setActiveTab] = useState<'general' | 'user'>('general');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PiggyBank className="w-8 h-8 text-green-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enforce budgets</h1>
            <p className="text-sm text-gray-600 mt-1">
              Create budgets for individual expense categories, cost centres, departments and users. Notify users when a set limit is reached and make them remain aware.
            </p>
          </div>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Budget
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button className="text-sm text-blue-600 hover:underline">Learn More</button>
        <button className="text-sm text-blue-600 hover:underline">View User Budgets ›</button>
      </div>

      {/* Budget Card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Budget-1</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Jan 2025 - Dec 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Budget Period: Quarterly</span>
            </div>
          </div>
        </div>

        {/* Budget Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Jan 2025</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Feb 2025</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mar 2025</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Apr 2025</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900">Office Supplies</td>
                <td className="px-4 py-3 text-sm text-gray-600">5,000.00</td>
                <td className="px-4 py-3 text-sm text-gray-600">5,000.00</td>
                <td className="px-4 py-3 text-sm text-gray-600">10,000.00</td>
                <td className="px-4 py-3 text-sm text-gray-600">4,000</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900">Air Travel Expense</td>
                <td className="px-4 py-3 text-sm text-gray-600">0.00</td>
                <td className="px-4 py-3 text-sm text-gray-600">1.00</td>
                <td className="px-4 py-3 text-sm text-gray-600">1.00</td>
                <td className="px-4 py-3 text-sm text-gray-600">30000</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900">Telephone Expense</td>
                <td className="px-4 py-3 text-sm text-gray-600">25.00</td>
                <td className="px-4 py-3 text-sm text-gray-600">0.00</td>
                <td className="px-4 py-3 text-sm text-gray-600">25.00</td>
                <td className="px-4 py-3 text-sm text-gray-600">0.00</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-900">Automobile Expense</td>
                <td className="px-4 py-3 text-sm text-gray-600">90.00</td>
                <td className="px-4 py-3 text-sm text-gray-600">10,000.00</td>
                <td className="px-4 py-3 text-sm text-gray-600">100.00</td>
                <td className="px-4 py-3 text-sm text-gray-600">8,000</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Details Button */}
        <div className="mt-4">
          <button className="text-sm text-blue-600 hover:underline">Details</button>
        </div>
      </div>

      {/* User Budgets Tab */}
      <div className="bg-white border border-gray-200 rounded-lg">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-6 px-6">
            <button
              onClick={() => setActiveTab('general')}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'general'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              General Budgets
            </button>
            <button
              onClick={() => setActiveTab('user')}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'user'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              User Budgets
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {activeTab === 'user' ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">NAME</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">USER</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">FISCAL YEAR</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">BUDGET PERIOD</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    No data to display
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="p-6">
              <p className="text-gray-500 text-center">Select General Budgets to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
