import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, AlertTriangle, DollarSign, FileText, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

type ObligationStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'AT_RISK';
type ObligationType = 'PAYMENT' | 'DELIVERY' | 'SLA' | 'AUDIT' | 'NOTICE' | 'REPORTING' | 'COMPLIANCE_CHECK';

interface Obligation {
  id: string;
  contractId: string;
  contract: {
    contractNumber: string;
    title: string;
    counterpartyName: string;
  };
  type: ObligationType;
  title: string;
  description: string;
  status: ObligationStatus;
  dueDate: string;
  owner: { name: string };
  ownerTeam: string;
  amount?: number;
  currency?: string;
  kpiMetric?: string;
  kpiTarget?: number;
  kpiActual?: number;
}

export default function ObligationsBoard() {
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  useEffect(() => {
    fetchObligations();
  }, []);

  const fetchObligations = async () => {
    setLoading(true);
    // Mock data
    setTimeout(() => {
      setObligations([
        {
          id: '1',
          contractId: '1',
          contract: {
            contractNumber: 'CON-2025-00001',
            title: 'Senior Software Engineer',
            counterpartyName: 'John Smith',
          },
          type: 'PAYMENT',
          title: 'Monthly Salary Payment',
          description: 'Salary payment for February 2025',
          status: 'PENDING',
          dueDate: '2025-02-28',
          owner: { name: 'Payroll Team' },
          ownerTeam: 'FINANCE',
          amount: 7083.33,
          currency: 'GBP',
        },
        {
          id: '2',
          contractId: '2',
          contract: {
            contractNumber: 'CON-2025-00002',
            title: 'Cloud Infrastructure',
            counterpartyName: 'AWS Corporation',
          },
          type: 'SLA',
          title: 'Uptime SLA Monitoring',
          description: '99.9% uptime requirement',
          status: 'IN_PROGRESS',
          dueDate: '2025-02-01',
          owner: { name: 'IT Operations' },
          ownerTeam: 'IT',
          kpiMetric: 'Uptime %',
          kpiTarget: 99.9,
          kpiActual: 99.95,
        },
        {
          id: '3',
          contractId: '5',
          contract: {
            contractNumber: 'CON-2025-00005',
            title: 'Office Lease',
            counterpartyName: 'Property Management',
          },
          type: 'PAYMENT',
          title: 'Quarterly Rent Payment',
          description: 'Q1 2025 office rent',
          status: 'OVERDUE',
          dueDate: '2025-01-10',
          owner: { name: 'Finance Director' },
          ownerTeam: 'FINANCE',
          amount: 120000,
          currency: 'GBP',
        },
        {
          id: '4',
          contractId: '3',
          contract: {
            contractNumber: 'CON-2025-00003',
            title: 'Software Licensing',
            counterpartyName: 'TechCorp Ltd',
          },
          type: 'COMPLIANCE_CHECK',
          title: 'Annual Security Audit',
          description: 'Required security compliance audit',
          status: 'AT_RISK',
          dueDate: '2025-02-15',
          owner: { name: 'CISO' },
          ownerTeam: 'IT',
        },
        {
          id: '5',
          contractId: '1',
          contract: {
            contractNumber: 'CON-2025-00001',
            title: 'Senior Software Engineer',
            counterpartyName: 'John Smith',
          },
          type: 'COMPLIANCE_CHECK',
          title: 'Probation Review',
          description: '3-month probation period review',
          status: 'PENDING',
          dueDate: '2025-05-01',
          owner: { name: 'HR Manager' },
          ownerTeam: 'HR',
        },
      ]);
      setLoading(false);
    }, 500);
  };

  const handleComplete = async (obligationId: string) => {
    toast.success('Obligation marked as complete');
    fetchObligations();
  };

  const getStatusColor = (status: ObligationStatus) => {
    const colors = {
      PENDING: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      OVERDUE: 'bg-red-100 text-red-800',
      AT_RISK: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: ObligationType) => {
    const icons = {
      PAYMENT: <DollarSign className="h-4 w-4" />,
      SLA: <Clock className="h-4 w-4" />,
      AUDIT: <FileText className="h-4 w-4" />,
      COMPLIANCE_CHECK: <CheckCircle className="h-4 w-4" />,
    };
    return icons[type] || <FileText className="h-4 w-4" />;
  };

  const filteredObligations = obligations.filter((obl) => {
    const matchesStatus = filterStatus === 'all' || obl.status === filterStatus;
    const matchesType = filterType === 'all' || obl.type === filterType;
    return matchesStatus && matchesType;
  });

  const stats = {
    total: obligations.length,
    pending: obligations.filter((o) => o.status === 'PENDING').length,
    inProgress: obligations.filter((o) => o.status === 'IN_PROGRESS').length,
    overdue: obligations.filter((o) => o.status === 'OVERDUE').length,
    atRisk: obligations.filter((o) => o.status === 'AT_RISK').length,
  };

  const kanbanColumns = {
    PENDING: filteredObligations.filter((o) => o.status === 'PENDING'),
    IN_PROGRESS: filteredObligations.filter((o) => o.status === 'IN_PROGRESS'),
    AT_RISK: filteredObligations.filter((o) => o.status === 'AT_RISK'),
    OVERDUE: filteredObligations.filter((o) => o.status === 'OVERDUE'),
    COMPLETED: filteredObligations.filter((o) => o.status === 'COMPLETED'),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Obligations Board</h1>
          <p className="text-gray-600 mt-1">Track and manage contract obligations and deliverables</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'outline'}
            onClick={() => setViewMode('kanban')}
          >
            Kanban
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.inProgress}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">At Risk</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{stats.atRisk}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
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
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="all">All Types</option>
              <option value="PAYMENT">Payment</option>
              <option value="SLA">SLA</option>
              <option value="AUDIT">Audit</option>
              <option value="COMPLIANCE_CHECK">Compliance Check</option>
              <option value="REPORTING">Reporting</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Kanban View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(kanbanColumns).map(([status, obls]) => (
            <Card key={status}>
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>{status.replace(/_/g, ' ')}</span>
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs">{obls.length}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {obls.map((obl) => (
                    <div key={obl.id} className="border rounded-lg p-3 bg-white">
                      <div className="flex items-start gap-2 mb-2">
                        {getTypeIcon(obl.type)}
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{obl.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{obl.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                        <span>{new Date(obl.dueDate).toLocaleDateString()}</span>
                        {obl.amount && <span className="font-semibold">£{obl.amount.toLocaleString()}</span>}
                      </div>
                      <Link
                        to={`/contracts/${obl.contractId}`}
                        className="text-xs text-blue-600 hover:underline mt-2 block"
                      >
                        {obl.contract.contractNumber}
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredObligations.map((obl) => (
            <Card key={obl.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-bold rounded ${getStatusColor(obl.status)}`}>
                        {getTypeIcon(obl.type)}
                        {obl.type}
                      </span>
                      <span className={`px-2 py-1 text-xs font-bold rounded ${getStatusColor(obl.status)}`}>
                        {obl.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{obl.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{obl.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>Due: <strong>{new Date(obl.dueDate).toLocaleDateString()}</strong></span>
                      <span>Owner: <strong>{obl.owner.name}</strong></span>
                      {obl.amount && <span>Amount: <strong>£{obl.amount.toLocaleString()}</strong></span>}
                    </div>
                    <Link
                      to={`/contracts/${obl.contractId}`}
                      className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                    >
                      {obl.contract.contractNumber} - {obl.contract.title}
                    </Link>
                  </div>
                  <Button size="sm" onClick={() => handleComplete(obl.id)}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
