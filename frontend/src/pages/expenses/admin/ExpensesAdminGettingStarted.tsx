import React from 'react';
import { Rocket, Settings, Users, FileText, CreditCard, Link2, Workflow, Grid, Layout, Mail, Phone } from 'lucide-react';

export default function ExpensesAdminGettingStarted() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
            <Rocket className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Bill Essien! You are in Admin View.</h1>
        <p className="text-gray-600">
          Learn to manage organisational functions listed pro-active.
        </p>
      </div>

      {/* Setup Assistance Banner */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">2 hours of FREE Rapid Setup Assistance!</h2>
              <p className="text-sm text-gray-600 mt-1">
                Our product consultants will help you configure Zoho Expense based on your requirements.
              </p>
            </div>
          </div>
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap">
            Contact Support
          </button>
        </div>
      </div>

      {/* Let's Get Started */}
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Let's get started!</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Expense Categories */}
          <div className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Expense Categories</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add and manage categories to classify expenses and track business spend.
            </p>
            <button className="text-sm text-blue-600 hover:underline">Manage</button>
          </div>

          {/* Preferences */}
          <div className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Settings className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Preferences</h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose preferences and configure settings for each module based on organisational needs.
            </p>
            <button className="text-sm text-blue-600 hover:underline">Configure</button>
          </div>

          {/* Policies */}
          <div className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Policies</h3>
            <p className="text-sm text-gray-600 mb-4">
              Create policies to define spending limits, mileage reimbursement, and per diem allowances.
            </p>
            <button className="text-sm text-blue-600 hover:underline">Setup</button>
          </div>

          {/* Corporate Cards */}
          <div className="p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Corporate Cards</h3>
            <p className="text-sm text-gray-600 mb-4">
              Connect and assign corporate cards to users and set an automatic import card.
            </p>
            <button className="text-sm text-blue-600 hover:underline">Configure</button>
          </div>
        </div>
      </div>

      {/* Do More Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span>✨</span> Do more
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Budgets */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Budgets</h3>
              <p className="text-sm text-gray-600 mb-2">
                Create and enforce budgets
              </p>
              <button className="text-sm text-blue-600 hover:underline">→</button>
            </div>
          </div>

          {/* Links And Buttons */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded flex items-center justify-center flex-shrink-0">
              <Link2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Links And Buttons</h3>
              <p className="text-sm text-gray-600 mb-2">
                Create buttons and embed links
              </p>
              <button className="text-sm text-blue-600 hover:underline">→</button>
            </div>
          </div>

          {/* Report Automation */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
              <Workflow className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Report Automation</h3>
              <p className="text-sm text-gray-600 mb-2">
                Automate expense reporting
              </p>
              <button className="text-sm text-blue-600 hover:underline">→</button>
            </div>
          </div>

          {/* Workflow */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-yellow-100 rounded flex items-center justify-center flex-shrink-0">
              <Settings className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Workflow</h3>
              <p className="text-sm text-gray-600 mb-2">
                Automate process workflows
              </p>
              <button className="text-sm text-blue-600 hover:underline">→</button>
            </div>
          </div>

          {/* Modules */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
              <Grid className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Modules</h3>
              <p className="text-sm text-gray-600 mb-2">
                Create new 'invoice'
              </p>
              <button className="text-sm text-blue-600 hover:underline">→</button>
            </div>
          </div>

          {/* Page Layouts */}
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-indigo-100 rounded flex items-center justify-center flex-shrink-0">
              <Layout className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Page Layouts</h3>
              <p className="text-sm text-gray-600 mb-2">
                Customise layout of form
              </p>
              <button className="text-sm text-blue-600 hover:underline">→</button>
            </div>
          </div>
        </div>
      </div>

      {/* Access Anywhere Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Access anywhere, anytime</h2>

        <div className="flex items-center justify-center gap-8 mb-8">
          <div className="text-center">
            <div className="bg-gray-100 rounded-lg p-6 mb-4">
              <img src="/placeholder-mobile.png" alt="Mobile" className="w-32 h-48 mx-auto object-contain" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <img src="/qr-code.png" alt="QR Code" className="w-20 h-20" />
              </div>
              <div className="flex gap-2 justify-center">
                <button className="px-4 py-2 bg-black text-white rounded text-xs">
                  Download on the App Store
                </button>
                <button className="px-4 py-2 bg-black text-white rounded text-xs">
                  Get it on Google Play
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button className="text-sm text-blue-600 hover:underline">
            Upload mobile receipts via Chrome extension →
          </button>
        </div>
      </div>

      {/* Help Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Need help?</h3>
            <p className="text-sm text-gray-600 mb-2">
              Drop us an email and we'll get back to you.
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-start gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Phone className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">You can directly talk to us every Monday-Friday</h3>
            <p className="text-sm text-gray-600">
              08:00-06:00 IST<br />
              +44(0)808-0018
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
