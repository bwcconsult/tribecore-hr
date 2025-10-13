import React, { useEffect, useState } from 'react';
import { Plane, Search, MoreHorizontal } from 'lucide-react';
import axios from 'axios';

interface Trip {
  id: string;
  tripName: string;
  employee: {
    name: string;
  };
  fromLocation: string;
  toLocation: string;
  startDate: string;
  status: string;
  approver?: {
    name: string;
  };
}

export default function ExpensesAdminTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'awaiting-approval' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTrips();
  }, [activeTab]);

  const fetchTrips = async () => {
    try {
      const params: any = {};
      if (activeTab === 'awaiting-approval') {
        params.status = 'submitted';
      } else if (activeTab === 'archived') {
        params.status = 'completed';
      }

      const response = await axios.get('/api/expenses/trips', { params });
      setTrips(response.data);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredTrips = trips.filter(trip =>
    trip.tripName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.fromLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.toLocation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Plane className="w-8 h-8 text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Simplify business travel and booking</h1>
          <p className="text-sm text-gray-600 mt-1">
            View and update trips submitted by all users, manage users' travel documents, and provide booking options within approved trips.
          </p>
        </div>
      </div>

      {/* Configuration Links */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="text-sm font-medium text-gray-900 mb-3">Configure and customize Trips</div>
        <div className="space-y-2">
          <button className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
            <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
            Choose Preferences
          </button>
          <button className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
            <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
            Set up Approvers
          </button>
        </div>
      </div>

      {/* View Archived Link */}
      <div>
        <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
          <span>⌃</span> View Archived Trips ›
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-gray-200 rounded-lg">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-6 px-6">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('awaiting-approval')}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'awaiting-approval'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Awaiting Approval
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'archived'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Archived
            </button>
            <button className="py-3 text-sm font-medium text-gray-400">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search trips..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Trips Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading trips...</div>
          ) : filteredTrips.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Trips have not been submitted for approval yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approver
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {trip.employee.name.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-900">{trip.employee.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{trip.tripName}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {new Date(trip.startDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {trip.fromLocation} → {trip.toLocation}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                        {formatStatus(trip.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{trip.approver?.name || '-'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filteredTrips.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredTrips.length} of {trips.length} trips
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Previous
              </button>
              <span className="text-sm text-gray-600">1 of 2</span>
              <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* How It Works Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">How It Works</h3>
        
        <div className="relative">
          {/* Workflow Steps */}
          <div className="flex items-center justify-between">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              <p className="text-xs text-gray-600 max-w-[120px]">
                Submit request and leave field pre-filled
              </p>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0 px-2">→</div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-blue-600 font-semibold">2</span>
              </div>
              <p className="text-xs text-gray-600 max-w-[120px]">
                Approver receives trip for approval
              </p>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0 px-2">→</div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-green-600 font-semibold">3</span>
              </div>
              <p className="text-xs text-gray-600 max-w-[120px]">
                Approver receives or rejects trip
              </p>
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0 px-2">→</div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center flex-1">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-purple-600 font-semibold">4</span>
              </div>
              <p className="text-xs text-gray-600 max-w-[120px]">
                Approved trip
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-gray-600">SUBMITTER</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600">APPROVER</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <span className="text-xs text-gray-600">ADMIN</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Links */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick access</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer">
            <h4 className="font-medium text-gray-900 mb-2">Manage fields</h4>
            <p className="text-sm text-gray-600">
              Create custom fields and determine fields to be shown and made mandatory when users create trips.
            </p>
            <button className="text-sm text-blue-600 hover:underline mt-2">Try Now</button>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer">
            <h4 className="font-medium text-gray-900 mb-2">Customise layouts</h4>
            <p className="text-sm text-gray-600">
              Show only fields relevant to the travel type and policy when users create trips.
            </p>
            <button className="text-sm text-blue-600 hover:underline mt-2">Try Now</button>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer">
            <h4 className="font-medium text-gray-900 mb-2">Extend functionality</h4>
            <p className="text-sm text-gray-600">
              Create buttons that execute custom actions and links to access any URL from within trips.
            </p>
            <button className="text-sm text-blue-600 hover:underline mt-2">Try Now</button>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer">
            <h4 className="font-medium text-gray-900 mb-2">Manage documents</h4>
            <p className="text-sm text-gray-600">
              Add, access, and edit trips documents like passport and visa of all users in the organisation.
            </p>
            <button className="text-sm text-blue-600 hover:underline mt-2">Try Now</button>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer">
            <h4 className="font-medium text-gray-900 mb-2">Facilitate offline booking</h4>
            <p className="text-sm text-gray-600">
              Provide travel and hotel options to users within approved trips and book after user confirms.
            </p>
            <button className="text-sm text-blue-600 hover:underline mt-2">Try Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}
