import { useState } from 'react';
import { FileText, Plus, CheckCircle } from 'lucide-react';
import CreateMethodStatementModal from '../../components/health-safety/CreateMethodStatementModal';

export default function MethodStatementsPage() {
  const [showModal, setShowModal] = useState(false);
  const statements = [
    {
      id: '1',
      refNumber: 'MS-2025001',
      title: 'Working at Height - Scaffolding',
      activity: 'Scaffolding Assembly',
      location: 'Construction Site A',
      status: 'APPROVED',
      version: 2,
      issueDate: '2025-09-01',
    },
    {
      id: '2',
      refNumber: 'MS-2025002',
      title: 'Confined Space Entry',
      activity: 'Tank Maintenance',
      location: 'Chemical Plant',
      status: 'PENDING_APPROVAL',
      version: 1,
      issueDate: '2025-10-05',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Method Statements</h1>
            <p className="text-gray-600 mt-1">Create and manage safe working procedures</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            New Method Statement
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left p-4 font-medium text-gray-700">Ref Number</th>
                <th className="text-left p-4 font-medium text-gray-700">Title</th>
                <th className="text-left p-4 font-medium text-gray-700">Activity</th>
                <th className="text-left p-4 font-medium text-gray-700">Location</th>
                <th className="text-left p-4 font-medium text-gray-700">Version</th>
                <th className="text-left p-4 font-medium text-gray-700">Status</th>
                <th className="text-left p-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {statements.map((statement) => (
                <tr key={statement.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium text-blue-600">{statement.refNumber}</td>
                  <td className="p-4">{statement.title}</td>
                  <td className="p-4 text-gray-600">{statement.activity}</td>
                  <td className="p-4 text-gray-600">{statement.location}</td>
                  <td className="p-4">v{statement.version}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs flex items-center gap-1 w-fit ${
                      statement.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {statement.status === 'APPROVED' && <CheckCircle className="w-3 h-3" />}
                      {statement.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateMethodStatementModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={async (data) => {
          const response = await fetch('/api/health-safety/method-statements', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          if (!response.ok) throw new Error('Failed');
          return response.json();
        }}
      />
    </div>
  );
}
