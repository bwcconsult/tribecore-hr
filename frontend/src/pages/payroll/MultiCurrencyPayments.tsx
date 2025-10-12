import React, { useState } from 'react';
import { Globe, TrendingUp, DollarSign, RefreshCw, Download, Send } from 'lucide-react';
import { formatCurrency, CURRENCIES } from '../../constants/currencies';

export const MultiCurrencyPayments: React.FC = () => {
  const [baseCurrency, setBaseCurrency] = useState('GBP');

  const paymentsByCurrency = [
    {
      currency: 'GBP',
      symbol: '£',
      employees: 120,
      grossPay: 850000,
      netPay: 620000,
      exchangeRate: 1.0,
      bankFormat: 'BACS',
    },
    {
      currency: 'USD',
      symbol: '$',
      employees: 85,
      grossPay: 520000,
      netPay: 380000,
      exchangeRate: 1.27,
      bankFormat: 'NACHA',
    },
    {
      currency: 'EUR',
      symbol: '€',
      employees: 45,
      grossPay: 280000,
      netPay: 195000,
      exchangeRate: 1.17,
      bankFormat: 'SEPA',
    },
    {
      currency: 'NGN',
      symbol: '₦',
      employees: 65,
      grossPay: 45000000,
      netPay: 32000000,
      exchangeRate: 0.00063,
      bankFormat: 'NIBSS',
    },
  ];

  const totalInBaseCurrency = paymentsByCurrency.reduce(
    (sum, payment) => sum + payment.netPay * payment.exchangeRate,
    0
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Multi-Currency Payments</h1>
          <p className="text-gray-600">Process global payroll across multiple currencies</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={baseCurrency}
            onChange={(e) => setBaseCurrency(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.name}
              </option>
            ))}
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Update Rates
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Globe className="w-8 h-8 opacity-80" />
            <span className="text-sm opacity-90">Total</span>
          </div>
          <p className="text-3xl font-bold mb-1">
            {formatCurrency(totalInBaseCurrency, baseCurrency)}
          </p>
          <p className="text-sm opacity-90">Total Net Pay ({baseCurrency})</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{paymentsByCurrency.length}</p>
          <p className="text-sm text-gray-600">Active Currencies</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <Globe className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {paymentsByCurrency.reduce((sum, p) => sum + p.employees, 0)}
          </p>
          <p className="text-sm text-gray-600">Total Employees</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">4</p>
          <p className="text-sm text-gray-600">Bank Formats</p>
        </div>
      </div>

      {/* Currency Breakdown */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Currency Breakdown</h2>
          <span className="text-sm text-gray-600">
            Rates updated: {new Date().toLocaleString()}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Currency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Employees
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Gross Pay
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Net Pay
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Exchange Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  In {baseCurrency}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Bank Format
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paymentsByCurrency.map((payment) => (
                <tr key={payment.currency} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg">
                        {payment.symbol}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{payment.currency}</p>
                        <p className="text-xs text-gray-500">
                          {CURRENCIES.find((c) => c.code === payment.currency)?.name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-900">{payment.employees}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">
                      {payment.symbol}
                      {payment.grossPay.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-green-600">
                      {payment.symbol}
                      {payment.netPay.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      1 {payment.currency} = {payment.exchangeRate.toFixed(4)} {baseCurrency}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(payment.netPay * payment.exchangeRate, baseCurrency)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                      {payment.bankFormat}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Generate Bank File">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-green-600 hover:bg-green-50 rounded" title="Process Payment">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bank File Generation */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Bank Files</h3>
          <div className="space-y-3">
            {paymentsByCurrency.map((payment) => (
              <div
                key={payment.currency}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{payment.symbol}</span>
                  <div>
                    <p className="font-medium text-gray-900">{payment.currency} Payments</p>
                    <p className="text-sm text-gray-600">
                      {payment.employees} employees • {payment.bankFormat}
                    </p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Generate
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FX Summary */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">FX Conversion Summary</h3>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Before Conversion</p>
              <p className="text-2xl font-bold text-gray-900">Mixed Currencies</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total After Conversion ({baseCurrency})</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalInBaseCurrency, baseCurrency)}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">FX Spread Cost</p>
              <p className="text-lg font-semibold text-orange-600">
                {formatCurrency(totalInBaseCurrency * 0.002, baseCurrency)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Est. 0.2% spread</p>
            </div>
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
              Lock Exchange Rates
            </button>
          </div>
        </div>
      </div>

      {/* Payment Schedule */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Schedule</h3>
        <div className="grid grid-cols-4 gap-4">
          {paymentsByCurrency.map((payment) => (
            <div key={payment.currency} className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">{payment.currency}</p>
              <p className="text-lg font-bold text-gray-900">
                {payment.symbol}
                {payment.netPay.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-2">Processing via {payment.bankFormat}</p>
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-green-600 font-medium">Ready to process</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
        <div>
          <p className="font-medium text-gray-900">All currency payments ready</p>
          <p className="text-sm text-gray-600">
            {paymentsByCurrency.reduce((sum, p) => sum + p.employees, 0)} employees across{' '}
            {paymentsByCurrency.length} currencies
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Download All Files
          </button>
          <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Send className="w-4 h-4" />
            Process All Payments
          </button>
        </div>
      </div>
    </div>
  );
};
