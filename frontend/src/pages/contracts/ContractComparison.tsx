import { useState, useEffect } from 'react';
import { GitCompare, FileText, AlertTriangle, Check, X, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  type: string;
  value: number;
  startDate: string;
  endDate: string;
  counterpartyName: string;
}

interface ComparisonResult {
  field: string;
  contract1Value: any;
  contract2Value: any;
  isDifferent: boolean;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface ClauseComparison {
  clauseKey: string;
  title: string;
  contract1Text: string;
  contract2Text: string;
  similarity: number;
  isDeviation: boolean;
}

export default function ContractComparison() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contract1Id, setContract1Id] = useState('');
  const [contract2Id, setContract2Id] = useState('');
  const [comparison, setComparison] = useState<ComparisonResult[] | null>(null);
  const [clauseComparison, setClauseComparison] = useState<ClauseComparison[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    // Mock data
    setContracts([
      {
        id: '1',
        contractNumber: 'CON-2025-00001',
        title: 'Senior Software Engineer - John Smith',
        type: 'EMPLOYMENT',
        value: 85000,
        startDate: '2025-02-01',
        endDate: '2026-02-01',
        counterpartyName: 'John Smith',
      },
      {
        id: '2',
        contractNumber: 'CON-2025-00006',
        title: 'Senior Software Engineer - Jane Doe',
        type: 'EMPLOYMENT',
        value: 90000,
        startDate: '2025-01-15',
        endDate: '2026-01-15',
        counterpartyName: 'Jane Doe',
      },
      {
        id: '3',
        contractNumber: 'CON-2025-00002',
        title: 'Cloud Infrastructure Services - AWS',
        type: 'VENDOR',
        value: 250000,
        startDate: '2025-02-01',
        endDate: '2026-02-01',
        counterpartyName: 'AWS Corporation',
      },
      {
        id: '4',
        contractNumber: 'CON-2025-00007',
        title: 'Cloud Services - Azure',
        type: 'VENDOR',
        value: 220000,
        startDate: '2025-03-01',
        endDate: '2026-03-01',
        counterpartyName: 'Microsoft Azure',
      },
    ]);
  };

  const compareContracts = async () => {
    if (!contract1Id || !contract2Id) {
      toast.error('Please select two contracts to compare');
      return;
    }

    if (contract1Id === contract2Id) {
      toast.error('Please select different contracts');
      return;
    }

    setLoading(true);

    // Mock comparison results
    setTimeout(() => {
      setComparison([
        {
          field: 'Contract Value',
          contract1Value: '£85,000',
          contract2Value: '£90,000',
          isDifferent: true,
          severity: 'HIGH',
        },
        {
          field: 'Contract Type',
          contract1Value: 'EMPLOYMENT',
          contract2Value: 'EMPLOYMENT',
          isDifferent: false,
          severity: 'LOW',
        },
        {
          field: 'Start Date',
          contract1Value: '2025-02-01',
          contract2Value: '2025-01-15',
          isDifferent: true,
          severity: 'MEDIUM',
        },
        {
          field: 'End Date',
          contract1Value: '2026-02-01',
          contract2Value: '2026-01-15',
          isDifferent: true,
          severity: 'MEDIUM',
        },
        {
          field: 'Notice Period',
          contract1Value: '30 days',
          contract2Value: '30 days',
          isDifferent: false,
          severity: 'LOW',
        },
        {
          field: 'Probation Period',
          contract1Value: '3 months',
          contract2Value: '6 months',
          isDifferent: true,
          severity: 'HIGH',
        },
        {
          field: 'Annual Leave',
          contract1Value: '25 days',
          contract2Value: '28 days',
          isDifferent: true,
          severity: 'MEDIUM',
        },
        {
          field: 'Jurisdiction',
          contract1Value: 'UK',
          contract2Value: 'UK',
          isDifferent: false,
          severity: 'LOW',
        },
      ]);

      setClauseComparison([
        {
          clauseKey: 'CONFIDENTIALITY',
          title: 'Confidentiality',
          contract1Text:
            'The Employee agrees to maintain the confidentiality of all proprietary information disclosed during employment.',
          contract2Text:
            'The Employee agrees to maintain strict confidentiality of all proprietary, confidential, and trade secret information disclosed during the course of employment.',
          similarity: 87,
          isDeviation: true,
        },
        {
          clauseKey: 'TERMINATION',
          title: 'Termination',
          contract1Text: 'Either party may terminate this agreement with 30 days written notice.',
          contract2Text: 'Either party may terminate this agreement with 30 days written notice.',
          similarity: 100,
          isDeviation: false,
        },
        {
          clauseKey: 'IP_RIGHTS',
          title: 'Intellectual Property',
          contract1Text:
            'All work product created during employment shall be the exclusive property of the Employer.',
          contract2Text:
            'All inventions, discoveries, and work product created during employment shall be the sole and exclusive property of the Employer, including all intellectual property rights.',
          similarity: 78,
          isDeviation: true,
        },
        {
          clauseKey: 'NON_COMPETE',
          title: 'Non-Compete',
          contract1Text:
            'Employee agrees not to engage in competing business for 12 months after termination.',
          contract2Text:
            'Employee agrees not to engage in competing business for 6 months after termination.',
          similarity: 85,
          isDeviation: true,
        },
      ]);

      setLoading(false);
      toast.success('Comparison complete');
    }, 1000);
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      HIGH: 'text-red-600 bg-red-100',
      MEDIUM: 'text-yellow-600 bg-yellow-100',
      LOW: 'text-gray-600 bg-gray-100',
    };
    return colors[severity as keyof typeof colors] || colors.LOW;
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 95) return 'text-green-600 bg-green-100';
    if (similarity >= 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Contract Comparison</h1>
        <p className="text-gray-600 mt-1">Compare contracts side-by-side to identify differences</p>
      </div>

      {/* Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Contracts to Compare</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium mb-2">Contract 1</label>
              <select
                value={contract1Id}
                onChange={(e) => setContract1Id(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select contract...</option>
                {contracts.map((contract) => (
                  <option key={contract.id} value={contract.id}>
                    {contract.contractNumber} - {contract.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-center">
              <GitCompare className="h-6 w-6 text-gray-400" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contract 2</label>
              <select
                value={contract2Id}
                onChange={(e) => setContract2Id(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Select contract...</option>
                {contracts.map((contract) => (
                  <option key={contract.id} value={contract.id}>
                    {contract.contractNumber} - {contract.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <Button onClick={compareContracts} disabled={loading} className="w-full">
              {loading ? 'Comparing...' : 'Compare Contracts'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {comparison && (
        <>
          {/* Field-by-Field Comparison */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Field Comparison</CardTitle>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-gray-600">
                      {comparison.filter((c) => !c.isDifferent).length} Matching
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="text-gray-600">
                      {comparison.filter((c) => c.isDifferent).length} Different
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {comparison.map((item, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      item.isDifferent ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">{item.field}</span>
                        {item.isDifferent && (
                          <span className={`px-2 py-1 text-xs font-bold rounded ${getSeverityColor(item.severity)}`}>
                            {item.severity}
                          </span>
                        )}
                      </div>
                      {item.isDifferent ? (
                        <X className="h-5 w-5 text-red-600" />
                      ) : (
                        <Check className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div className="p-3 bg-white rounded border">
                        <p className="text-xs text-gray-600 mb-1">Contract 1</p>
                        <p className="font-medium text-gray-900">{item.contract1Value}</p>
                      </div>
                      <div className="flex justify-center">
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="p-3 bg-white rounded border">
                        <p className="text-xs text-gray-600 mb-1">Contract 2</p>
                        <p className="font-medium text-gray-900">{item.contract2Value}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Clause Comparison */}
          {clauseComparison && (
            <Card>
              <CardHeader>
                <CardTitle>Clause-by-Clause Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clauseComparison.map((clause, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{clause.title}</h4>
                          <p className="text-sm text-gray-600">{clause.clauseKey}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 text-sm font-bold rounded ${getSimilarityColor(clause.similarity)}`}>
                            {clause.similarity}% Match
                          </span>
                          {clause.isDeviation && (
                            <span className="px-2 py-1 text-xs font-bold rounded bg-orange-100 text-orange-800">
                              DEVIATION
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-50 rounded">
                          <p className="text-xs font-medium text-blue-800 mb-2">Contract 1</p>
                          <p className="text-sm text-gray-700">{clause.contract1Text}</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded">
                          <p className="text-xs font-medium text-purple-800 mb-2">Contract 2</p>
                          <p className="text-sm text-gray-700">{clause.contract2Text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Comparison Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <Check className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-green-600 mb-1">
                    {comparison.filter((c) => !c.isDifferent).length}
                  </p>
                  <p className="text-sm text-gray-600">Matching Fields</p>
                </div>
                <div className="text-center p-6 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-yellow-600 mb-1">
                    {comparison.filter((c) => c.isDifferent).length}
                  </p>
                  <p className="text-sm text-gray-600">Different Fields</p>
                </div>
                <div className="text-center p-6 bg-red-50 rounded-lg">
                  <X className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-red-600 mb-1">
                    {comparison.filter((c) => c.isDifferent && c.severity === 'HIGH').length}
                  </p>
                  <p className="text-sm text-gray-600">High Severity</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
