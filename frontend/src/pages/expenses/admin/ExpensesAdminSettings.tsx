import React from 'react';
import { Settings, Building, Users, Wrench, Workflow, Database, Link2, Code } from 'lucide-react';

export default function ExpensesAdminSettings() {
  const settingsSections = [
    {
      title: 'Organisation',
      icon: Building,
      items: [
        { name: 'Organisation Profile', description: '' },
        { name: 'Branding', description: '' },
        { name: 'Currencies', description: '' },
        { name: 'VAT', description: '' },
        { name: 'Tags', description: '' },
        { name: 'Subscription', description: '', external: true },
      ],
    },
    {
      title: 'Users and Control',
      icon: Users,
      items: [
        { name: 'Users', description: '' },
        { name: 'Roles & Permissions', description: '' },
        { name: 'Departments', description: '' },
        { name: 'Policies', description: '' },
      ],
    },
    {
      title: 'Customisation',
      icon: Wrench,
      items: [
        { name: 'Modules', description: '' },
        { name: 'Web Tabs', description: '' },
        { name: 'PDF Templates', description: '' },
        { name: 'Email Templates', description: '' },
      ],
    },
    {
      title: 'Automation',
      icon: Workflow,
      items: [
        { name: 'Report Automation', description: '' },
        { name: 'Workflow Rules', description: '' },
        { name: 'Actions', description: '' },
        { name: 'Schedules', description: '' },
      ],
    },
    {
      title: 'Data Administration',
      icon: Database,
      items: [
        { name: 'Backups', description: '' },
        { name: 'Export Templates', description: '' },
      ],
    },
    {
      title: 'Integrations',
      icon: Link2,
      items: [
        { name: 'Zoho Apps', description: '' },
        { name: 'Accounting & ERP', description: '' },
        { name: 'HR & Projects', description: '' },
        { name: 'Travel', description: '' },
        { name: 'View All', description: '' },
      ],
    },
    {
      title: 'Developer Space',
      icon: Code,
      items: [
        { name: 'Signals', description: '' },
        { name: 'Incoming Webhooks', description: '' },
        { name: 'Connections', description: '' },
        { name: 'API Usage', description: '' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-600 mt-1">
          Configure and customize your expense management system
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search Settings"
          className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.title} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Icon className="w-6 h-6 text-blue-600" />
                <h2 className="text-base font-semibold text-gray-900">{section.title}</h2>
              </div>

              <div className="space-y-2">
                {section.items.map((item) => (
                  <button
                    key={item.name}
                    className="w-full text-left text-sm text-blue-600 hover:underline flex items-center justify-between"
                  >
                    <span>{item.name}</span>
                    {item.external && <span className="text-xs">↗</span>}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Help Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Need help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Drop us an email and we'll get back to you.
            </p>
            <button className="text-sm text-blue-600 hover:underline">
              Contact Support →
            </button>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">You can directly talk to us every Monday-Friday</h3>
            <p className="text-sm text-gray-600">
              08:00-06:00 IST
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
