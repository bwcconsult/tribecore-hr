import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import * as employmentLawService from '../../services/employmentLaw.service';

export default function WorkingTimeCompliancePage() {
  const [complianceRecords, setComplianceRecords] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [records, viols] = await Promise.all([
        employmentLawService.getWorkingTimeCompliance('org-1'),
        employmentLawService.getWorkingTimeViolations('org-1'),
      ]);
      setComplianceRecords(records);
      setViolations(viols);
    } catch (error) {
      console.error('Failed to load working time data', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      COMPLIANT: 'bg-green-100 text-green-700',
      AT_RISK: 'bg-yellow-100 text-yellow-700',
      VIOLATION: 'bg-red-100 text-red-700',
      RESOLVED: 'bg-blue-100 text-blue-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Working Time Regulations 1998</h1>
        <p className="text-gray-600 mt-1">48-hour week limits, rest breaks & annual leave compliance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Records</p>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{complianceRecords.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Active Violations</p>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{violations.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Compliant</p>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {complianceRecords.filter(r => r.complianceStatus === 'COMPLIANT').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Compliance Rate</p>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {complianceRecords.length > 0 
              ? Math.round((complianceRecords.filter(r => r.complianceStatus === 'COMPLIANT').length / complianceRecords.length) * 100)
              : 0}%
          </p>
        </div>
      </div>

      {/* Key Regulations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Working Time Limits</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">48-Hour Maximum Week</p>
                <p className="text-sm text-gray-600">Average over 17 weeks, unless opted out</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">8-Hour Night Work Limit</p>
                <p className="text-sm text-gray-600">Average per 24 hours for night workers</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">5.6 Weeks Annual Leave</p>
                <p className="text-sm text-gray-600">Minimum paid holiday entitlement</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Rest Requirements</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">20-Minute Break</p>
                <p className="text-sm text-gray-600">For every 6 hours worked</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">11 Hours Daily Rest</p>
                <p className="text-sm text-gray-600">Between working days</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">24 Hours Weekly Rest</p>
                <p className="text-sm text-gray-600">Uninterrupted per week</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Violations */}
      {violations.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Active Violations Requiring Attention
          </h3>
          <div className="space-y-3">
            {violations.slice(0, 5).map((violation) => (
              <div key={violation.id} className="bg-white rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Employee: {violation.employeeId}</p>
                    <p className="text-sm text-gray-600">Week of {new Date(violation.weekStartDate).toLocaleDateString()}</p>
                    <p className="text-sm text-red-600 mt-1">Hours worked: {violation.totalHoursWorked}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(violation.complianceStatus)}`}>
                    {violation.complianceStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compliance Records */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Working Time Compliance Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-700">Employee</th>
                <th className="text-left p-4 font-medium text-gray-700">Week</th>
                <th className="text-left p-4 font-medium text-gray-700">Hours Worked</th>
                <th className="text-left p-4 font-medium text-gray-700">Avg Weekly</th>
                <th className="text-left p-4 font-medium text-gray-700">Opted Out</th>
                <th className="text-left p-4 font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {complianceRecords.slice(0, 20).map((record) => (
                <tr key={record.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{record.employeeId}</td>
                  <td className="p-4 text-gray-600">
                    {new Date(record.weekStartDate).toLocaleDateString()} - {new Date(record.weekEndDate).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-gray-600">{record.totalHoursWorked}h</td>
                  <td className="p-4 text-gray-600">{record.averageWeeklyHours}h</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${record.hasOptedOut ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                      {record.hasOptedOut ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(record.complianceStatus)}`}>
                      {record.complianceStatus}
                    </span>
                  </td>
                </tr>
              ))}
              {complianceRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No compliance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
