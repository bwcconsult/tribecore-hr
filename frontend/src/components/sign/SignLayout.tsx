import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  FileText,
  Grid,
  Link2,
  BarChart3,
  Settings,
  Plus,
} from 'lucide-react';

export default function SignLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/sign', icon: Home, label: 'Sign', exact: true },
    { path: '/sign/documents', icon: FileText, label: 'Documents' },
    { path: '/sign/templates', icon: Grid, label: 'Templates' },
    { path: '/sign/sign-forms', icon: Link2, label: 'SignForms' },
    { path: '/sign/reports', icon: BarChart3, label: 'Reports' },
    { path: '/sign/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const [showQuickActions, setShowQuickActions] = React.useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <span className="font-semibold">Sign</span>
          </div>
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
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  active
                    ? 'bg-gray-700 text-white border-l-4 border-blue-500'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Action Button */}
        <div className="p-4 border-t border-gray-700 relative">
          <button
            onClick={() => setShowQuickActions(!showQuickActions)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Quick Actions Dropdown */}
          {showQuickActions && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
              <button
                onClick={() => {
                  navigate('/sign/send-for-signatures');
                  setShowQuickActions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                Send for signatures
              </button>
              <button
                onClick={() => {
                  navigate('/sign/sign-yourself');
                  setShowQuickActions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                Sign yourself
              </button>
              <button
                onClick={() => {
                  navigate('/sign/templates');
                  setShowQuickActions(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
              >
                Use template(s)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
