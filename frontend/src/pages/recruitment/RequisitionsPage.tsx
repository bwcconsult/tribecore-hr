import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recruitmentService, Requisition } from '../../services/recruitment.service';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Plus, Search, Filter, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

export function RequisitionsPage() {
  const navigate = useNavigate();
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    isUrgent: '',
  });

  useEffect(() => {
    loadRequisitions();
    loadStats();
  }, [filters]);

  const loadRequisitions = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      if (filters.isUrgent) params.isUrgent = filters.isUrgent;

      const response = await recruitmentService.getRequisitions(params);
      setRequisitions(response.data || []);
    } catch (error) {
      console.error('Failed to load requisitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await recruitmentService.getRequisitionStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: any }> = {
      DRAFT: { color: 'gray', icon: Clock },
      PENDING_APPROVAL: { color: 'yellow', icon: Clock },
      APPROVED: { color: 'green', icon: CheckCircle },
      OPEN: { color: 'blue', icon: CheckCircle },
      FILLED: { color: 'green', icon: CheckCircle },
      CANCELLED: { color: 'red', icon: XCircle },
      ON_HOLD: { color: 'orange', icon: AlertCircle },
    };

    const { color, icon: Icon } = config[status] || config.DRAFT;

    return (
      <Badge variant={color as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Requisitions</h1>
          <p className="text-gray-600 mt-1">Manage hiring requisitions and approvals</p>
        </div>
        <Button onClick={() => navigate('/recruitment/requisitions/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Requisition
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Open</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalOpen}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Approval</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.totalPendingApproval}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Filled</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalFilled}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Urgent</p>
                  <p className="text-2xl font-bold text-red-600">{stats.totalUrgent}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by job title..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border rounded-md"
                />
              </div>
            </div>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border rounded-md"
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="PENDING_APPROVAL">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="OPEN">Open</option>
              <option value="FILLED">Filled</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="ON_HOLD">On Hold</option>
            </select>

            <select
              value={filters.isUrgent}
              onChange={(e) => setFilters({ ...filters, isUrgent: e.target.value })}
              className="px-4 py-2 border rounded-md"
            >
              <option value="">All Priority</option>
              <option value="true">Urgent Only</option>
            </select>

            <Button variant="outline" onClick={loadRequisitions}>
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Requisitions List */}
      <Card>
        <CardHeader>
          <CardTitle>All Requisitions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading requisitions...</p>
            </div>
          ) : requisitions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No requisitions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requisitions.map((req) => (
                <div
                  key={req.id}
                  className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors"
                  onClick={() => navigate(`/recruitment/requisitions/${req.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{req.jobTitle}</h3>
                        {getStatusBadge(req.status)}
                        {req.isUrgent && (
                          <Badge variant="danger" className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            URGENT
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Headcount:</span> {req.headcount}
                        </div>
                        <div>
                          <span className="font-medium">Type:</span> {req.employmentType}
                        </div>
                        <div>
                          <span className="font-medium">Budget:</span>{' '}
                          {req.budgetAmount
                            ? `${req.currency} ${req.budgetAmount.toLocaleString()}`
                            : 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Created:</span>{' '}
                          {new Date(req.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {req.approvals && req.approvals.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 mb-1">Approval Progress:</p>
                          <div className="flex gap-2">
                            {req.approvals.map((approval: any, idx: number) => (
                              <Badge
                                key={idx}
                                variant={
                                  approval.status === 'APPROVED'
                                    ? 'success'
                                    : approval.status === 'REJECTED'
                                    ? 'danger'
                                    : 'default'
                                }
                                className="text-xs"
                              >
                                {approval.approverName}: {approval.status}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/recruitment/requisitions/${req.id}`);
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
