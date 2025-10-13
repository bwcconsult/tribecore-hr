import { useState, useEffect } from 'react';
import { Baby, Heart, Users, Plus, Calendar } from 'lucide-react';
import * as employmentLawService from '../../services/employmentLaw.service';

export default function FamilyLeavePage() {
  const [leaveRecords, setLeaveRecords] = useState<any[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formData, setFormData] = useState({
    organizationId: 'org-1',
    employeeId: '',
    leaveType: 'MATERNITY',
    expectedStartDate: '',
    expectedReturnDate: '',
    dueDate: '',
    totalWeeksEntitled: 52,
    paidWeeks: 39,
    unpaidWeeks: 13,
    isSharedParentalLeave: false,
  });

  useEffect(() => {
    loadLeaveRecords();
  }, []);

  const loadLeaveRecords = async () => {
    try {
      const data = await employmentLawService.getAllFamilyLeave('org-1');
      setLeaveRecords(data);
    } catch (error) {
      console.error('Failed to load family leave records', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await employmentLawService.createFamilyLeave(formData);
      setShowRequestForm(false);
      loadLeaveRecords();
    } catch (error) {
      console.error('Failed to create family leave', error);
    }
  };

  const leaveTypes = [
    { value: 'MATERNITY', label: 'Maternity Leave', weeks: 52, paid: 39, icon: Baby },
    { value: 'PATERNITY', label: 'Paternity Leave', weeks: 2, paid: 2, icon: Users },
    { value: 'ADOPTION', label: 'Adoption Leave', weeks: 52, paid: 39, icon: Heart },
    { value: 'SHARED_PARENTAL', label: 'Shared Parental Leave', weeks: 52, paid: 39, icon: Users },
    { value: 'PARENTAL', label: 'Parental Leave', weeks: 4, paid: 0, icon: Users },
    { value: 'CARER', label: "Carer's Leave", weeks: 1, paid: 0, icon: Heart },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      REQUESTED: 'bg-blue-100 text-blue-700',
      APPROVED: 'bg-green-100 text-green-700',
      IN_PROGRESS: 'bg-purple-100 text-purple-700',
      RETURNED: 'bg-gray-100 text-gray-700',
      EXTENDED: 'bg-yellow-100 text-yellow-700',
      CANCELLED: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Family-Related Leave</h1>
          <p className="text-gray-600 mt-1">Maternity, paternity, adoption & carer's leave</p>
        </div>
        <button
          onClick={() => setShowRequestForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
        >
          <Plus className="w-4 h-4" />
          Request Leave
        </button>
      </div>

      {/* Leave Types Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {leaveTypes.slice(0, 3).map((type) => (
          <div key={type.value} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <type.icon className="w-10 h-10 text-pink-600" />
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{type.weeks}</p>
                <p className="text-sm text-gray-500">weeks total</p>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{type.label}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded">{type.paid} weeks paid</span>
              {type.weeks - type.paid > 0 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">{type.weeks - type.paid} unpaid</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total Requests</p>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{leaveRecords.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Currently On Leave</p>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {leaveRecords.filter(r => r.status === 'IN_PROGRESS').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Approved</p>
            <Baby className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {leaveRecords.filter(r => r.status === 'APPROVED').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Returned</p>
            <Heart className="w-5 h-5 text-pink-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {leaveRecords.filter(r => r.status === 'RETURNED').length}
          </p>
        </div>
      </div>

      {/* Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Request Family Leave</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => {
                    const selectedType = leaveTypes.find(t => t.value === e.target.value);
                    setFormData({
                      ...formData,
                      leaveType: e.target.value,
                      totalWeeksEntitled: selectedType?.weeks || 0,
                      paidWeeks: selectedType?.paid || 0,
                      unpaidWeeks: (selectedType?.weeks || 0) - (selectedType?.paid || 0),
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  {leaveTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              {(formData.leaveType === 'MATERNITY' || formData.leaveType === 'ADOPTION') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date / Placement Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Start Date</label>
                <input
                  type="date"
                  value={formData.expectedStartDate}
                  onChange={(e) => setFormData({ ...formData, expectedStartDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Return Date</label>
                <input
                  type="date"
                  value={formData.expectedReturnDate}
                  onChange={(e) => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900 font-medium mb-1">Entitlement Summary</p>
                <div className="text-sm text-blue-800">
                  <p>Total weeks entitled: {formData.totalWeeksEntitled}</p>
                  <p>Paid weeks: {formData.paidWeeks}</p>
                  <p>Unpaid weeks: {formData.unpaidWeeks}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                >
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowRequestForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Key Rights Information */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Key Rights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Baby className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Maternity Leave</p>
              <p className="text-sm text-gray-600">52 weeks total (39 paid). Can start up to 11 weeks before due date.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Paternity Leave</p>
              <p className="text-sm text-gray-600">2 weeks paid leave within 56 days of birth or placement.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Shared Parental Leave</p>
              <p className="text-sm text-gray-600">Parents can share up to 50 weeks of leave and 37 weeks of pay.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Right to Return</p>
              <p className="text-sm text-gray-600">Guaranteed right to return to same or suitable alternative role.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Records */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Family Leave Records</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 font-medium text-gray-700">Leave Number</th>
                <th className="text-left p-4 font-medium text-gray-700">Employee</th>
                <th className="text-left p-4 font-medium text-gray-700">Type</th>
                <th className="text-left p-4 font-medium text-gray-700">Start Date</th>
                <th className="text-left p-4 font-medium text-gray-700">Return Date</th>
                <th className="text-left p-4 font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {leaveRecords.map((record) => (
                <tr key={record.id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium text-blue-600">{record.leaveNumber}</td>
                  <td className="p-4 text-gray-600">{record.employeeId}</td>
                  <td className="p-4 text-gray-600">{record.leaveType?.replace(/_/g, ' ')}</td>
                  <td className="p-4 text-gray-600">{new Date(record.expectedStartDate).toLocaleDateString()}</td>
                  <td className="p-4 text-gray-600">{new Date(record.expectedReturnDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
              {leaveRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No family leave requests
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
