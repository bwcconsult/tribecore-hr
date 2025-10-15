import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText,
  Edit,
  Send,
  Check,
  X,
  Clock,
  AlertTriangle,
  Download,
  Eye,
  Users,
  CheckCircle,
  RefreshCw,
  Calendar,
  DollarSign,
  Building2,
  FileSignature,
  PlayCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

type ContractStatus =
  | 'DRAFT'
  | 'INTERNAL_REVIEW'
  | 'COUNTERPARTY_REVIEW'
  | 'AGREED'
  | 'E_SIGNATURE'
  | 'EXECUTED'
  | 'ACTIVE';

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  type: string;
  status: ContractStatus;
  counterpartyName: string;
  counterpartyEmail: string;
  value: number;
  currency: string;
  startDate: string;
  endDate: string;
  owner: { id: string; name: string };
  jurisdiction: string;
  dataCategories: string[];
  requiresDPIA: boolean;
  riskScore: number;
  createdAt: string;
  description: string;
}

interface Approval {
  id: string;
  role: string;
  approver: { name: string };
  status: string;
  decidedAt?: string;
  comment?: string;
}

interface Obligation {
  id: string;
  type: string;
  title: string;
  dueDate: string;
  status: string;
  owner: { name: string };
  amount?: number;
}

export default function ContractDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState<Contract | null>(null);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);

  useEffect(() => {
    fetchContract();
    fetchApprovals();
    fetchObligations();
  }, [id]);

  const fetchContract = async () => {
    setLoading(true);
    // Mock data
    setTimeout(() => {
      setContract({
        id: id!,
        contractNumber: 'CON-2025-00001',
        title: 'Senior Software Engineer Employment Contract',
        type: 'EMPLOYMENT',
        status: 'INTERNAL_REVIEW',
        counterpartyName: 'John Smith',
        counterpartyEmail: 'john.smith@example.com',
        value: 85000,
        currency: 'GBP',
        startDate: '2025-02-01',
        endDate: '2026-02-01',
        owner: { id: '1', name: 'HR Team' },
        jurisdiction: 'UK',
        dataCategories: ['PII'],
        requiresDPIA: true,
        riskScore: 3,
        description: 'Full-time employment contract for Senior Software Engineer position',
        createdAt: '2025-01-10',
      });
      setLoading(false);
    }, 500);
  };

  const fetchApprovals = async () => {
    setTimeout(() => {
      setApprovals([
        {
          id: '1',
          role: 'LEGAL',
          approver: { name: 'Sarah Johnson (Legal)' },
          status: 'APPROVED',
          decidedAt: '2025-01-11',
          comment: 'Approved - standard terms',
        },
        {
          id: '2',
          role: 'HR',
          approver: { name: 'Mike Brown (HR Manager)' },
          status: 'PENDING',
        },
        {
          id: '3',
          role: 'FINANCE',
          approver: { name: 'Emily Davis (CFO)' },
          status: 'PENDING',
        },
      ]);
    }, 300);
  };

  const fetchObligations = async () => {
    setTimeout(() => {
      setObligations([
        {
          id: '1',
          type: 'PAYMENT',
          title: 'Monthly Salary Payment',
          dueDate: '2025-02-28',
          status: 'PENDING',
          owner: { name: 'Payroll Team' },
          amount: 7083.33,
        },
        {
          id: '2',
          type: 'COMPLIANCE_CHECK',
          title: 'Probation Review',
          dueDate: '2025-05-01',
          status: 'PENDING',
          owner: { name: 'HR Manager' },
        },
      ]);
    }, 300);
  };

  const handleSubmitForReview = async () => {
    toast.success('Contract submitted for internal review');
    fetchContract();
  };

  const handleSendForCounterparty = async () => {
    toast.success('Contract sent to counterparty for review');
    fetchContract();
  };

  const handleMarkAsAgreed = async () => {
    toast.success('Contract marked as agreed');
    fetchContract();
  };

  const handleLaunchSignature = async () => {
    toast.success('E-signature process initiated');
    fetchContract();
  };

  const handleActivate = async () => {
    toast.success('Contract activated - obligations and renewal tracking started');
    fetchContract();
  };

  const handleApprove = async (approvalId: string) => {
    toast.success('Approval recorded');
    fetchApprovals();
    setShowApprovalModal(false);
  };

  const handleReject = async (approvalId: string) => {
    toast.error('Contract rejected');
    fetchApprovals();
    setShowApprovalModal(false);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      INTERNAL_REVIEW: 'bg-blue-100 text-blue-800',
      COUNTERPARTY_REVIEW: 'bg-purple-100 text-purple-800',
      AGREED: 'bg-cyan-100 text-cyan-800',
      E_SIGNATURE: 'bg-yellow-100 text-yellow-800',
      EXECUTED: 'bg-green-100 text-green-800',
      ACTIVE: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading || !contract) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{contract.title}</h1>
            <span
              className={`px-3 py-1 text-sm font-bold rounded ${getStatusColor(contract.status)}`}
            >
              {contract.status.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-gray-600">{contract.contractNumber}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={() => navigate(`/contracts/${id}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Workflow Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Workflow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {contract.status === 'DRAFT' && (
              <Button onClick={handleSubmitForReview}>
                <Send className="h-4 w-4 mr-2" />
                Submit for Review
              </Button>
            )}
            {contract.status === 'INTERNAL_REVIEW' && (
              <Button onClick={handleSendForCounterparty}>
                <Users className="h-4 w-4 mr-2" />
                Send to Counterparty
              </Button>
            )}
            {contract.status === 'COUNTERPARTY_REVIEW' && (
              <Button onClick={handleMarkAsAgreed}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Agreed
              </Button>
            )}
            {contract.status === 'AGREED' && (
              <Button onClick={handleLaunchSignature}>
                <FileSignature className="h-4 w-4 mr-2" />
                Launch E-Signature
              </Button>
            )}
            {contract.status === 'EXECUTED' && (
              <Button onClick={handleActivate}>
                <PlayCircle className="h-4 w-4 mr-2" />
                Activate Contract
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex gap-4">
          {['details', 'approvals', 'obligations', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'details' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Contract Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Type</label>
                <p className="text-gray-900">{contract.type}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-gray-900">{contract.description}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Counterparty</label>
                <p className="text-gray-900">{contract.counterpartyName}</p>
                <p className="text-sm text-gray-600">{contract.counterpartyEmail}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Value</label>
                  <p className="text-gray-900 font-semibold">
                    £{contract.value.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Currency</label>
                  <p className="text-gray-900">{contract.currency}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Start Date</label>
                  <p className="text-gray-900">
                    {new Date(contract.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">End Date</label>
                  <p className="text-gray-900">
                    {new Date(contract.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compliance & Risk</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Jurisdiction</label>
                <p className="text-gray-900">{contract.jurisdiction}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Data Categories</label>
                <div className="flex gap-2 mt-1">
                  {contract.dataCategories.map((cat) => (
                    <span
                      key={cat}
                      className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Risk Score</label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        contract.riskScore < 3
                          ? 'bg-green-600'
                          : contract.riskScore < 7
                          ? 'bg-yellow-600'
                          : 'bg-red-600'
                      }`}
                      style={{ width: `${contract.riskScore * 10}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{contract.riskScore}/10</span>
                </div>
              </div>
              {contract.requiresDPIA && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    <AlertTriangle className="h-4 w-4 inline mr-1" />
                    Data Protection Impact Assessment (DPIA) Required
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'approvals' && (
        <Card>
          <CardHeader>
            <CardTitle>Approval Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {approvals.map((approval, index) => (
                <div key={approval.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold">Step {index + 1}</span>
                        <span className="text-gray-600">{approval.role}</span>
                        <span
                          className={`px-2 py-1 text-xs font-bold rounded ${getStatusColor(approval.status)}`}
                        >
                          {approval.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{approval.approver.name}</p>
                      {approval.comment && (
                        <p className="text-sm text-gray-600 italic">"{approval.comment}"</p>
                      )}
                      {approval.decidedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Decided: {new Date(approval.decidedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    {approval.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedApproval(approval);
                            setShowApprovalModal(true);
                          }}
                        >
                          Review
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'obligations' && (
        <Card>
          <CardHeader>
            <CardTitle>Contract Obligations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {obligations.map((obligation) => (
                <div key={obligation.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold">{obligation.title}</span>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {obligation.type}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-bold rounded ${getStatusColor(obligation.status)}`}
                        >
                          {obligation.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>
                          Due: <strong>{new Date(obligation.dueDate).toLocaleDateString()}</strong>
                        </span>
                        <span>
                          Owner: <strong>{obligation.owner.name}</strong>
                        </span>
                        {obligation.amount && (
                          <span>
                            Amount: <strong>£{obligation.amount.toLocaleString()}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Mark Complete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                <Clock className="h-4 w-4 text-gray-600 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Contract created</p>
                  <p className="text-xs text-gray-600">by {contract.owner.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(contract.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Approval Decision</CardTitle>
                <button onClick={() => setShowApprovalModal(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Comments</label>
                  <textarea className="w-full px-3 py-2 border rounded-lg" rows={4}></textarea>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={() => handleReject(selectedApproval.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button className="flex-1" onClick={() => handleApprove(selectedApproval.id)}>
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
