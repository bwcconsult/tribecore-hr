import { useState } from 'react';
import { Plus, Car, MapPin, Calendar, DollarSign, Navigation, TrendingUp } from 'lucide-react';

export default function MileagePage() {
  const [showNewMileageModal, setShowNewMileageModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  // Mock data
  const mileageClaims = [
    {
      id: '1',
      mileageNumber: 'MIL-2025-001',
      travelDate: '2025-01-15',
      vehicleType: 'CAR',
      fromLocation: 'London Office',
      toLocation: 'Manchester Client Site',
      distance: 210,
      distanceUnit: 'miles',
      ratePerUnit: 0.45,
      totalAmount: 94.50,
      currency: 'GBP',
      purpose: 'Client meeting',
      status: 'APPROVED',
    },
    {
      id: '2',
      mileageNumber: 'MIL-2025-002',
      travelDate: '2025-01-20',
      vehicleType: 'CAR',
      fromLocation: 'Home',
      toLocation: 'Birmingham Office',
      distance: 125,
      distanceUnit: 'miles',
      ratePerUnit: 0.45,
      totalAmount: 56.25,
      currency: 'GBP',
      purpose: 'Team meeting',
      status: 'SUBMITTED',
    },
  ];

  const stats = {
    totalClaims: 24,
    totalDistance: 2840,
    totalAmount: 1278,
    approved: 18,
    pending: 4,
    thisMonth: {
      claims: 6,
      distance: 540,
      amount: 243,
    },
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
      case 'PAID':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getVehicleIcon = (type: string) => {
    return <Car className="w-5 h-5" />;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mileage Claims</h1>
          <p className="text-gray-600 mt-1">Track business mileage and expenses</p>
        </div>
        <button
          onClick={() => setShowNewMileageModal(true)}
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Record Mileage
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-100 text-sm font-medium">Total Distance</p>
            <Navigation className="w-5 h-5 text-blue-200" />
          </div>
          <p className="text-3xl font-bold">{stats.totalDistance.toLocaleString()}</p>
          <p className="text-blue-100 text-sm mt-1">miles this year</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-green-100 text-sm font-medium">Total Claimed</p>
            <DollarSign className="w-5 h-5 text-green-200" />
          </div>
          <p className="text-3xl font-bold">£{stats.totalAmount.toLocaleString()}</p>
          <p className="text-green-100 text-sm mt-1">{stats.totalClaims} claims</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-purple-100 text-sm font-medium">This Month</p>
            <TrendingUp className="w-5 h-5 text-purple-200" />
          </div>
          <p className="text-3xl font-bold">{stats.thisMonth.distance}</p>
          <p className="text-purple-100 text-sm mt-1">miles (£{stats.thisMonth.amount})</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-yellow-100 text-sm font-medium">Avg Rate</p>
            <Car className="w-5 h-5 text-yellow-200" />
          </div>
          <p className="text-3xl font-bold">£0.45</p>
          <p className="text-yellow-100 text-sm mt-1">per mile (HMRC rate)</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Car className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-1">UK HMRC Mileage Rates 2024/25</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Cars/Vans: 45p per mile (first 10,000 miles), 25p per mile (thereafter)</p>
              <p>• Motorcycles: 24p per mile</p>
              <p>• Bicycles: 20p per mile</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="border-b border-gray-200 px-6">
          <nav className="flex space-x-8">
            {[
              { label: 'All', value: '' },
              { label: 'Draft', value: 'DRAFT' },
              { label: 'Submitted', value: 'SUBMITTED' },
              { label: 'Approved', value: 'APPROVED' },
              { label: 'Paid', value: 'PAID' },
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

        {/* Mileage Claims List */}
        <div className="p-6">
          {mileageClaims.length === 0 ? (
            <div className="text-center py-12">
              <Car className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No mileage claims found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by recording your first mileage claim.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowNewMileageModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Record Mileage
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {mileageClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="border border-gray-200 rounded-lg p-5 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                          {getVehicleIcon(claim.vehicleType)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{claim.purpose}</h3>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                claim.status
                              )}`}
                            >
                              {claim.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">{claim.mileageNumber}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">From</span>
                          </div>
                          <p className="text-sm text-gray-900 ml-6">{claim.fromLocation}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">To</span>
                          </div>
                          <p className="text-sm text-gray-900 ml-6">{claim.toLocation}</p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">Date</span>
                          </div>
                          <p className="text-sm text-gray-900 ml-6">
                            {new Date(claim.travelDate).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Navigation className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{claim.distance} {claim.distanceUnit}</span>
                        </div>
                        <span>×</span>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">£{claim.ratePerUnit.toFixed(2)} per mile</span>
                        </div>
                        <span>=</span>
                        <div className="font-semibold text-gray-900">
                          £{claim.totalAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right ml-6">
                      <p className="text-2xl font-bold text-indigo-600">
                        £{claim.totalAmount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{claim.vehicleType}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* New Mileage Modal Placeholder */}
      {showNewMileageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Record Mileage</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-center py-8">Mileage form coming soon...</p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowNewMileageModal(false)}
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
