import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, AlertTriangle, CheckCircle, Clock, TrendingUp, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

interface Renewal {
  id: string;
  contract: {
    id: string;
    contractNumber: string;
    title: string;
    counterpartyName: string;
    value: number;
    type: string;
  };
  renewalDate: string;
  noticeByDate: string;
  daysUntilRenewal: number;
  daysUntilNotice: number;
  status: string;
  decision: string;
  performanceScore?: number;
}

export default function RenewalsRadar() {
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRenewal, setSelectedRenewal] = useState<Renewal | null>(null);
  const [showDecisionModal, setShowDecisionModal] = useState(false);

  useEffect(() => {
    fetchRenewals();
  }, []);

  const fetchRenewals = async () => {
    setLoading(true);
    // Mock data
    setTimeout(() => {
      setRenewals([
        {
          id: '1',
          contract: {
            id: '5',
            contractNumber: 'CON-2025-00005',
            title: 'Office Lease Agreement',
            counterpartyName: 'Property Management Co',
            value: 480000,
            type: 'LEASE',
          },
          renewalDate: '2025-12-31',
          noticeByDate: '2025-10-01',
          daysUntilRenewal: 350,
          daysUntilNotice: 258,
          status: 'DUE_180_DAYS',
          decision: 'PENDING',
          performanceScore: 85,
        },
        {
          id: '2',
          contract: {
            id: '2',
            contractNumber: 'CON-2025-00002',
            title: 'Cloud Infrastructure Services',
            counterpartyName: 'AWS Corporation',
            value: 250000,
            type: 'VENDOR',
          },
          renewalDate: '2026-02-01',
          noticeByDate: '2025-11-01',
          daysUntilRenewal: 382,
          daysUntilNotice: 290,
          status: 'DUE_180_DAYS',
          decision: 'PENDING',
          performanceScore: 92,
        },
        {
          id: '3',
          contract: {
            id: '1',
            contractNumber: 'CON-2025-00001',
            title: 'Senior Software Engineer',
            counterpartyName: 'John Smith',
            value: 85000,
            type: 'EMPLOYMENT',
          },
          renewalDate: '2026-02-01',
          noticeByDate: '2025-12-01',
          daysUntilRenewal: 382,
          daysUntilNotice: 320,
          status: 'NOT_DUE',
          decision: 'PENDING',
          performanceScore: 88,
        },
      ]);
      setLoading(false);
    }, 500);
  };

  const handleDecision = async (renewalId: string, decision: string) => {
    toast.success(`Renewal decision: ${decision}`);
    setShowDecisionModal(false);
    fetchRenewals();
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DUE_30_DAYS: 'bg-red-100 text-red-800',
      DUE_60_DAYS: 'bg-orange-100 text-orange-800',
      DUE_90_DAYS: 'bg-yellow-100 text-yellow-800',
      DUE_180_DAYS: 'bg-blue-100 text-blue-800',
      NOT_DUE: 'bg-gray-100 text-gray-800',
      OVERDUE: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredRenewals = renewals.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  const stats = {
    total: renewals.length,
    due30: renewals.filter((r) => r.daysUntilNotice <= 30 && r.daysUntilNotice > 0).length,
    due90: renewals.filter((r) => r.daysUntilNotice <= 90 && r.daysUntilNotice > 30).length,
    overdue: renewals.filter((r) => r.daysUntilNotice < 0).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Renewal Radar</h1>
        <p className="text-gray-600 mt-1">Track and manage upcoming contract renewals</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Renewals</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Due in 30 Days</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.due30}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Due in 90 Days</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{stats.due90}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.overdue}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            {['all', 'DUE_30_DAYS', 'DUE_60_DAYS', 'DUE_90_DAYS', 'DUE_180_DAYS'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Renewals List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading renewals...</p>
            </CardContent>
          </Card>
        ) : filteredRenewals.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No renewals found</p>
            </CardContent>
          </Card>
        ) : (
          filteredRenewals.map((renewal) => (
            <Card key={renewal.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Link
                        to={`/contracts/${renewal.contract.id}`}
                        className="font-semibold text-lg hover:text-blue-600"
                      >
                        {renewal.contract.title}
                      </Link>
                      <span className={`px-2 py-1 text-xs font-bold rounded ${getStatusColor(renewal.status)}`}>
                        {renewal.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-600">Contract Number</p>
                        <p className="font-medium">{renewal.contract.contractNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Counterparty</p>
                        <p className="font-medium">{renewal.contract.counterpartyName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Value</p>
                        <p className="font-medium">£{renewal.contract.value.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Performance Score</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                (renewal.performanceScore || 0) >= 80
                                  ? 'bg-green-600'
                                  : (renewal.performanceScore || 0) >= 60
                                  ? 'bg-yellow-600'
                                  : 'bg-red-600'
                              }`}
                              style={{ width: `${renewal.performanceScore}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold">{renewal.performanceScore}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-gray-600">Renewal Date: </span>
                        <strong>{new Date(renewal.renewalDate).toLocaleDateString()}</strong>
                        <span className="text-gray-500 ml-2">
                          ({renewal.daysUntilRenewal} days)
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Notice By: </span>
                        <strong>{new Date(renewal.noticeByDate).toLocaleDateString()}</strong>
                        <span className="text-gray-500 ml-2">
                          ({renewal.daysUntilNotice} days)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedRenewal(renewal);
                        setShowDecisionModal(true);
                      }}
                    >
                      Make Decision
                    </Button>
                    <Link to={`/contracts/${renewal.contract.id}`}>
                      <Button size="sm" variant="outline" className="w-full">
                        View Contract
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Decision Modal */}
      {showDecisionModal && selectedRenewal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Renewal Decision</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold mb-2">{selectedRenewal.contract.title}</p>
                  <p className="text-sm text-gray-600">
                    Performance Score: <strong>{selectedRenewal.performanceScore}%</strong>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Decision Notes</label>
                  <textarea className="w-full px-3 py-2 border rounded-lg" rows={3}></textarea>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleDecision(selectedRenewal.id, 'TERMINATE')}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Terminate
                  </Button>
                  <Button onClick={() => handleDecision(selectedRenewal.id, 'RENEW')}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Renew
                  </Button>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowDecisionModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
