import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Gift,
  TrendingUp,
  Users,
  DollarSign,
  Award,
  Target,
  Calculator,
  Download,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import axiosInstance from '../../lib/axios';

interface BonusCalculation {
  employeeId: string;
  employeeName: string;
  bonusType: string;
  baseSalary: number;
  calculation: {
    grossBonus: number;
    taxableAmount: number;
    tax: number;
    netBonus: number;
    breakdown: string;
  };
  eligible: boolean;
  reason?: string;
}

const BonusCommissionManager: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('YEAR_END');
  const [bonusPercentage, setBonusPercentage] = useState<number>(100);
  const [targetAmount, setTargetAmount] = useState<number>(100000);
  const [actualAmount, setActualAmount] = useState<number>(120000);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const calculateBonusMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post(
        '/payroll/advanced/bonus/bulk',
        data
      );
      return response.data;
    },
  });

  const handleCalculate = () => {
    let rule: any = {
      type: selectedType,
      taxable: true,
    };

    if (selectedType === 'YEAR_END') {
      rule = {
        type: 'YEAR_END',
        calculationMethod: 'PERCENTAGE_OF_SALARY',
        value: bonusPercentage,
        minServiceMonths: 6,
        taxable: true,
        payableMonth: 12,
      };
    } else if (selectedType === 'PERFORMANCE') {
      rule = {
        type: 'PERFORMANCE',
        calculationMethod: 'TARGET_BASED',
        value: 20,
        targetAmount,
        achievedAmount: actualAmount,
        taxable: true,
      };
    } else if (selectedType === 'SALES_COMMISSION') {
      rule = {
        type: 'SALES_COMMISSION',
        calculationMethod: 'TIERED_COMMISSION',
        value: 0,
        achievedAmount: actualAmount,
        tiers: [
          { from: 0, to: 50000, rate: 2 },
          { from: 50000, to: 100000, rate: 3 },
          { from: 100000, to: 250000, rate: 5 },
          { from: 250000, to: Infinity, rate: 7 },
        ],
        taxable: true,
      };
    }

    calculateBonusMutation.mutate({ rule });
  };

  const toggleRow = (employeeId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId);
    } else {
      newExpanded.add(employeeId);
    }
    setExpandedRows(newExpanded);
  };

  const totalBonus =
    calculateBonusMutation.data?.reduce(
      (sum: number, calc: BonusCalculation) =>
        sum + (calc.eligible ? calc.calculation.netBonus : 0),
      0
    ) || 0;

  const totalGross =
    calculateBonusMutation.data?.reduce(
      (sum: number, calc: BonusCalculation) =>
        sum + (calc.eligible ? calc.calculation.grossBonus : 0),
      0
    ) || 0;

  const eligibleCount =
    calculateBonusMutation.data?.filter((calc: BonusCalculation) => calc.eligible)
      .length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl shadow-lg">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
              Bonus & Commission Manager
            </h1>
            <p className="text-gray-600 mt-1">
              Calculate and manage employee bonuses and commissions
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-amber-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-amber-600" />
          Bonus Configuration
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Bonus Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bonus Type
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="YEAR_END">Year-End Bonus</option>
              <option value="PERFORMANCE">Performance Bonus</option>
              <option value="SALES_COMMISSION">Sales Commission</option>
              <option value="SIGNING">Signing Bonus</option>
              <option value="RETENTION">Retention Bonus</option>
            </select>
          </div>

          {/* Dynamic Fields based on type */}
          {selectedType === 'YEAR_END' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bonus Percentage
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={bonusPercentage}
                  onChange={(e) => setBonusPercentage(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                  %
                </span>
              </div>
            </div>
          )}

          {selectedType === 'PERFORMANCE' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Actual Achievement
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    value={actualAmount}
                    onChange={(e) => setActualAmount(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </>
          )}

          {selectedType === 'SALES_COMMISSION' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Sales Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  value={actualAmount}
                  onChange={(e) => setActualAmount(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleCalculate}
          disabled={calculateBonusMutation.isPending}
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 text-white py-4 rounded-xl font-semibold hover:from-amber-600 hover:to-yellow-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {calculateBonusMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Calculating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Calculate Bonuses
            </>
          )}
        </button>
      </div>

      {/* Results Summary */}
      {calculateBonusMutation.data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-100">Total Net Bonus</span>
                <DollarSign className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold">
                ${totalBonus.toLocaleString()}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100">Total Gross</span>
                <Award className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold">
                ${totalGross.toLocaleString()}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-100">Eligible Employees</span>
                <Users className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold">{eligibleCount}</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-orange-100">Avg Bonus</span>
                <Target className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold">
                ${eligibleCount > 0 ? Math.round(totalBonus / eligibleCount).toLocaleString() : 0}
              </p>
            </div>
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-amber-600" />
                Bonus Calculations
              </h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
                <Download className="w-5 h-5" />
                Export
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Base Salary
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Gross Bonus
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Tax
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Net Bonus
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {calculateBonusMutation.data.map(
                    (calc: BonusCalculation, index: number) => (
                      <React.Fragment key={calc.employeeId}>
                        <tr className="hover:bg-amber-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-semibold">
                                {calc.employeeName.charAt(0)}
                              </div>
                              <span className="font-medium text-gray-800">
                                {calc.employeeName}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            ${calc.baseSalary.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 font-semibold text-green-600">
                            ${calc.calculation.grossBonus.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-red-600">
                            ${calc.calculation.tax.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 font-bold text-green-600">
                            ${calc.calculation.netBonus.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            {calc.eligible ? (
                              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                Eligible
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                                Not Eligible
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => toggleRow(calc.employeeId)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              {expandedRows.has(calc.employeeId) ? (
                                <ChevronUp className="w-5 h-5 text-gray-600" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-gray-600" />
                              )}
                            </button>
                          </td>
                        </tr>
                        {expandedRows.has(calc.employeeId) && (
                          <tr className="bg-amber-50">
                            <td colSpan={7} className="px-6 py-4">
                              <div className="bg-white rounded-lg p-4 border border-amber-200">
                                <h4 className="font-semibold text-gray-800 mb-2">
                                  Calculation Details
                                </h4>
                                <p className="text-gray-700 mb-3">
                                  {calc.calculation.breakdown}
                                </p>
                                {!calc.eligible && calc.reason && (
                                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <p className="text-red-800 text-sm">
                                      <strong>Reason:</strong> {calc.reason}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BonusCommissionManager;
