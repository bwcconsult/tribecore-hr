import React, { useState, useEffect } from 'react';
import { Search, Download } from 'lucide-react';
import axios from 'axios';

interface ActivityLog {
  id: string;
  activity: string;
  description: string;
  performedAt: string;
  user: any;
  document: any;
}

export default function ReportsPage() {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('activity_log');
  const [activeFilter, setActiveFilter] = useState('all');
  const [dateRange, setDateRange] = useState('last_30_days');

  const categories = [
    { id: 'activity_log', label: 'Activity log' },
    { id: 'document_status', label: 'Document status' },
    { id: 'completed', label: 'Completed' },
    { id: 'declined', label: 'Declined' },
    { id: 'recalled', label: 'Recalled' },
    { id: 'in_progress', label: 'In progress' },
    { id: 'expired', label: 'Expired' },
    { id: 'document_type', label: 'Document type' },
    { id: 'failed_access', label: 'Failed access' },
    { id: 'document_visibility', label: 'Document visibility' },
  ];

  useEffect(() => {
    fetchActivityLogs();
  }, [activeFilter, dateRange]);

  const fetchActivityLogs = async () => {
    try {
      const params: any = {};
      
      if (activeFilter !== 'all') {
        params.activity = activeFilter;
      }

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      if (dateRange === 'last_30_days') {
        startDate.setDate(endDate.getDate() - 30);
      } else if (dateRange === 'last_7_days') {
        startDate.setDate(endDate.getDate() - 7);
      }

      params.startDate = startDate.toISOString();
      params.endDate = endDate.toISOString();

      const response = await axios.get('/api/sign/activity-logs', { params });
      setActivityLogs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      setActivityLogs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Organization activity history</h1>
          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="last_7_days">Last 7 days</option>
              <option value="last_30_days">Last 30 days</option>
              <option value="last_90_days">Last 90 days</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export as
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-1">
              <div className="font-medium text-gray-900 mb-2 text-sm">Reports</div>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`w-full text-left px-4 py-2 rounded text-sm ${
                    activeCategory === category.id
                      ? 'bg-gray-200 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="border border-gray-200 rounded-lg">
            {/* Table Header */}
            <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500">View 0 - 0 of 0</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Show</span>
                  <select className="text-xs border border-gray-300 rounded px-2 py-1">
                    <option>10</option>
                    <option>25</option>
                    <option>50</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PERFORMED BY
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ACTIVITY
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PERFORMED ON
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TIME OF ACTIVITY
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        Loading activity logs...
                      </td>
                    </tr>
                  ) : activityLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <p className="text-red-600 font-medium">No data available</p>
                      </td>
                    </tr>
                  ) : (
                    activityLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.user?.name || 'System'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(log.performedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(log.performedAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
