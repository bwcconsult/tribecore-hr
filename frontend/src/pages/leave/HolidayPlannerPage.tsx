import { useNavigate } from 'react-router-dom';
import { Calendar, Sun, Plane, Users, TrendingUp, Settings, ArrowRight, CheckCircle, Shield, Clock } from 'lucide-react';

export default function HolidayPlannerPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">🎉 Holiday Planner</h1>
            <p className="text-gray-600 mt-2 text-lg">World-class leave management system - Choose your dashboard below</p>
          </div>
        </div>
      </div>

      {/* Feature Cards - Main Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Employee Dashboard */}
        <div
          onClick={() => navigate('/leave/my-holidays')}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-8 text-white cursor-pointer hover:shadow-2xl hover:scale-105 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-12 h-12" />
            <ArrowRight className="w-6 h-6 opacity-75" />
          </div>
          <h3 className="text-2xl font-bold mb-2">My Holidays</h3>
          <p className="text-blue-100 mb-4">View your leave balances, request time off, and track upcoming holidays</p>
          <div className="space-y-2 text-sm text-blue-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Live balance tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Request leave online</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>View request history</span>
            </div>
          </div>
        </div>

        {/* Manager Dashboard */}
        <div
          onClick={() => navigate('/leave/team-capacity')}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-8 text-white cursor-pointer hover:shadow-2xl hover:scale-105 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="w-12 h-12" />
            <ArrowRight className="w-6 h-6 opacity-75" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Team Capacity</h3>
          <p className="text-green-100 mb-4">Manage team leave, approve requests, and monitor staffing levels</p>
          <div className="space-y-2 text-sm text-green-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>4-week capacity heatmap</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Pending approvals</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Coverage analysis</span>
            </div>
          </div>
        </div>

        {/* HR Policy Studio */}
        <div
          onClick={() => navigate('/leave/policy-studio')}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-8 text-white cursor-pointer hover:shadow-2xl hover:scale-105 transition-all"
        >
          <div className="flex items-center justify-between mb-4">
            <Settings className="w-12 h-12" />
            <ArrowRight className="w-6 h-6 opacity-75" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Policy Studio</h3>
          <p className="text-purple-100 mb-4">Configure leave policies, types, and organizational rules (HR only)</p>
          <div className="space-y-2 text-sm text-purple-100">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>No-code configuration</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Country presets (UK/US/SA)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Working patterns setup</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">✨ World-Class Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Multi-Country Support</h3>
            <p className="text-sm text-gray-600">UK, US, South Africa, Nigeria, NHS presets</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Safe Staffing</h3>
            <p className="text-sm text-gray-600">Coverage validation for 24/7 operations</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">TOIL Management</h3>
            <p className="text-sm text-gray-600">Time off in lieu from overtime tracking</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Smart Approvals</h3>
            <p className="text-sm text-gray-600">Multi-level workflows with auto-approval</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">System Status</p>
              <p className="text-2xl font-bold text-gray-900">✅ Operational</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <p className="text-xs text-gray-500 mt-3">All services running smoothly</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Leave Types</p>
              <p className="text-2xl font-bold text-gray-900">7 Active</p>
            </div>
            <Calendar className="w-12 h-12 text-blue-500" />
          </div>
          <p className="text-xs text-gray-500 mt-3">AL, SICK, TOIL, MAT, PAT, STUDY</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Countries Supported</p>
              <p className="text-2xl font-bold text-gray-900">5 Presets</p>
            </div>
            <Plane className="w-12 h-12 text-purple-500" />
          </div>
          <p className="text-xs text-gray-500 mt-3">🇬🇧 🇺🇸 🇿🇦 🇳🇬 🏥</p>
        </div>
      </div>
    </div>
  );
}
