import React from 'react';
import { BarChart3, FileText, TrendingUp, Users, DollarSign, Receipt, Plane, CreditCard, AlertCircle, Building, Folder, Store, UserCheck, Clock } from 'lucide-react';

export default function ExpensesAdminAnalytics() {
  const reports = [
    {
      category: 'EXPENSES',
      description: 'Gain insight into your organisation\'s spending by analysing the business expenses on the basis of various parameters',
      items: [
        { name: 'Expense Details', icon: Receipt },
        { name: 'Unsubmitted Expenses', icon: FileText },
        { name: 'Expenses by Category', icon: BarChart3 },
        { name: 'Expenses by User', icon: Users },
        { name: 'Expense Policy Violations by User', icon: AlertCircle },
        { name: 'Expenses by Department', icon: Building },
        { name: 'Expenses by Attendee', icon: Users },
        { name: 'Expenses by Project', icon: Folder },
        { name: 'Expenses by Merchant', icon: Store },
        { name: 'Expenses by Customer', icon: UserCheck },
        { name: 'Expenses by Currency', icon: DollarSign },
      ],
    },
    {
      category: 'REPORTS',
      description: 'View statistics of the expense reports in your organisation and review the policy violations',
      items: [
        { name: 'Expense Reports Details', icon: FileText },
        { name: 'Policy Violations', icon: AlertCircle },
        { name: 'Report Approval Time', icon: Clock },
      ],
    },
    {
      category: 'REIMBURSEMENTS',
      description: 'Analyze the reimbursements processed by your organisation and the advances paid to your employees',
      items: [
        { name: 'Reimbursement details', icon: DollarSign },
        { name: 'Reimbursements by User', icon: Users },
        { name: 'Awaiting Reimbursements by User', icon: Clock },
        { name: 'Advances by User', icon: TrendingUp },
      ],
    },
    {
      category: 'TRIPS',
      description: 'View a summary of the trips undertaken by your employees and analyse the time taken for approval and booking',
      items: [
        { name: 'Trip Details', icon: Plane },
        { name: 'Trip Stage Summary', icon: BarChart3 },
        { name: 'Trip Expense Summary', icon: Receipt },
        { name: 'Trip Summary by Report Status', icon: FileText },
      ],
    },
    {
      category: 'BUDGETS',
      description: 'Make informed financial decisions by comparing your budget with the actual spending of your business using insightful reports',
      items: [
        { name: 'Budget Vs Actuals', icon: TrendingUp },
      ],
    },
    {
      category: 'CORPORATE CARDS',
      description: 'Gain insights on the status of your organisation\'s corporate card expenses',
      items: [
        { name: 'Corporate Card Reconciliation', icon: CreditCard },
      ],
    },
    {
      category: 'ACTIVITY',
      description: 'View all the activities in your organisation',
      items: [
        { name: 'Activity Logs', icon: FileText },
        { name: 'Active Users', icon: Users },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-600 mt-1">
          Gain insights and make data-driven decisions with comprehensive expense analytics
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search reports"
          className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Reports Grid */}
      <div className="space-y-8">
        {reports.map((section) => (
          <div key={section.category} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">{section.category}</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">{section.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                  >
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="text-sm text-gray-900">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
