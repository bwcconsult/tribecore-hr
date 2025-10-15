import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  Briefcase,
  Search,
  Download,
  Filter,
  Plus,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  TrendingUp,
  AlertCircle,
  Loader2,
  Settings,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';
import { orgChartService, OrgChartNode, OrgChartStats } from '../../services/orgChartService';

// Org Chart Tree Node Component
interface TreeNodeProps {
  node: OrgChartNode;
  level: number;
  onNodeClick: (node: OrgChartNode) => void;
}

function OrgTreeNode({ node, level, onNodeClick }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = node.children && node.children.length > 0;

  const getBorderColor = () => {
    if (node.positionLevel === 'EXECUTIVE') return 'border-purple-400';
    if (node.positionLevel === 'SENIOR_MANAGEMENT') return 'border-blue-400';
    if (node.positionLevel === 'MIDDLE_MANAGEMENT') return 'border-green-400';
    return 'border-gray-300';
  };

  const getBackgroundColor = () => {
    if (node.positionLevel === 'EXECUTIVE') return 'bg-purple-50';
    if (node.positionLevel === 'SENIOR_MANAGEMENT') return 'bg-blue-50';
    if (node.positionLevel === 'MIDDLE_MANAGEMENT') return 'bg-green-50';
    return 'bg-white';
  };

  return (
    <div className="relative">
      {/* Vertical Line to Parent */}
      {level > 0 && (
        <div className="absolute left-6 top-0 w-0.5 h-6 bg-gray-300 -translate-y-full" />
      )}

      {/* Node Card */}
      <div
        className={`flex items-start gap-2 cursor-pointer hover:shadow-md transition-all ${
          level > 0 ? 'ml-6' : ''
        }`}
        onClick={() => onNodeClick(node)}
      >
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-1 hover:bg-gray-100 rounded mt-4"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            )}
          </button>
        )}

        {/* Node Content */}
        <div
          className={`flex-1 border-2 rounded-lg p-4 ${getBorderColor()} ${getBackgroundColor()}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {node.employeeName
                  ? node.employeeName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                  : node.positionTitle?.slice(0, 2).toUpperCase() || '?'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {node.employeeName || node.positionTitle || 'Vacant Position'}
                </h3>
                <p className="text-sm text-gray-600 truncate">{node.positionTitle}</p>
                {node.departmentName && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {node.departmentName}
                  </p>
                )}
                {node.employeeEmail && (
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <Mail className="h-3 w-3" />
                    {node.employeeEmail}
                  </p>
                )}
              </div>
            </div>

            {/* Reports Badge */}
            {node.directReports > 0 && (
              <div className="flex-shrink-0">
                <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                  {node.directReports} {node.directReports === 1 ? 'Report' : 'Reports'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="ml-6 mt-4 space-y-4 relative">
          {/* Horizontal Line */}
          <div className="absolute left-0 top-0 w-6 h-0.5 bg-gray-300" />

          {node.children.map((child, index) => (
            <div key={child.id} className="relative">
              {/* Vertical connector line */}
              {index > 0 && (
                <div
                  className="absolute left-0 w-0.5 bg-gray-300"
                  style={{
                    height: '100%',
                    top: '-1rem',
                  }}
                />
              )}
              <OrgTreeNode node={child} level={level + 1} onNodeClick={onNodeClick} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrganizationChartPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orgChart, setOrgChart] = useState<OrgChartNode[]>([]);
  const [stats, setStats] = useState<OrgChartStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState<OrgChartNode | null>(null);
  const [view, setView] = useState<'tree' | 'list'>('tree');

  useEffect(() => {
    loadOrgChart();
  }, []);

  const loadOrgChart = async () => {
    try {
      setLoading(true);
      const [chartData, statsData] = await Promise.all([
        orgChartService.getOrgChart(),
        orgChartService.getOrgChartStats(),
      ]);
      setOrgChart(chartData);
      setStats(statsData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load organization chart');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadOrgChart();
      return;
    }

    try {
      setLoading(true);
      const results = await orgChartService.searchOrgChart(searchQuery);
      setOrgChart(results);
    } catch (error: any) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    toast.success('Export feature coming soon');
  };

  const handleNodeClick = (node: OrgChartNode) => {
    setSelectedNode(node);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Organization Chart</h1>
          <p className="text-gray-600 mt-1">Visual hierarchy of your organization</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => toast.success('Feature coming soon')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Position
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalEmployees}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Departments</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalDepartments}</p>
                </div>
                <Building2 className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Management Levels</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.managementLevels}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Span of Control</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.avgSpanOfControl}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search employees, positions, departments..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
            <Button variant="outline" onClick={loadOrgChart}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Org Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Structure</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading organization chart...</span>
            </div>
          ) : orgChart.length > 0 ? (
            <div className="space-y-6 overflow-x-auto pb-6">
              {orgChart.map((root) => (
                <OrgTreeNode key={root.id} node={root} level={0} onNodeClick={handleNodeClick} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No organization data</p>
              <p className="text-sm mt-1">Start by adding departments and positions</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
