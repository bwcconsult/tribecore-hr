import { useState } from 'react';
import { Droplet, Plus, AlertTriangle, FileText } from 'lucide-react';

export default function HazardousSubstancesPage() {
  const substances = [
    {
      id: '1',
      code: 'COSHH-001',
      name: 'Industrial Cleaner X500',
      hazardClasses: ['CORROSIVE', 'IRRITANT'],
      location: 'Chemical Store A',
      quantity: 50,
      unit: 'L',
      lastReview: '2025-08-15',
    },
    {
      id: '2',
      code: 'COSHH-002',
      name: 'Paint Thinner',
      hazardClasses: ['FLAMMABLE', 'HARMFUL'],
      location: 'Paint Shop',
      quantity: 25,
      unit: 'L',
      lastReview: '2025-09-01',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hazardous Substances (COSHH)</h1>
            <p className="text-gray-600 mt-1">Manage hazardous substances and COSHH assessments</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
            <Plus className="w-4 h-4" />
            Add Substance
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-orange-100">Total Substances</p>
          <p className="text-4xl font-bold mt-2">127</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-yellow-100">High Risk</p>
          <p className="text-4xl font-bold mt-2">15</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-sm p-6 text-white">
          <p className="text-green-100">Assessments Complete</p>
          <p className="text-4xl font-bold mt-2">98%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Registered Substances</h3>
        <div className="space-y-4">
          {substances.map((substance) => (
            <div key={substance.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Droplet className="w-5 h-5 text-orange-600" />
                    <h4 className="font-semibold text-gray-900">{substance.name}</h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{substance.code}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <div>Location: {substance.location}</div>
                    <div>Quantity: {substance.quantity} {substance.unit}</div>
                    <div>Last Review: {new Date(substance.lastReview).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {substance.hazardClasses.map((hazard, idx) => (
                      <span key={idx} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {hazard}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    View SDS
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
