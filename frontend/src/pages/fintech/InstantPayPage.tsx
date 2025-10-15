import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Clock,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader,
  TrendingUp,
} from 'lucide-react';
import { axiosInstance } from '../../lib/axios';
import { toast } from 'react-hot-toast';

export default function InstantPayPage() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [payType, setPayType] = useState<'INSTANT' | 'SAME_DAY' | 'NEXT_DAY'>('INSTANT');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);

  const payTypeOptions = [
    {
      value: 'INSTANT',
      label: 'Instant',
      time: '5-15 minutes',
      fee: 1.5,
      icon: Zap,
      color: 'from-blue-500 to-indigo-600',
    },
    {
      value: 'SAME_DAY',
      label: 'Same Day',
      time: 'Within 6 hours',
      fee: 0.75,
      icon: Clock,
      color: 'from-green-500 to-emerald-600',
    },
    {
      value: 'NEXT_DAY',
      label: 'Next Day',
      time: '24 hours',
      fee: 0.25,
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-600',
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const employeeId = 'emp-123';

      const [walletRes, requestsRes] = await Promise.all([
        axiosInstance.get(`/api/v1/fintech/wallets/employee/${employeeId}`),
        axiosInstance.get(`/api/v1/fintech/instant-pay/employee/${employeeId}/requests`),
      ]);

      setWallet(walletRes.data);
      setRequests(requestsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (Number(amount) > Number(wallet?.availableBalance)) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      setSubmitting(true);
      await axiosInstance.post('/api/v1/fintech/instant-pay/requests', {
        employeeId: 'emp-123',
        organizationId: 'org-123',
        requestedAmount: Number(amount),
        payType,
        currency: wallet.currency,
      });

      toast.success('Payment initiated successfully!');
      setAmount('');
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to process payment');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateFee = () => {
    if (!amount) return 0;
    const option = payTypeOptions.find((opt) => opt.value === payType);
    return (Number(amount) * (option?.fee || 0)) / 100;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      PENDING: Clock,
      PROCESSING: Loader,
      COMPLETED: CheckCircle,
      FAILED: AlertCircle,
    };
    return icons[status] || AlertCircle;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'text-yellow-600 bg-yellow-50',
      PROCESSING: 'text-blue-600 bg-blue-50',
      COMPLETED: 'text-green-600 bg-green-50',
      FAILED: 'text-red-600 bg-red-50',
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
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
          <h1 className="text-3xl font-bold text-gray-900">Instant Pay</h1>
          <p className="text-gray-600">Transfer funds to your bank account</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Available Balance */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
            <p className="text-blue-100 text-sm mb-2">Available Balance</p>
            <p className="text-4xl font-bold mb-4">
              £{Number(wallet?.availableBalance || 0).toFixed(2)}
            </p>
            <p className="text-blue-100 text-sm">
              Wallet: {wallet?.walletNumber}
            </p>
          </div>

          {/* Payment Speed Selection */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Select Payment Speed</h2>
            <div className="grid grid-cols-3 gap-4">
              {payTypeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = payType === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setPayType(option.value as any)}
                    className={`relative p-4 border-2 rounded-xl transition ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                    <div className={`bg-gradient-to-br ${option.color} p-3 rounded-lg w-fit mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="font-semibold text-gray-900 mb-1">{option.label}</p>
                    <p className="text-xs text-gray-600 mb-2">{option.time}</p>
                    <p className="text-sm font-bold text-gray-900">{option.fee}% fee</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount Input */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Transfer Amount</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  max={wallet?.availableBalance}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Available: £{Number(wallet?.availableBalance || 0).toFixed(2)}
              </p>
            </div>

            {/* Fee Summary */}
            {amount && Number(amount) > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Transfer Amount</span>
                  <span className="font-medium">£{Number(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Speed Fee</span>
                  <span className="font-medium">£{calculateFee().toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between">
                  <span className="font-semibold text-gray-900">Total Cost</span>
                  <span className="font-bold text-red-600">
                    £{(Number(amount) + calculateFee()).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">You'll Receive</span>
                  <span className="text-sm font-semibold text-green-600">
                    £{Number(amount).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting || !amount || Number(amount) <= 0}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold transition"
            >
              {submitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Initiate Transfer
                </>
              )}
            </button>
          </div>
        </div>

        {/* Recent Transfers */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Transfers</h2>
          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="text-center py-8">
                <Zap className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No transfers yet</p>
              </div>
            ) : (
              requests.slice(0, 8).map((req) => {
                const StatusIcon = getStatusIcon(req.status);
                return (
                  <div key={req.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          £{Number(req.requestedAmount).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">{req.payType}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(req.status)}`}>
                        <StatusIcon className="w-3 h-3" />
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(req.requestedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
