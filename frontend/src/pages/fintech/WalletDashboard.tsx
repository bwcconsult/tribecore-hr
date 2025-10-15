import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Zap,
  Send,
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';
import { axiosInstance } from '../../lib/axios';

export default function WalletDashboard() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const employeeId = 'emp-123'; // Replace with actual user ID

      const [walletRes, statsRes, transactionsRes] = await Promise.all([
        axiosInstance.get(`/api/v1/fintech/wallets/employee/${employeeId}`),
        axiosInstance.get(`/api/v1/fintech/wallets/${walletRes.data.id}/stats`),
        axiosInstance.get(`/api/v1/fintech/wallets/${walletRes.data.id}/transactions?limit=10`),
      ]);

      setWallet(walletRes.data);
      setStats(statsRes.data);
      setTransactions(transactionsRes.data);
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'text-green-600 bg-green-50',
      SUSPENDED: 'text-red-600 bg-red-50',
      PENDING_VERIFICATION: 'text-yellow-600 bg-yellow-50',
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  const getTransactionIcon = (type: string) => {
    return type === 'CREDIT' ? (
      <ArrowDownCircle className="w-5 h-5 text-green-600" />
    ) : (
      <ArrowUpCircle className="w-5 h-5 text-red-600" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
          <p className="text-gray-600">Manage your earnings and payments</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/fintech/ewa')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <Clock className="w-5 h-5" />
            Access Earnings
          </button>
          <button
            onClick={() => navigate('/fintech/instant-pay')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Zap className="w-5 h-5" />
            Instant Pay
          </button>
        </div>
      </div>

      {/* Wallet Card */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-blue-100 text-sm mb-1">Available Balance</p>
            <div className="flex items-center gap-3">
              <h2 className="text-4xl font-bold">
                {showBalance ? `£${Number(wallet?.availableBalance || 0).toFixed(2)}` : '****'}
              </h2>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                {showBalance ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(wallet?.status)}`}>
            {wallet?.status?.replace('_', ' ')}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <p className="text-blue-100 text-sm mb-1">Wallet Number</p>
            <p className="font-mono font-semibold">{wallet?.walletNumber}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm mb-1">Currency</p>
            <p className="font-semibold">{wallet?.currency}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm mb-1">Wallet Type</p>
            <p className="font-semibold">{wallet?.walletType}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Earned</p>
          <p className="text-2xl font-bold text-gray-900">
            £{Number(stats?.wallet?.totalEarned || 0).toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-50 p-3 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Withdrawn</p>
          <p className="text-2xl font-bold text-gray-900">
            £{Number(stats?.wallet?.totalWithdrawn || 0).toFixed(2)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <ArrowDownCircle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Credits (30d)</p>
          <p className="text-2xl font-bold text-gray-900">
            {stats?.stats?.last30Days?.credits || 0}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-50 p-3 rounded-lg">
              <ArrowUpCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Debits (30d)</p>
          <p className="text-2xl font-bold text-gray-900">
            {stats?.stats?.last30Days?.debits || 0}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => navigate('/fintech/ewa')}
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all text-left group"
        >
          <div className="bg-purple-50 p-3 rounded-lg w-fit mb-4 group-hover:bg-purple-100 transition">
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Earned Wage Access</h3>
          <p className="text-sm text-gray-600">Access your earned wages instantly</p>
        </button>

        <button
          onClick={() => navigate('/fintech/instant-pay')}
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all text-left group"
        >
          <div className="bg-blue-50 p-3 rounded-lg w-fit mb-4 group-hover:bg-blue-100 transition">
            <Zap className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Instant Pay</h3>
          <p className="text-sm text-gray-600">Transfer funds in minutes</p>
        </button>

        <button
          onClick={() => navigate('/fintech/settings')}
          className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all text-left group"
        >
          <div className="bg-gray-50 p-3 rounded-lg w-fit mb-4 group-hover:bg-gray-100 transition">
            <Shield className="w-6 h-6 text-gray-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Wallet Settings</h3>
          <p className="text-sm text-gray-600">Manage limits and security</p>
        </button>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
          <button
            onClick={() => navigate('/fintech/transactions')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </button>
        </div>

        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No transactions yet</p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition"
              >
                <div className="flex items-center gap-4">
                  {getTransactionIcon(tx.type)}
                  <div>
                    <p className="font-medium text-gray-900">{tx.description || tx.category}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${
                      tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {tx.type === 'CREDIT' ? '+' : '-'}£{Number(tx.amount).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">{tx.status}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
