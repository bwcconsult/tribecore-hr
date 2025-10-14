import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Network, Plus, Users, Building, DollarSign, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuthStore } from '../../stores/authStore';

export default function PositionsPage() {
  const { user } = useAuthStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: positions, isLoading } = useQuery({
    queryKey: ['positions', user?.organizationId],
    queryFn: async () => {
      const response = await axios.get(`/api/positions/org/${user?.organizationId}`);
      return response.data;
    },
    enabled: !!user?.organizationId,
  });

  const { data: metrics } = useQuery({
    queryKey: ['position-metrics', user?.organizationId],
    queryFn: async () => {
      const response = await axios.get(`/api/positions/org/${user?.organizationId}/metrics`);
      return response.data;
    },
    enabled: !!user?.organizationId,
  });

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
          <Button variant="outline">View Org Chart</Button>
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
                <p className="text-2xl font-bold">{metrics?.totalPositions || 0}</p>
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
                <p className="text-2xl font-bold text-yellow-600">{metrics?.vacantPositions || 0}</p>
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
                <p className="text-2xl font-bold">{metrics?.fillRate?.toFixed(1) || 0}%</p>
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
                  ${(metrics?.totalBudget || 0).toLocaleString()}
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
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : !positions || positions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No positions found</div>
          ) : (
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
                  {positions.map((position: any) => (
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
                        ${(position.annualBudget || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
