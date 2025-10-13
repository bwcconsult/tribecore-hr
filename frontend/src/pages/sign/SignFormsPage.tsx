import React, { useState, useEffect } from 'react';
import { Plus, Search, X } from 'lucide-react';
import axios from 'axios';

interface SignForm {
  id: string;
  name: string;
  templateId: string;
  status: string;
  responseCount: number;
  responseLimit: number | null;
  createdAt: string;
}

export default function SignFormsPage() {
  const [signForms, setSignForms] = useState<SignForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    templateId: '',
    validUntil: '',
    requireOtp: false,
    responseLimit: '',
    avoidDuplicates: false,
    duplicateCheckDays: 7,
  });

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'inactive', label: 'Inactive' },
    { id: 'expired', label: 'Expired' },
    { id: 'limit_reached', label: 'Limit reached' },
  ];

  useEffect(() => {
    fetchSignForms();
  }, [activeFilter]);

  const fetchSignForms = async () => {
    try {
      const params: any = {};
      if (activeFilter !== 'all') {
        params.status = activeFilter;
      }

      const response = await axios.get('/api/sign/sign-forms', { params });
      setSignForms(response.data);
    } catch (error) {
      console.error('Error fetching sign forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSignForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/sign/sign-forms', {
        ...formData,
        responseLimit: formData.responseLimit ? parseInt(formData.responseLimit) : null,
      });
      setShowCreateModal(false);
      setFormData({
        name: '',
        templateId: '',
        validUntil: '',
        requireOtp: false,
        responseLimit: '',
        avoidDuplicates: false,
        duplicateCheckDays: 7,
      });
      fetchSignForms();
    } catch (error) {
      console.error('Error creating sign form:', error);
    }
  };

  const filteredSignForms = signForms.filter((form) =>
    form.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">SignForms</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search sign forms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-96 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create SignForm
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="space-y-1">
              <div className="font-medium text-gray-900 mb-2 text-sm">SignForms</div>
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`w-full text-left px-4 py-2 rounded text-sm ${
                    activeFilter === filter.id
                      ? 'bg-gray-200 text-gray-900 font-medium'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>
                You have 500 complimentary credits left for this month in your billing cycle.{' '}
                <a href="#" className="underline">Learn more about complimentary Zoho Sign credits</a>
              </span>
            </div>
          </div>

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
                      SIGNFORM NAME
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TEMPLATE NAME
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NUMBER OF RESPONSES
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      OWNER
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CREATED ON
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        Loading sign forms...
                      </td>
                    </tr>
                  ) : filteredSignForms.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <p className="text-red-600 font-medium">No data available</p>
                      </td>
                    </tr>
                  ) : (
                    filteredSignForms.map((form) => (
                      <tr key={form.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                            {form.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          -
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {form.responseCount}
                          {form.responseLimit && ` / ${form.responseLimit}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              form.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : form.status === 'expired'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {form.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          -
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {new Date(form.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-blue-600 hover:underline">Actions</button>
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

      {/* Create SignForm Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">SignForm configuration</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateSignForm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Choose template
                </label>
                <select
                  value={formData.templateId}
                  onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Choose template</option>
                </select>
                <p className="text-xs text-blue-600 mt-1">
                  This dropdown will only list templates that can be used as a SignForm.{' '}
                  <a href="#" className="underline">Learn more about SignForms</a>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valid until
                </label>
                <select
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Forever</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Signer authentication
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.requireOtp}
                    onChange={(e) => setFormData({ ...formData, requireOtp: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Enforce One-Time Password (OTP)</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response settings
                </label>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Limit SignForm responses</span>
                </label>
                <input
                  type="number"
                  value={formData.responseLimit}
                  onChange={(e) => setFormData({ ...formData, responseLimit: e.target.value })}
                  placeholder="50"
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <span className="text-sm text-gray-600 ml-2">responses</span>
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.avoidDuplicates}
                    onChange={(e) => setFormData({ ...formData, avoidDuplicates: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">
                    Avoid duplicate responses within 7 days of initial response
                  </span>
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
