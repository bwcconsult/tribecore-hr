import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Network, Plus, Users, Building, DollarSign, AlertCircle, X } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';

export default function PositionsPage() {
  const { user } = useAuthStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mock data (backend integration pending)
  const positions = [
    { id: '1', positionId: 'ENG-001', positionTitle: 'Senior Software Engineer', department: 'Engineering', reportingLevel: 'L3', fte: 1.0, status: 'ACTIVE', incumbent: { firstName: 'John' }, annualBudget: 75000 },
    { id: '2', positionId: 'MKT-002', positionTitle: 'Marketing Manager', department: 'Marketing', reportingLevel: 'L2', fte: 1.0, status: 'VACANT', incumbent: null, annualBudget: 65000 },
    { id: '3', positionId: 'HR-003', positionTitle: 'HR Business Partner', department: 'Human Resources', reportingLevel: 'L2', fte: 0.5, status: 'ACTIVE', incumbent: { firstName: 'Jane' }, annualBudget: 55000 },
  ];

  const metrics = {
    totalPositions: positions.length,
    vacantPositions: positions.filter(p => p.status === 'VACANT').length,
    fillRate: ((positions.filter(p => p.status === 'ACTIVE').length / positions.length) * 100),
    totalBudget: positions.reduce((sum, p) => sum + p.annualBudget, 0),
  };

  const handleCreatePosition = () => {
    toast.success('Position created successfully!');
    setShowCreateModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'VACANT': return 'bg-yellow-100 text-yellow-800';
      case 'FROZEN': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Network className="h-8 w-8 text-blue-600" />
            Position Management
          </h1>
          <p className="text-gray-600 mt-1">Manage organizational positions and structure</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => toast.info('Org Chart view - Coming soon!')}>View Org Chart</Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Position
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Positions</p>
                <p className="text-2xl font-bold">{metrics.totalPositions}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vacant Positions</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.vacantPositions}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Fill Rate</p>
                <p className="text-2xl font-bold">{metrics.fillRate.toFixed(1)}%</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold">
                  ${metrics.totalBudget.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Positions Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold">Position ID</th>
                  <th className="text-left p-3 font-semibold">Title</th>
                  <th className="text-left p-3 font-semibold">Department</th>
                  <th className="text-left p-3 font-semibold">Level</th>
                  <th className="text-left p-3 font-semibold">FTE</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Incumbent</th>
                  <th className="text-left p-3 font-semibold">Budget</th>
                </tr>
              </thead>
              <tbody>
                {positions.map((position) => (
                  <tr key={position.id} className="border-b hover:bg-gray-50 cursor-pointer">
                    <td className="p-3 font-mono text-sm">{position.positionId}</td>
                    <td className="p-3 font-medium">{position.positionTitle}</td>
                    <td className="p-3 text-sm text-gray-600">{position.department}</td>
                    <td className="p-3 text-sm">{position.reportingLevel}</td>
                    <td className="p-3 text-sm">{position.fte}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(position.status)}`}>
                        {position.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {position.incumbent?.firstName || 'Vacant'}
                    </td>
                    <td className="p-3 text-sm font-medium">
                      ${position.annualBudget.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create Position Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create Position</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Position Title</label>
                <input type="text" className="w-full border rounded px-3 py-2" placeholder="e.g., Senior Software Engineer" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <select className="w-full border rounded px-3 py-2">
                  <option>Engineering</option>
                  <option>Marketing</option>
                  <option>Sales</option>
                  <option>Human Resources</option>
                  <option>Finance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reporting Level</label>
                <select className="w-full border rounded px-3 py-2">
                  <option>L1 - Entry</option>
                  <option>L2 - Mid</option>
                  <option>L3 - Senior</option>
                  <option>L4 - Lead</option>
                  <option>L5 - Director</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button onClick={handleCreatePosition}>Create Position</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
