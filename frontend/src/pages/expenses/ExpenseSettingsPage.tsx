import { useState } from 'react';
import { User, Users, Calendar, Settings, Plus, Trash2, Edit } from 'lucide-react';

export default function ExpenseSettingsPage() {
  const [activeTab, setActiveTab] = useState('basic');

  // Mock data
  const delegates = [
    {
      id: '1',
      delegateName: 'Sarah Johnson',
      permissions: ['CREATE', 'SUBMIT'],
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      isActive: true,
    },
  ];

  const outOfOffice = [
    {
      id: '1',
      substituteName: 'John Smith',
      startDate: '2025-02-10',
      endDate: '2025-02-20',
      autoApprove: true,
      isActive: true,
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Expense Settings</h1>
        <p className="text-gray-600 mt-1">Manage preferences, delegates, and out-of-office</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'basic', label: 'Basic Information', icon: User },
              { id: 'delegates', label: 'My Delegates', icon: Users },
              { id: 'ooo', label: 'Out of Office', icon: Calendar },
              { id: 'prefs', label: 'Preferences', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input type="text" value="Bill Bill Essien" disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role Name</label>
                  <input type="text" value="Admin" disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input type="email" value="bill.essien@bwcconsult.com" disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50" />
              </div>
            </div>
          )}

          {activeTab === 'delegates' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">My Delegates</h3>
                  <p className="text-sm text-gray-600">Authorize others to create and submit expenses on your behalf</p>
                </div>
                <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Delegate
                </button>
              </div>
              {delegates.map((delegate) => (
                <div key={delegate.id} className="border border-gray-200 rounded-lg p-4 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{delegate.delegateName}</h4>
                      <p className="text-sm text-gray-600">Permissions: {delegate.permissions.join(', ')}</p>
                      <p className="text-sm text-gray-500">{delegate.startDate} - {delegate.endDate}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-600 hover:text-indigo-600"><Edit className="w-4 h-4" /></button>
                      <button className="p-2 text-gray-600 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'ooo' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Out of Office Approver</h3>
                  <p className="text-sm text-gray-600">Assign substitute to approve reports when you're absent</p>
                </div>
                <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Out of Office
                </button>
              </div>
              {outOfOffice.map((ooo) => (
                <div key={ooo.id} className="border border-gray-200 rounded-lg p-4 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{ooo.substituteName}</h4>
                      <p className="text-sm text-gray-600">Auto-approve: {ooo.autoApprove ? 'Yes' : 'No'}</p>
                      <p className="text-sm text-gray-500">{ooo.startDate} - {ooo.endDate}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-600 hover:text-indigo-600"><Edit className="w-4 h-4" /></button>
                      <button className="p-2 text-gray-600 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'prefs' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Travel Details</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default Currency</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option>GBP</option>
                  <option>USD</option>
                  <option>EUR</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
