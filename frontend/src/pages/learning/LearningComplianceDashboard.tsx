import { useState, useEffect } from 'react';
import { Shield, TrendingUp, AlertTriangle, CheckCircle2, Clock, Users, BookOpen } from 'lucide-react';
import * as learningService from '../../services/learningService';

export default function LearningComplianceDashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await learningService.getComplianceDashboard('org-1');
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load compliance dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  const getComplianceStatus = (rate: number) => {
    if (rate >= 95) return { label: 'Excellent', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' };
    if (rate >= 80) return { label: 'Good', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
    if (rate >= 60) return { label: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    return { label: 'Poor', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
  };

  const status = getComplianceStatus(dashboard?.complianceRate || 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Learning Compliance Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor mandatory training compliance across your organization</p>
      </div>

      {/* Overall Compliance Score */}
      <div className={`rounded-xl border-2 ${status.border} ${status.bg} p-8 mb-6`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Overall Compliance Rate</p>
            <div className="flex items-baseline gap-3">
              <h2 className={`text-5xl font-bold ${status.color}`}>
                {Math.round(dashboard?.complianceRate || 0)}%
              </h2>
              <span className={`text-lg font-semibold ${status.color}`}>{status.label}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {dashboard?.completed} of {dashboard?.totalMandatoryEnrollments} mandatory training completed
            </p>
          </div>
          <div className={`w-32 h-32 rounded-full border-8 ${status.border} flex items-center justify-center`}>
            <Shield className={`w-16 h-16 ${status.color}`} />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Completed</p>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{dashboard?.completed || 0}</p>
          <p className="text-sm text-green-600 mt-1">Training courses completed</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">In Progress</p>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{dashboard?.inProgress || 0}</p>
          <p className="text-sm text-blue-600 mt-1">Currently being completed</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Not Started</p>
            <BookOpen className="w-5 h-5 text-gray-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{dashboard?.notStarted || 0}</p>
          <p className="text-sm text-gray-600 mt-1">Yet to be started</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Expired</p>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{dashboard?.expired || 0}</p>
          <p className="text-sm text-red-600 mt-1">Require renewal</p>
        </div>
      </div>

      {/* Compliance by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">UK Statutory Training Compliance</h3>
          <div className="space-y-4">
            {[
              { name: 'Health & Safety Awareness', completion: 95, total: 120, completed: 114 },
              { name: 'Fire Safety', completion: 92, total: 120, completed: 110 },
              { name: 'Data Protection (GDPR)', completion: 88, total: 120, completed: 106 },
              { name: 'Equality & Diversity', completion: 85, total: 120, completed: 102 },
              { name: 'Sexual Harassment Prevention', completion: 78, total: 120, completed: 94 },
            ].map((course) => (
              <div key={course.name}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-700">{course.name}</p>
                  <span className="text-sm text-gray-600">{course.completed}/{course.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      course.completion >= 95 ? 'bg-green-600' :
                      course.completion >= 80 ? 'bg-blue-600' :
                      course.completion >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${course.completion}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Compliance Overview</h3>
          <div className="space-y-4">
            {[
              { dept: 'Human Resources', rate: 98, employees: 15 },
              { dept: 'IT & Technology', rate: 94, employees: 42 },
              { dept: 'Operations', rate: 87, employees: 68 },
              { dept: 'Sales & Marketing', rate: 82, employees: 35 },
              { dept: 'Finance', rate: 75, employees: 22 },
            ].map((dept) => (
              <div key={dept.dept}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{dept.dept}</p>
                    <p className="text-xs text-gray-500">{dept.employees} employees</p>
                  </div>
                  <span className={`text-sm font-semibold ${
                    dept.rate >= 95 ? 'text-green-600' :
                    dept.rate >= 80 ? 'text-blue-600' :
                    dept.rate >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {dept.rate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      dept.rate >= 95 ? 'bg-green-600' :
                      dept.rate >= 80 ? 'bg-blue-600' :
                      dept.rate >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${dept.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Expirations */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Training Expirations (Next 30 Days)</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 text-sm font-medium text-gray-700">Employee</th>
                <th className="text-left p-3 text-sm font-medium text-gray-700">Training Course</th>
                <th className="text-left p-3 text-sm font-medium text-gray-700">Department</th>
                <th className="text-left p-3 text-sm font-medium text-gray-700">Expires On</th>
                <th className="text-left p-3 text-sm font-medium text-gray-700">Days Left</th>
                <th className="text-left p-3 text-sm font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Sarah Johnson', course: 'First Aid at Work', dept: 'Operations', expires: '2025-11-15', days: 32 },
                { name: 'Michael Chen', course: 'Fire Safety', dept: 'IT', expires: '2025-11-20', days: 37 },
                { name: 'Emma Wilson', course: 'Manual Handling', dept: 'Warehouse', expires: '2025-11-25', days: 42 },
              ].map((item, idx) => (
                <tr key={idx} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="p-3 text-sm text-gray-900">{item.name}</td>
                  <td className="p-3 text-sm text-gray-900">{item.course}</td>
                  <td className="p-3 text-sm text-gray-600">{item.dept}</td>
                  <td className="p-3 text-sm text-gray-600">{item.expires}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.days <= 7 ? 'bg-red-100 text-red-700' :
                      item.days <= 14 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {item.days} days
                    </span>
                  </td>
                  <td className="p-3">
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Notify
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
