import { useState } from 'react';
import {
  Users,
  ChevronDown,
  ChevronRight,
  Search,
  Download,
  ZoomIn,
  ZoomOut,
  Mail,
  Phone,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

interface Employee {
  id: string;
  name: string;
  title: string;
  email: string;
  phone?: string;
  department: string;
  reportsTo?: string;
  children?: Employee[];
}

export default function OrgChartPage() {
  const [search, setSearch] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1']));

  // Mock org structure
  const orgData: Employee = {
    id: '1',
    name: 'Sarah Johnson',
    title: 'Chief Executive Officer',
    email: 'sarah.johnson@company.com',
    phone: '+44 20 7123 4567',
    department: 'Executive',
    children: [
      {
        id: '2',
        name: 'Michael Chen',
        title: 'Chief Technology Officer',
        email: 'michael.chen@company.com',
        department: 'Technology',
        reportsTo: '1',
        children: [
          {
            id: '5',
            name: 'Emma Davis',
            title: 'VP Engineering',
            email: 'emma.davis@company.com',
            department: 'Engineering',
            reportsTo: '2',
            children: [
              {
                id: '8',
                name: 'James Wilson',
                title: 'Engineering Manager',
                email: 'james.wilson@company.com',
                department: 'Engineering',
                reportsTo: '5',
              },
            ],
          },
          {
            id: '6',
            name: 'Robert Taylor',
            title: 'VP Product',
            email: 'robert.taylor@company.com',
            department: 'Product',
            reportsTo: '2',
          },
        ],
      },
      {
        id: '3',
        name: 'Lisa Anderson',
        title: 'Chief Financial Officer',
        email: 'lisa.anderson@company.com',
        department: 'Finance',
        reportsTo: '1',
        children: [
          {
            id: '7',
            name: 'David Martinez',
            title: 'Finance Manager',
            email: 'david.martinez@company.com',
            department: 'Finance',
            reportsTo: '3',
          },
        ],
      },
      {
        id: '4',
        name: 'Jennifer White',
        title: 'Chief People Officer',
        email: 'jennifer.white@company.com',
        department: 'HR',
        reportsTo: '1',
        children: [
          {
            id: '9',
            name: 'Kevin Brown',
            title: 'HR Business Partner',
            email: 'kevin.brown@company.com',
            department: 'HR',
            reportsTo: '4',
          },
        ],
      },
    ],
  };

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const renderEmployeeCard = (employee: Employee, level: number = 0) => {
    const hasChildren = employee.children && employee.children.length > 0;
    const isExpanded = expandedNodes.has(employee.id);

    return (
      <div key={employee.id} className="relative">
        <div
          className={`mb-4 ${level > 0 ? 'ml-8' : ''}`}
          style={{ paddingLeft: level > 0 ? '40px' : '0' }}
        >
          {level > 0 && (
            <div className="absolute left-0 top-6 w-8 h-px bg-gray-300"></div>
          )}
          
          <div className="relative">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                        <p className="text-sm text-gray-600">{employee.title}</p>
                        <p className="text-xs text-gray-500">{employee.department}</p>
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span>{employee.email}</span>
                      </div>
                      {employee.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{employee.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {hasChildren && (
                    <button
                      onClick={() => toggleNode(employee.id)}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-gray-600" />
                      )}
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="relative">
            {level > 0 && (
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-300"></div>
            )}
            {employee.children!.map((child) => renderEmployeeCard(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const handleExport = () => {
    toast.success('Exporting organization chart...');
  };

  const countTotalEmployees = (employee: Employee): number => {
    let count = 1;
    if (employee.children) {
      employee.children.forEach((child) => {
        count += countTotalEmployees(child);
      });
    }
    return count;
  };

  const totalEmployees = countTotalEmployees(orgData);

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
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalEmployees}</p>
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
                <p className="text-2xl font-bold text-gray-900 mt-1">4</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Management Levels</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">4</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Org Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Structure</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            {renderEmployeeCard(orgData)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
