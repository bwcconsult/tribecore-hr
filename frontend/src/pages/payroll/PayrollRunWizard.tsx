import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Calendar, Users, DollarSign, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { payrollService } from '../../services/payrollService';

type WizardStep = 'setup' | 'employees' | 'calculate' | 'review' | 'approve' | 'complete';

export const PayrollRunWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<WizardStep>('setup');
  const [payrollRun, setPayrollRun] = useState({
    runName: '',
    periodStart: '',
    periodEnd: '',
    paymentDate: '',
    frequency: 'MONTHLY',
  });

  const steps: Array<{ id: WizardStep; name: string; icon: any }> = [
    { id: 'setup', name: 'Setup', icon: Calendar },
    { id: 'employees', name: 'Select Employees', icon: Users },
    { id: 'calculate', name: 'Calculate', icon: DollarSign },
    { id: 'review', name: 'Review', icon: FileText },
    { id: 'approve', name: 'Approve', icon: CheckCircle },
    { id: 'complete', name: 'Complete', icon: CheckCircle },
  ];

  const stepIndex = steps.findIndex(s => s.id === currentStep);

  const nextStep = () => {
    const currentIndex = stepIndex;
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].id);
    }
  };

  const prevStep = () => {
    const currentIndex = stepIndex;
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">New Payroll Run</h1>
          <p className="text-gray-600">Process payroll for your organization</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      index <= stepIndex
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <step.icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      index <= stepIndex ? 'text-blue-600' : 'text-gray-400'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-4 ${
                      index < stepIndex ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {currentStep === 'setup' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Payroll Run Setup</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Run Name
                  </label>
                  <input
                    type="text"
                    value={payrollRun.runName}
                    onChange={(e) => setPayrollRun({ ...payrollRun, runName: e.target.value })}
                    placeholder="e.g., January 2025 Payroll"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={payrollRun.frequency}
                    onChange={(e) => setPayrollRun({ ...payrollRun, frequency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="BIWEEKLY">Bi-Weekly</option>
                    <option value="WEEKLY">Weekly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period Start
                  </label>
                  <input
                    type="date"
                    value={payrollRun.periodStart}
                    onChange={(e) => setPayrollRun({ ...payrollRun, periodStart: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Period End
                  </label>
                  <input
                    type="date"
                    value={payrollRun.periodEnd}
                    onChange={(e) => setPayrollRun({ ...payrollRun, periodEnd: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={payrollRun.paymentDate}
                    onChange={(e) => setPayrollRun({ ...payrollRun, paymentDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 'employees' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Select Employees</h2>
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-4 mb-4">
                  <input type="checkbox" className="rounded" />
                  <span className="font-medium">Select All (245 employees)</span>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <div className="flex-1">
                        <p className="font-medium">Employee {i + 1}</p>
                        <p className="text-sm text-gray-600">Department • £45,000/year</p>
                      </div>
                      <span className="text-sm text-gray-600">UK</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 'calculate' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Calculating Payroll</h2>
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Processing 245 employees...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few minutes</p>
              </div>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Review Payroll</h2>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 font-medium">Total Employees</p>
                  <p className="text-2xl font-bold text-blue-900">245</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 font-medium">Gross Pay</p>
                  <p className="text-2xl font-bold text-green-900">£1,245,678</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-orange-600 font-medium">Total Tax</p>
                  <p className="text-2xl font-bold text-orange-900">£324,567</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-purple-600 font-medium">Net Pay</p>
                  <p className="text-2xl font-bold text-purple-900">£921,111</p>
                </div>
              </div>

              {/* Errors/Warnings */}
              <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-900">3 Warnings</span>
                </div>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Employee #123: Missing bank details</li>
                  <li>• Employee #456: Tax code needs review</li>
                  <li>• Employee #789: Unusual overtime hours</li>
                </ul>
              </div>
            </div>
          )}

          {currentStep === 'approve' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Final Approval</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <CheckCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <p className="text-center text-gray-700 mb-4">
                  Payroll is ready for approval. Once approved, payments will be processed.
                </p>
                <div className="flex gap-4 justify-center">
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Approve Payroll
                  </button>
                  <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Download Report
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 'complete' && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Payroll Complete!</h2>
                <p className="text-gray-600 mb-6">Payments have been processed successfully</p>
                <div className="flex gap-4 justify-center">
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download Payslips
                  </button>
                  <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Generate Bank Files
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={prevStep}
              disabled={stepIndex === 0}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={nextStep}
              disabled={stepIndex === steps.length - 1}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {stepIndex === steps.length - 2 ? 'Complete' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
