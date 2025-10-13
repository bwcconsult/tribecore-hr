import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus, 
  Plane, 
  MapPin, 
  Calendar, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
  Filter,
} from 'lucide-react';

export default function TripsPage() {
  const [showNewTripModal, setShowNewTripModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  // Mock data - replace with real API call
  const trips = [
    {
      id: '1',
      tripNumber: 'TRIP-2025-001',
      tripName: 'Business trip to California',
      tripType: 'DOMESTIC',
      fromLocation: 'Chennai - MAA',
      toLocation: 'Victorville, California',
      startDate: '2025-11-02',
      endDate: '2025-11-04',
      status: 'APPROVED',
      estimatedCost: 41000,
      currency: 'GBP',
      businessPurpose: 'Client meeting regarding ongoing project',
    },
    {
      id: '2',
      tripNumber: 'TRIP-2025-002',
      tripName: 'Conference in London',
      tripType: 'DOMESTIC',
      fromLocation: 'Manchester',
      toLocation: 'London',
      startDate: '2025-12-15',
      endDate: '2025-12-17',
      status: 'SUBMITTED',
      estimatedCost: 850,
      currency: 'GBP',
      businessPurpose: 'Annual tech conference',
    },
  ];

  const stats = {
    total: 16,
    draft: 2,
    submitted: 3,
    approved: 8,
    inProgress: 1,
    completed: 2,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-700';
      case 'SUBMITTED':
        return 'bg-yellow-100 text-yellow-700';
      case 'APPROVED':
        return 'bg-green-100 text-green-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-700';
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'SUBMITTED':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Trips</h1>
          <p className="text-gray-600 mt-1">Manage travel requests and itineraries</p>
        </div>
        <button
          onClick={() => setShowNewTripModal(true)}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Trip
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Draft</p>
          <p className="text-2xl font-bold text-gray-500">{stats.draft}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Submitted</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.submitted}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Approved</p>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Completed</p>
          <p className="text-2xl font-bold text-purple-600">{stats.completed}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="border-b border-gray-200 px-6">
          <nav className="flex space-x-8">
            {[
              { label: 'All', value: '' },
              { label: 'Upcoming', value: 'upcoming' },
              { label: 'Submitted', value: 'SUBMITTED' },
              { label: 'Approved', value: 'APPROVED' },
              { label: 'Completed', value: 'COMPLETED' },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  filterStatus === filter.value
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Trips List */}
        <div className="p-6">
          {trips.length === 0 ? (
            <div className="text-center py-12">
              <Plane className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No trips found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating a new business trip.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowNewTripModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  New Trip
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {trips.map((trip) => (
                <div
                  key={trip.id}
                  className="border border-gray-200 rounded-lg p-5 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          <Plane className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{trip.tripName}</h3>
                          <p className="text-sm text-gray-500">Trip #{trip.tripNumber}</p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            trip.status
                          )}`}
                        >
                          {getStatusIcon(trip.status)}
                          {trip.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{trip.fromLocation}</p>
                            <p className="text-xs text-gray-500">From</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{trip.toLocation}</p>
                            <p className="text-xs text-gray-500">To</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{new Date(trip.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <span>→</span>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{new Date(trip.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>

                      {trip.businessPurpose && (
                        <p className="text-sm text-gray-600 mt-3 italic">"{trip.businessPurpose}"</p>
                      )}
                    </div>

                    <div className="text-right ml-6">
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(trip.estimatedCost, trip.currency)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Estimated Cost</p>
                      <button className="mt-4 inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                        View Details
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Trip Modal - Simple version, full version to be added */}
      {showNewTripModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">New Trip Request</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-center py-8">Trip creation form coming soon...</p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowNewTripModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
