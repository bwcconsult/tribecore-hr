import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  Plane,
  Receipt,
  CreditCard,
  AlertCircle,
  Users,
  BarChart3,
  FileText,
  Calendar,
  ArrowRight,
  Info,
} from 'lucide-react';
import axios from 'axios';

interface DashboardStats {
  totalExpenses: number;
  advances: number;
  reimbursements: number;
  totalTrips: number;
}

interface PendingItems {
  pendingTrips: {
    count: number;
    items: any[];
  };
  pendingReports: {
    forApproval: number;
    forReimbursement: number;
    approvalItems: any[];
    reimbursementItems: any[];
  };
  unreportedAdvances: {
    count: number;
    totalAmount: number;
    items: any[];
  };
}

interface CorpCardSummary {
  activeCards: number;
  unassignedCards: number;
  pendingSubmission: number;
  unapproved: number;
}

export default function ExpensesAdminDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fiscalYear, setFiscalYear] = useState('This Year');
  const [stats, setStats] = useState<DashboardStats>({
    totalExpenses: 0,
    advances: 0,
    reimbursements: 0,
    totalTrips: 0,
  });
  const [spendData, setSpendData] = useState<any[]>([]);
  const [pendingItems, setPendingItems] = useState<PendingItems | null>(null);
  const [corpCardSummary, setCorpCardSummary] = useState<CorpCardSummary | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, spendRes, pendingRes, cardsRes] = await Promise.all([
        axios.get('/api/expenses/admin/dashboard/summary'),
        axios.get('/api/expenses/admin/dashboard/spend-summary'),
        axios.get('/api/expenses/admin/dashboard/pending-items'),
        axios.get('/api/expenses/admin/dashboard/corporate-cards'),
      ]);

      setStats(summaryRes.data);
      setSpendData(spendRes.data);
      setPendingItems(pendingRes.data);
      setCorpCardSummary(cardsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex gap-4 mt-2">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 border-b-2 border-indigo-600">
              Dashboard
            </button>
            <button
              onClick={() => navigate('/expenses/admin/getting-started')}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Getting Started
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
              Announcements
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
              Recent Updates
            </button>
          </div>
        </div>
      </div>

      {/* Setup Assistance Banner */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <Info className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">2 hours of FREE Rapid Setup Assistance!</h3>
            <p className="text-sm text-gray-600">Our product consultants will help you configure Zoho Expense based on your requirements.</p>
          </div>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          Contact Support
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Spend Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">SPEND SUMMARY</h2>
            <select
              value={fiscalYear}
              onChange={(e) => setFiscalYear(e.target.value)}
              className="text-sm border border-gray-300 rounded px-3 py-1"
            >
              <option>This Year</option>
              <option>Last Year</option>
              <option>This Quarter</option>
            </select>
          </div>
          <div className="text-sm text-gray-600 mb-6">FISCAL YEAR: 2025 - 2026</div>
          
          {/* Chart Placeholder */}
          <div className="h-48 flex items-center justify-center border border-gray-200 rounded bg-gray-50">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No data</p>
            </div>
          </div>

          {/* Month Labels */}
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            {['APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC', 'JAN', 'FEB', 'MAR'].map((month) => (
              <span key={month}>{month}</span>
            ))}
          </div>
        </div>

        {/* Overall Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">OVERALL SUMMARY</h2>
            <select
              value={fiscalYear}
              onChange={(e) => setFiscalYear(e.target.value)}
              className="text-sm border border-gray-300 rounded px-3 py-1"
            >
              <option>This Year</option>
              <option>Last Year</option>
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Expenses</div>
                  <div className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalExpenses)}</div>
                </div>
              </div>
              <Info className="w-4 h-4 text-gray-400" />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Advances</div>
                  <div className="text-xl font-bold text-gray-900">{formatCurrency(stats.advances)}</div>
                </div>
              </div>
              <Info className="w-4 h-4 text-gray-400" />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Reimbursements</div>
                  <div className="text-xl font-bold text-gray-900">{formatCurrency(stats.reimbursements)}</div>
                </div>
              </div>
              <Info className="w-4 h-4 text-gray-400" />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center">
                  <Plane className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Trips</div>
                  <div className="text-xl font-bold text-gray-900">{stats.totalTrips}</div>
                </div>
              </div>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Items Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Trips */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Plane className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">PENDING TRIPS</h3>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">APPROVER</div>
            <div className="text-sm text-gray-600">COUNT</div>
          </div>

          {pendingItems && pendingItems.pendingTrips.count > 0 ? (
            <div className="space-y-2">
              {pendingItems.pendingTrips.items.slice(0, 3).map((trip) => (
                <div key={trip.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <span className="text-sm text-gray-700">{trip.employee?.name || 'Unknown'}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">1</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">No pending trips</div>
          )}
        </div>

        {/* Pending Reports */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">PENDING REPORTS</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                For Approval ({pendingItems?.pendingReports.forApproval || 0})
              </span>
              <span className="text-sm text-gray-600">COUNT</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                For Reimbursement ({pendingItems?.pendingReports.forReimbursement || 0})
              </span>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">APPROVER</div>
              <div className="text-sm text-gray-600">COUNT</div>
            </div>
            {pendingItems && pendingItems.pendingReports.forApproval > 0 ? (
              <div className="text-center py-4 text-gray-500 text-sm">No pending reports</div>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">No pending reports</div>
            )}
          </div>
        </div>

        {/* Unreported Advances */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">UNREPORTED ADVANCES</h3>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">USER NAME</div>
            <div className="text-sm text-gray-600">AMOUNT</div>
          </div>

          {pendingItems && pendingItems.unreportedAdvances.count > 0 ? (
            <div className="space-y-2">
              {pendingItems.unreportedAdvances.items.slice(0, 3).map((advance) => (
                <div key={advance.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <span className="text-sm text-gray-700">{advance.employee?.name || 'Unknown'}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(advance.amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">No pending advances</div>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Corporate Card Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">CORPORATE CARD SUMMARY</h3>
          </div>

          {corpCardSummary ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Cards</span>
                <span className="text-lg font-bold text-gray-900">{corpCardSummary.activeCards}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Unassigned Cards</span>
                <span className="text-lg font-bold text-gray-900">{corpCardSummary.unassignedCards}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Submission</span>
                <span className="text-lg font-bold text-gray-900">{corpCardSummary.pendingSubmission}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Unapproved</span>
                <span className="text-lg font-bold text-gray-900">{corpCardSummary.unapproved}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">No data available</div>
          )}
        </div>

        {/* Expenses by Category */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">EXPENSES BY CATEGORY</h3>
            <select className="text-sm border border-gray-300 rounded px-3 py-1">
              <option>This Month</option>
              <option>Last Month</option>
            </select>
          </div>
          
          <div className="text-center py-12 text-gray-500 text-sm">No matching expense found</div>
        </div>

        {/* Expenses by Project */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">EXPENSES BY PROJECT</h3>
            <select className="text-sm border border-gray-300 rounded px-3 py-1">
              <option>This Month</option>
              <option>Last Month</option>
            </select>
          </div>
          
          <div className="text-center py-12 text-gray-500 text-sm">No matching expense found</div>
        </div>
      </div>

      {/* Policy Violations & Users Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">TOP POLICY VIOLATIONS</h3>
            <select className="text-sm border border-gray-300 rounded px-3 py-1">
              <option>This Month</option>
            </select>
          </div>
          <div className="text-center py-12 text-gray-500 text-sm">No matching expense found</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">TOP SPENDING USERS</h3>
            <select className="text-sm border border-gray-300 rounded px-3 py-1">
              <option>This Month</option>
            </select>
          </div>
          <div className="text-center py-12 text-gray-500 text-sm">No matching user found</div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">TOP VIOLATORS</h3>
            <select className="text-sm border border-gray-300 rounded px-3 py-1">
              <option>This Month</option>
            </select>
          </div>
          <div className="text-center py-12 text-gray-500 text-sm">No matching user found</div>
        </div>
      </div>
    </div>
  );
}
