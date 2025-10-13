import React from 'react';
import { CreditCard, Receipt, BarChart3, AlertCircle, FileText, Eye } from 'lucide-react';

export default function ExpensesAdminCorporateCards() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <CreditCard className="w-8 h-8 text-purple-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage corporate cards</h1>
          <p className="text-sm text-gray-600 mt-1">
            Connect and assign corporate cards to users. Automatically import card feed transactions to review and match against expense submission and provide instant insight on spend summary and transactions.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Rule Connect cards
        </button>
        <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
          Import Statement
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Spend Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">SPEND SUMMARY</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">To be reported</span>
              <span className="text-lg font-bold text-gray-900">10</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">To be examined</span>
              <span className="text-lg font-bold text-gray-900">10</span>
            </div>
          </div>
        </div>

        {/* Unsubmitted Transactions */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">UNSUBMITTED TRANSACTIONS</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active</span>
              <span className="text-sm text-blue-600 hover:underline cursor-pointer">All</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Inactive</span>
              <span className="text-sm text-blue-600 hover:underline cursor-pointer">All</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cards List */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Corporate Cards</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-sm text-blue-600 hover:underline">Active</button>
            <span className="text-gray-400">|</span>
            <button className="text-sm text-gray-600 hover:text-blue-600">Inactive</button>
          </div>
        </div>

        <div className="text-center py-12 text-gray-500">
          No corporate cards configured
        </div>
      </div>

      {/* Why Connect Cards */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Why connect cards?</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Real-time corporate card transaction updates</h4>
            <p className="text-sm text-gray-600">
              Let employees connect their corporate cards and track and manage transactions in real-time with instant record capture and updates within Zoho Expense's real-time feeds.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Receipt className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Automated reconciliation and expense creation</h4>
            <p className="text-sm text-gray-600">
              Card feed transactions will be automatically matched to existing expenses creation and invoice matching and feed date to help eliminate expense fraud.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Automate expense creation</h4>
            <p className="text-sm text-gray-600">
              Directly imported card feed transactions ensure expense submission through invoice matching and feed data to help eliminate expense fraud.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Reduced manual effort</h4>
            <p className="text-sm text-gray-600">
              Bulk corporate card import allows you to overcome tedious manual efforts and focus on business-critical activities.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-8 h-8 text-yellow-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Automated expense report creation</h4>
            <p className="text-sm text-gray-600">
              Set up expense report automation to ensure timely submission of all corporate card expenses.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Eye className="w-8 h-8 text-indigo-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">360-degree visibility into corporate card usage</h4>
            <p className="text-sm text-gray-600">
              Gain insight into company-wide corporate card usage, including pending reports for easy submissions and on-time data processing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
