import { useState } from 'react';
import { FileText, Search, Download, Eye, Star } from 'lucide-react';

export default function DocumentLibraryPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['All', 'Contracts', 'Policies', 'Letters', 'Forms', 'Handbooks'];
  
  const templates = [
    { id: '1', name: 'Employment Contract Template', category: 'CONTRACT', downloads: 145, rating: 4.8 },
    { id: '2', name: 'Disciplinary Letter Template', category: 'LETTER', downloads: 89, rating: 4.6 },
    { id: '3', name: 'Remote Working Policy', category: 'POLICY', downloads: 234, rating: 4.9 },
    { id: '4', name: 'Exit Interview Form', category: 'FORM', downloads: 67, rating: 4.5 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Document Library & Templates</h1>
        <p className="text-gray-600 mt-1">Access 500+ professionally drafted HR documents</p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg">
            <option>All Categories</option>
            {categories.map(cat => <option key={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat.toLowerCase())}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              selectedCategory === cat.toLowerCase()
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div key={template.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">{template.category}</span>
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <Download className="w-4 h-4" />
                {template.downloads}
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                {template.rating}
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </button>
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Use
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Popular Templates */}
      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Most Popular This Month</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            'Employment Contract (Fixed Term)',
            'GDPR Privacy Policy',
            'Flexible Working Request Form',
            'Performance Review Template',
          ].map((name, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                  {idx + 1}
                </span>
                <span className="font-medium text-gray-900">{name}</span>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Download</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
