import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Plane,
  FileText,
  DollarSign,
  CreditCard,
  CreditCard as BatchPayment,
  PiggyBank,
  BarChart3,
  Settings,
  ChevronDown,
  User,
} from 'lucide-react';

export default function ExpensesAdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminViewOpen, setAdminViewOpen] = useState(true);

  const menuItems = [
    { path: '/expenses/admin', icon: Home, label: 'Home', exact: true },
    { path: '/expenses/admin/trips', icon: Plane, label: 'Trips' },
    { path: '/expenses/admin/reports', icon: FileText, label: 'Reports' },
    { path: '/expenses/admin/advances', icon: DollarSign, label: 'Advances' },
    { path: '/expenses/admin/batch-payments', icon: BatchPayment, label: 'Batch Payments' },
    { path: '/expenses/admin/corporate-cards', icon: CreditCard, label: 'Corporate Cards' },
    { path: '/expenses/admin/budgets', icon: PiggyBank, label: 'Budgets' },
    { path: '/expenses/admin/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/expenses/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Admin View Dropdown */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setAdminViewOpen(!adminViewOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <span>Admin View</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${adminViewOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {adminViewOpen && (
            <div className="mt-2 pl-3">
              <button
                onClick={() => navigate('/expenses')}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg text-left"
              >
                <User className="w-4 h-4" />
                <span>My View</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>LIVE ONBOARDING WEBINAR</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
