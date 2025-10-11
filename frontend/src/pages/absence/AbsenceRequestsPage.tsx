import { useState, useEffect } from 'react';
import { Calendar, Plus, Check, X, Clock, AlertCircle } from 'lucide-react';
import { absenceService, AbsenceRequest, AbsencePlan, AbsenceBalance } from '../../services/absence.service';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function AbsenceRequestsPage() {
  const [requests, setRequests] = useState<AbsenceRequest[]>([]);
  const [balances, setBalances] = useState<AbsenceBalance[]>([]);
  const [plans, setPlans] = useState<AbsencePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [requestsData, balancesData, plansData] = await Promise.all([
        absenceService.getRequests({ status: 'PENDING,APPROVED' }),
        absenceService.getMyBalances(),
        absenceService.getPlans(),
      ]);
      setRequests(requestsData);
      setBalances(balancesData);
      setPlans(plansData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load absence data');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this request?')) return;

    try {
      await absenceService.cancelRequest(id);
      toast.success('Request cancelled successfully!');
      loadData();
    } catch (error) {
      toast.error('Failed to cancel request');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPlanColor = (planType: string) => {
    const colors: Record<string, string> = {
      HOLIDAY: 'bg-green-500',
      BIRTHDAY: 'bg-purple-500',
      LEVEL_UP_DAYS: 'bg-teal-500',
      SICKNESS: 'bg-red-500',
      OTHER: 'bg-blue-500',
    };
    return colors[planType] || 'bg-gray-500';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Absence Requests
          </h1>
          <p className="text-gray-600">Manage your time off requests and view balances</p>
        </div>
        <button
          onClick={() => setShowRequestModal(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Request Absence
        </button>
      </div>

      {/* Balances Overview */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Balances</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {balances.map((balance) => (
            <div key={balance.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-3 h-3 rounded-full ${getPlanColor(balance.plan?.type || '')}`} />
                <h3 className="font-medium text-gray-900">{balance.plan?.name}</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Entitlement:</span>
                  <span className="font-medium text-gray-900">{balance.entitlementDays} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taken:</span>
                  <span className="font-medium text-gray-900">{balance.takenDays} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pending:</span>
                  <span className="font-medium text-gray-900">{balance.pendingDays} days</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-medium text-green-600">{balance.remainingDays} days</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Requests</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading requests...</div>
          ) : requests.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
              <p className="text-gray-600">You haven't made any absence requests yet</p>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-3 h-3 rounded-full ${getPlanColor(request.plan?.type || '')}`} />
                      <h3 className="font-medium text-gray-900">{request.plan?.name}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span>
                        {format(new Date(request.startDate), 'MMM d, yyyy')} -{' '}
                        {format(new Date(request.endDate), 'MMM d, yyyy')}
                      </span>
                      <span className="font-medium">{request.calculatedDays} days</span>
                    </div>
                    {request.notes && (
                      <p className="text-sm text-gray-600 italic">{request.notes}</p>
                    )}
                  </div>
                  {request.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancelRequest(request.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <RequestAbsenceModal
          plans={plans}
          balances={balances}
          onClose={() => setShowRequestModal(false)}
          onSuccess={() => {
            setShowRequestModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}

// Request Modal Component
function RequestAbsenceModal({
  plans,
  balances,
  onClose,
  onSuccess,
}: {
  plans: AbsencePlan[];
  balances: AbsenceBalance[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    planId: '',
    startDate: '',
    endDate: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.planId || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      await absenceService.createRequest(formData);
      toast.success('Absence request submitted successfully!');
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedBalance = balances.find((b) => b.planId === formData.planId);

  return (
    <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Request Absence</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Absence Type</label>
            <select
              value={formData.planId}
              onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select a plan...</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          </div>

          {selectedBalance && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">Available:</span>
                <span className="font-medium text-gray-900">
                  {selectedBalance.availableDays} days
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Add any additional information..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
