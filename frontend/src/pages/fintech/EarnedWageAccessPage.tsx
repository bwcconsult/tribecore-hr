import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { axiosInstance } from '../../lib/axios';
import { toast } from 'react-hot-toast';

export default function EarnedWageAccessPage() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<any>(null);
  const [earnedAmount, setEarnedAmount] = useState(0);
  const [maxAvailable, setMaxAvailable] = useState(0);
  const [requestAmount, setRequestAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [feePercentage, setFeePercentage] = useState(2.5);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const employeeId = 'emp-123'; // Replace with actual user ID

      const [walletRes, requestsRes] = await Promise.all([
        axiosInstance.get(`/api/v1/fintech/wallets/employee/${employeeId}`),
        axiosInstance.get(`/api/v1/fintech/ewa/employee/${employeeId}/requests`),
      ]);

      setWallet(walletRes.data);
      setRequests(requestsRes.data);

      // Mock earned wages calculation - in production this comes from backend
      setEarnedAmount(1250);
      setMaxAvailable(625); // 50% of earned wages
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!requestAmount || Number(requestAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (Number(requestAmount) > maxAvailable) {
      toast.error(`Amount cannot exceed £${maxAvailable.toFixed(2)}`);
      return;
    }

    try {
      setSubmitting(true);
      await axiosInstance.post('/api/v1/fintech/ewa/requests', {
        employeeId: 'emp-123',
        organizationId: 'org-123',
        requestedAmount: Number(requestAmount),
        reason,
        repaymentMethod: 'NEXT_PAYROLL',
      });

      toast.success('EWA request submitted successfully!');
      setRequestAmount('');
      setReason('');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateFee = () => {
    if (!requestAmount) return 0;
    return (Number(requestAmount) * feePercentage) / 100;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any }> = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      APPROVED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
      DISBURSED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle },
      REPAID: { color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
    };

    const badge = badges[status] || { color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    const Icon = badge.icon;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/fintech/wallet')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Earned Wage Access</h1>
          <p className="text-gray-600">Access your earned wages before payday</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <p className="font-medium text-blue-900">How it works</p>
          <p className="text-sm text-blue-700 mt-1">
            You can access up to 50% of your earned wages at any time. A small fee of {feePercentage}% applies, and the
            amount will be automatically deducted from your next paycheck.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Request Access</h2>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Earned So Far</p>
                <p className="text-2xl font-bold text-gray-900">£{earnedAmount.toFixed(2)}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Available to Access</p>
                <p className="text-2xl font-bold text-gray-900">£{maxAvailable.toFixed(2)}</p>
              </div>
            </div>

            {/* Amount Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount to Access
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                <input
                  type="number"
                  value={requestAmount}
                  onChange={(e) => setRequestAmount(e.target.value)}
                  placeholder="0.00"
                  max={maxAvailable}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Maximum: £{maxAvailable.toFixed(2)}</p>
            </div>

            {/* Reason */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Unexpected expense, Emergency"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Fee Breakdown */}
            {requestAmount && Number(requestAmount) > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Requested Amount</span>
                  <span className="font-medium">£{Number(requestAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Processing Fee ({feePercentage}%)</span>
                  <span className="font-medium">£{calculateFee().toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="font-semibold text-gray-900">You'll Receive</span>
                  <span className="font-bold text-green-600">
                    £{(Number(requestAmount) - calculateFee()).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">To be repaid from next paycheck</span>
                  <span className="font-medium text-red-600">
                    £{Number(requestAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmitRequest}
              disabled={submitting || !requestAmount || Number(requestAmount) <= 0}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold transition"
            >
              {submitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5" />
                  Request Access
                </>
              )}
            </button>
          </div>
        </div>

        {/* Request History */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Request History</h2>
          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No requests yet</p>
              </div>
            ) : (
              requests.slice(0, 5).map((req) => (
                <div key={req.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-gray-900">
                      £{Number(req.requestedAmount).toFixed(2)}
                    </span>
                    {getStatusBadge(req.status)}
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(req.requestDate).toLocaleDateString('en-GB')}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
