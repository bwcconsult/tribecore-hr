import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Globe,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Download,
  Info,
  Users,
  TrendingUp,
  MapPin,
} from 'lucide-react';
import axiosInstance from '../../lib/axios';

interface ThirteenthMonthCalculation {
  employeeId: string;
  employeeName: string;
  baseSalary: number;
  serviceMonths: number;
  calculation: {
    fullAmount: number;
    proratedAmount: number;
    taxableAmount: number;
    tax: number;
    netAmount: number;
  };
  eligible: boolean;
  reason?: string;
}

interface CountryConfig {
  country: string;
  enabled: boolean;
  paymentMonth: number;
  calculationMethod: string;
  minimumServiceMonths: number;
  taxable: boolean;
  includesBonuses: boolean;
}

const ThirteenthMonthCalculator: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const { data: calculations, isLoading } = useQuery<ThirteenthMonthCalculation[]>({
    queryKey: ['thirteenth-month', selectedYear],
    queryFn: async () => {
      const response = await axiosInstance.get(
        `/payroll/advanced/thirteenth-month/${selectedYear}`
      );
      return response.data;
    },
  });

  const { data: countries } = useQuery<CountryConfig[]>({
    queryKey: ['thirteenth-month-countries'],
    queryFn: async () => {
      const response = await axiosInstance.get(
        '/payroll/advanced/thirteenth-month/countries'
      );
      return response.data;
    },
  });

  const eligibleEmployees =
    calculations?.filter((calc) => calc.eligible).length || 0;
  const totalPayout =
    calculations?.reduce(
      (sum, calc) => sum + (calc.eligible ? calc.calculation.netAmount : 0),
      0
    ) || 0;
  const totalGross =
    calculations?.reduce(
      (sum, calc) => sum + (calc.eligible ? calc.calculation.proratedAmount : 0),
      0
    ) || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
            <Globe className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              13th & 14th Month Salary Calculator
            </h1>
            <p className="text-gray-600 mt-1">
              Global statutory bonus calculation for all countries
            </p>
          </div>
        </div>
      </div>

      {/* Year Selector */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-green-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-green-600" />
            <span className="text-lg font-semibold text-gray-800">
              Select Year
            </span>
          </div>
          <div className="flex gap-2">
            {[2023, 2024, 2025].map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  selectedYear === year
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-100">Total Payout</span>
            <DollarSign className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold">
            ${totalPayout.toLocaleString()}
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-100">Total Gross</span>
            <TrendingUp className="w-6 h-6" />
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
          <p className="text-3xl font-bold">{eligibleEmployees}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-orange-100">Countries Supported</span>
            <MapPin className="w-6 h-6" />
          </div>
          <p className="text-3xl font-bold">{countries?.length || 0}</p>
        </div>
      </div>

      {/* Supported Countries Info */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-lg p-6 mb-8 border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">
            Supported Countries
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {countries?.map((country) => (
            <div
              key={country.country}
              className="bg-white rounded-lg p-3 border border-blue-200"
            >
              <p className="font-semibold text-gray-800 text-sm">
                {country.country}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {country.calculationMethod.replace(/_/g, ' ')}
              </p>
              {country.taxable && (
                <span className="inline-block mt-2 px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
                  Taxable
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Employee Calculations */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-green-600" />
            Employee Calculations
          </h2>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Download className="w-5 h-5" />
            Export Report
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
                  Service (Months)
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Full Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Prorated
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Tax
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Net Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {calculations?.map((calc) => (
                <tr
                  key={calc.employeeId}
                  className={`hover:bg-green-50 transition-colors ${
                    !calc.eligible ? 'opacity-60' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {calc.employeeName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {calc.employeeName}
                        </p>
                        {!calc.eligible && calc.reason && (
                          <p className="text-xs text-red-600 mt-1">
                            {calc.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    ${calc.baseSalary.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {calc.serviceMonths} months
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    ${calc.calculation.fullAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-semibold text-green-600">
                    ${calc.calculation.proratedAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-red-600">
                    ${calc.calculation.tax.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-bold text-green-600">
                    ${calc.calculation.netAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    {calc.eligible ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Eligible</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="w-5 h-5" />
                        <span className="font-medium">Not Eligible</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl shadow-lg p-6 border border-yellow-200">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">
              About 13th Month Salary
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              13th month salary is a statutory bonus required in many countries,
              typically paid at year-end. The calculation method varies by
              country: some require a full month's salary, others prorate based
              on service months, and some calculate based on average earnings.
              Countries like Italy and Greece also require a 14th month salary,
              usually paid mid-year.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThirteenthMonthCalculator;
