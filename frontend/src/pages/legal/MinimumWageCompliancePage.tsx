import { useState, useEffect } from 'react';
import { DollarSign, AlertCircle, TrendingUp, Users } from 'lucide-react';
import * as employmentLawService from '../../services/employmentLaw.service';

export default function MinimumWageCompliancePage() {
  const [complianceRecords, setComplianceRecords] = useState<any[]>([]);
  const [violations, setViolations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [records, viols] = await Promise.all([
        employmentLawService.getMinimumWageCompliance('org-1'),
        employmentLawService.getMinimumWageViolations('org-1'),
      ]);
      setComplianceRecords(records);
      setViolations(viols);
    } catch (error) {
      console.error('Failed to load minimum wage data', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentRates = () => {
    return [
      { category: 'National Living Wage (21+)', rate: '£11.44', color: 'green' },
      { category: 'Age 18-20', rate: '£8.60', color: 'blue' },
      { category: 'Age 16-17', rate: '£6.40', color: 'blue' },
      { category: 'Apprentice', rate: '£6.40', color: 'purple' },
    ];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">National Minimum Wage Compliance</h1>
        <p className="text-gray-600 mt-1">National Minimum Wage Act 1998 - Current rates 2025</p>
      </div>

      {/* Current Rates */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-8 mb-6 text-white">
        <h2 className="text-2xl font-bold mb-6">Current National Minimum Wage Rates 2025</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {getCurrentRates().map((rate, idx) => (
            <div key={idx} className="bg-white bg-opacity-20 rounded-lg p-4">
              <p className="text-green-100 text-sm mb-1">{rate.category}</p>
              <p className="text-3xl font-bold">{rate.rate}</p>
              <p className="text-green-100 text-xs mt-1">per hour</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Checks Performed</p>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{complianceRecords.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Underpayments</p>
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{violations.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Compliant</p>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {complianceRecords.filter(r => r.status === 'COMPLIANT').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Compliance Rate</p>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {complianceRecords.length > 0
              ? Math.round((complianceRecords.filter(r => r.status === 'COMPLIANT').length / complianceRecords.length) * 100)
              : 0}%
          </p>
        </div>
      </div>

      {/* Active Violations */}
      {violations.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Active Underpayment Issues
          </h3>
          <div className="space-y-3">
            {violations.slice(0, 5).map((violation) => (
              <div key={violation.id} className="bg-white rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Employee: {violation.employeeId}</p>
                    <p className="text-sm text-gray-600">
                      Period: {new Date(violation.payPeriodStart).toLocaleDateString()} - {new Date(violation.payPeriodEnd).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-red-600 mt-1 font-medium">
                      Underpayment: £{violation.underpaymentAmount?.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum wage: £{violation.applicableMinimumWage} | Actual: £{violation.actualHourlyRate?.toFixed(2)}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700">
                    {violation.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">What Counts Towards Minimum Wage</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Basic pay</p>
                <p className="text-sm text-gray-600">Regular salary or hourly wages</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Incentive bonuses</p>
                <p className="text-sm text-gray-600">Performance-based payments</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Shift premiums</p>
                <p className="text-sm text-gray-600">Additional pay for specific shifts</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Allowable Deductions</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Accommodation</p>
                <p className="text-sm text-gray-600">Limited to offset amount (£9.99/day in 2025)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Salary sacrifice</p>
                <p className="text-sm text-gray-600">Pension contributions can reduce relevant pay</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Uniform purchases</p>
                <p className="text-sm text-gray-600">Cannot reduce pay below minimum wage</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Records */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Minimum Wage Compliance Checks</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-700">Employee</th>
                <th className="text-left p-4 font-medium text-gray-700">Period</th>
                <th className="text-left p-4 font-medium text-gray-700">Age Category</th>
                <th className="text-left p-4 font-medium text-gray-700">Min Wage</th>
                <th className="text-left p-4 font-medium text-gray-700">Actual Rate</th>
                <th className="text-left p-4 font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {complianceRecords.slice(0, 20).map((record) => (
                <tr key={record.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{record.employeeId}</td>
                  <td className="p-4 text-gray-600">
                    {new Date(record.payPeriodStart).toLocaleDateString()} - {new Date(record.payPeriodEnd).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-gray-600">{record.ageCategory?.replace(/_/g, ' ')}</td>
                  <td className="p-4 text-gray-600">£{record.applicableMinimumWage}</td>
                  <td className="p-4 text-gray-600">£{record.actualHourlyRate?.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      record.status === 'COMPLIANT' ? 'bg-green-100 text-green-700' :
                      record.status === 'UNDERPAYMENT' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
              {complianceRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No compliance checks performed
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
