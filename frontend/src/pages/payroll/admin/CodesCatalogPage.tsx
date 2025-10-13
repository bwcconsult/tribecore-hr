import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import {
  Plus,
  Edit,
  Trash2,
  DollarSign,
  TrendingDown,
  FileText,
  ArrowLeft,
} from 'lucide-react';
import payslipService from '../../../services/payslipService';
import EarningCodeModal from '../../../components/payroll/EarningCodeModal';

export default function CodesCatalogPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'earnings' | 'deductions' | 'taxes'>('earnings');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [isEarningModalOpen, setIsEarningModalOpen] = useState(false);
  const [editingEarningCode, setEditingEarningCode] = useState<any>(null);

  const { data: earningCodes, isLoading: loadingEarnings } = useQuery({
    queryKey: ['earning-codes', selectedCountry],
    queryFn: () =>
      payslipService.getEarningCodes(selectedCountry !== 'all' ? selectedCountry : undefined),
    enabled: activeTab === 'earnings',
  });

  const { data: deductionCodes, isLoading: loadingDeductions } = useQuery({
    queryKey: ['deduction-codes', selectedCountry],
    queryFn: () =>
      payslipService.getDeductionCodes(selectedCountry !== 'all' ? selectedCountry : undefined),
    enabled: activeTab === 'deductions',
  });

  const { data: taxCodes, isLoading: loadingTaxes } = useQuery({
    queryKey: ['tax-codes', selectedCountry],
    queryFn: () =>
      payslipService.getTaxCodes(selectedCountry !== 'all' ? selectedCountry : undefined),
    enabled: activeTab === 'taxes',
  });

  const isLoading = loadingEarnings || loadingDeductions || loadingTaxes;

  const tabs = [
    { id: 'earnings' as const, label: 'Earning Codes', icon: DollarSign, count: earningCodes?.length || 0 },
    { id: 'deductions' as const, label: 'Deduction Codes', icon: TrendingDown, count: deductionCodes?.length || 0 },
    { id: 'taxes' as const, label: 'Tax Codes', icon: FileText, count: taxCodes?.length || 0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/payroll/admin/payslips')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Codes Catalog</h1>
            <p className="text-gray-600 mt-1">Manage earning, deduction, and tax codes</p>
          </div>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Countries</option>
            <option value="UK">United Kingdom</option>
            <option value="US">United States</option>
            <option value="NG">Nigeria</option>
            <option value="ZA">South Africa</option>
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
                <span
                  className={`
                    ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium
                    ${activeTab === tab.id ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'}
                  `}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading codes...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Earning Codes */}
          {activeTab === 'earnings' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Earning Codes</CardTitle>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Code
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {earningCodes && earningCodes.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Code</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Label</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Countries</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Taxable</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Pensionable</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Status</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {earningCodes.map((code: any) => (
                          <tr key={code.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <span className="font-mono text-sm font-semibold text-gray-900">{code.code}</span>
                            </td>
                            <td className="px-4 py-3 text-gray-900">{code.label}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {code.countries.map((country: string) => (
                                  <span key={country} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                    {country}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {code.taxable ? (
                                <span className="text-green-600">✓</span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {code.pensionable ? (
                                <span className="text-green-600">✓</span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${code.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {code.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button className="text-blue-600 hover:text-blue-800">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-800">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No earning codes found</h3>
                    <p className="text-gray-600 mb-6">Create your first earning code to get started</p>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Earning Code
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Deduction Codes */}
          {activeTab === 'deductions' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Deduction Codes</CardTitle>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Code
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {deductionCodes && deductionCodes.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Code</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Label</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Countries</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Pre-Tax</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Statutory</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Status</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {deductionCodes.map((code: any) => (
                          <tr key={code.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <span className="font-mono text-sm font-semibold text-gray-900">{code.code}</span>
                            </td>
                            <td className="px-4 py-3 text-gray-900">{code.label}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-1">
                                {code.countries.map((country: string) => (
                                  <span key={country} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                    {country}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {code.isPreTax ? (
                                <span className="text-green-600">✓</span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {code.isStatutory ? (
                                <span className="text-green-600">✓</span>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${code.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {code.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button className="text-blue-600 hover:text-blue-800">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-800">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingDown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No deduction codes found</h3>
                    <p className="text-gray-600 mb-6">Create your first deduction code to get started</p>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Deduction Code
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Tax Codes */}
          {activeTab === 'taxes' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Tax Codes</CardTitle>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Code
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {taxCodes && taxCodes.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Code</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Label</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Country</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Basis</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Effective From</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Status</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {taxCodes.map((code: any) => (
                          <tr key={code.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <span className="font-mono text-sm font-semibold text-gray-900">{code.code}</span>
                            </td>
                            <td className="px-4 py-3 text-gray-900">{code.label}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                {code.country}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-900">{code.basis}</td>
                            <td className="px-4 py-3 text-gray-900">
                              {new Date(code.effectiveFrom).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${code.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {code.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <button className="text-blue-600 hover:text-blue-800">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="text-red-600 hover:text-red-800">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No tax codes found</h3>
                    <p className="text-gray-600 mb-6">Create your first tax code to get started</p>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Tax Code
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
