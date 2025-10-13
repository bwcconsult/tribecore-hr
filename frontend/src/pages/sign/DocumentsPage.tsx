import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Document {
  id: string;
  name: string;
  status: string;
  sentAt: string;
  recipients: any[];
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'sent' | 'received'>('sent');
  const [activeFilter, setActiveFilter] = useState('all');

  const sentFilters = [
    { id: 'all', label: 'All' },
    { id: 'scheduled', label: 'Scheduled' },
    { id: 'in_progress', label: 'In progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'declined', label: 'Declined' },
    { id: 'expired', label: 'Expired' },
    { id: 'recalled', label: 'Recalled' },
    { id: 'draft', label: 'Draft' },
    { id: 'bulk_send', label: 'Bulk send' },
  ];

  const receivedFilters = [
    { id: 'all', label: 'All' },
    { id: 'need_your_signature', label: 'Need your signature' },
  ];

  const currentFilters = activeCategory === 'sent' ? sentFilters : receivedFilters;

  useEffect(() => {
    fetchDocuments();
  }, [activeCategory, activeFilter]);

  const fetchDocuments = async () => {
    try {
      const endpoint = activeCategory === 'sent'
        ? '/api/sign/documents'
        : '/api/sign/documents/received';
      
      const params: any = {};
      if (activeFilter !== 'all') {
        params.status = activeFilter;
      }

      const response = await axios.get(endpoint, { params });
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search"
              className="w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">BWC Consult LTD</span>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 min-h-screen bg-gray-50">
          {/* Category Selection */}
          <div className="p-4">
            <div className="space-y-2">
              <button
                onClick={() => setActiveCategory('sent')}
                className={`w-full text-left px-4 py-2 rounded ${
                  activeCategory === 'sent'
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="font-medium">Sent</div>
              </button>
              <button
                onClick={() => setActiveCategory('received')}
                className={`w-full text-left px-4 py-2 rounded ${
                  activeCategory === 'received'
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <div className="font-medium">Received</div>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="border-t border-gray-200 p-4">
            <div className="space-y-1">
              {currentFilters.map((filter) => (
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
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Sign yourself</h1>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{doc.name}</h3>
                      <p className="text-sm text-gray-500">
                        {doc.sentAt
                          ? `Sent: ${new Date(doc.sentAt).toLocaleDateString()}`
                          : 'Draft'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          doc.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : doc.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : doc.status === 'declined'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {doc.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <button className="text-blue-600 hover:underline text-sm">View</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
