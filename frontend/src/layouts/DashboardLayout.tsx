import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  Calendar,
  Clock,
  TrendingUp,
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
  UserPlus,
  Heart,
  Timer,
  Receipt,
  Briefcase,
  GraduationCap,
  BarChart3,
  User,
  CalendarDays,
  CheckSquare,
  Plane,
  CalendarClock,
  Award,
  UserX,
  ClockIcon,
  Shield,
  Scale,
  Edit,
  Network,
  Target,
  Lightbulb,
  Building,
  ClipboardList,
  Bell,
  FolderOpen,
  ShieldCheck,
  Plug,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useNotifications } from '../hooks/useNotifications';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'My Profile', href: '/profile/me', icon: User },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Absence', href: '/absence', icon: Plane },
  { name: 'Calendar', href: '/calendar', icon: CalendarDays },
  { name: 'Employees', href: '/employees', icon: Users },
  { name: 'Recruitment', href: '/recruitment/dashboard', icon: Briefcase },
  { name: 'Onboarding', href: '/onboarding/dashboard', icon: UserPlus },
  { name: 'Offboarding', href: '/offboarding/dashboard', icon: UserX },
  { name: 'Time Tracking', href: '/time-tracking', icon: Timer },
  { name: 'Clock In/Out', href: '/attendance/clock-in', icon: ClockIcon },
  { name: 'Attendance', href: '/attendance', icon: Clock },
  { name: 'Shifts & Rotas', href: '/shifts', icon: CalendarClock },
  { name: 'Leave', href: '/leave', icon: Calendar },
  { name: 'Holiday Planner', href: '/leave/holiday-planner', icon: Plane },
  { name: 'My Holidays', href: '/leave/my-holidays', icon: Calendar },
  { name: 'Team Capacity', href: '/leave/team-capacity', icon: Users },
  { name: 'Policy Studio', href: '/leave/policy-studio', icon: Settings },
  { name: 'Overtime', href: '/overtime', icon: Clock },
  { name: 'Payroll', href: '/payroll', icon: DollarSign },
  { name: 'Benefits', href: '/benefits', icon: Heart },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Sign', href: '/sign', icon: Edit },
  { name: 'Performance', href: '/performance', icon: TrendingUp },
  { name: 'Recognition', href: '/recognition', icon: Award },
  { name: 'Learning', href: '/learning', icon: GraduationCap },
  { name: 'Health & Safety', href: '/health-safety', icon: Shield },
  { name: 'Employment Law', href: '/legal/employment-law', icon: Scale },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Reports', href: '/reports', icon: FileText },
  
  // Enterprise Modules
  { name: 'AI Governance', href: '/ai-governance', icon: Lightbulb },
  { name: 'Cases & HRSD', href: '/cases', icon: FileText },
  { name: 'ISO 30414', href: '/analytics/iso30414', icon: BarChart3 },
  { name: 'Positions', href: '/positions', icon: Network },
  { name: 'Skills', href: '/skills', icon: Award },
  { name: 'Compensation', href: '/compensation', icon: Target },
  { name: 'Contractors', href: '/contractors', icon: Briefcase },
  { name: 'Surveys', href: '/surveys', icon: ClipboardList },
  
  // Admin & Tools
  { name: 'IAM', href: '/iam', icon: Shield },
  { name: 'Contracts', href: '/contracts', icon: FileText },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Documents', href: '/documents', icon: FolderOpen },
  { name: 'Integrations', href: '/integrations', icon: Plug },
  { name: 'Org Chart', href: '/organization/chart', icon: Building },
  { name: 'Compliance', href: '/compliance/overview', icon: ShieldCheck },
  
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotifications();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white">
            <div className="flex h-16 items-center justify-between px-6 border-b">
              <h1 className="text-xl font-bold text-primary-700">TribeCore</h1>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex flex-col p-4 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col border-r bg-white">
        <div className="flex h-16 items-center px-6 border-b">
          <h1 className="text-xl font-bold text-primary-700">TribeCore</h1>
        </div>
        <nav className="flex flex-1 flex-col p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex flex-1 justify-end gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notification Bell */}
              <button
                onClick={() => navigate('/notifications')}
                className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
