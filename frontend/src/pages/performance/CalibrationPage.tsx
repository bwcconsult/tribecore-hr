import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  MessageSquare,
  Save,
  CheckCircle,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

interface CalibrationEmployee {
  id: string;
  name: string;
  title: string;
  department: string;
  manager: string;
  selfRating: number;
  managerRating: number;
  proposedRating: number;
  calibratedRating?: number;
  variance: number;
  notes: string;
  flagged: boolean;
}

export default function CalibrationPage() {
  const { id } = useParams();
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('variance');
  const [selectedEmployee, setSelectedEmployee] = useState<CalibrationEmployee | null>(null);

  // Mock data
  const cycle = {
    id: id,
    name: 'Q4 2024 Performance Review',
    totalEmployees: 250,
    calibratedCount: 163,
    flaggedCount: 18,
  };

  const [employees, setEmployees] = useState<CalibrationEmployee[]>([
    {
      id: '1',
      name: 'John Smith',
      title: 'Senior Software Engineer',
      department: 'Engineering',
      manager: 'Sarah Johnson',
      selfRating: 4.5,
      managerRating: 3.8,
      proposedRating: 4.0,
      calibratedRating: 4.0,
      variance: 0.7,
      notes: 'Strong technical skills but needs improvement in communication',
      flagged: true,
    },
    {
      id: '2',
      name: 'Emily Davis',
      title: 'Marketing Manager',
      department: 'Marketing',
      manager: 'Mike Brown',
      selfRating: 4.2,
      managerRating: 4.5,
      proposedRating: 4.4,
      variance: -0.3,
      notes: 'Consistently exceeds expectations, ready for promotion',
      flagged: false,
    },
    {
      id: '3',
      name: 'Michael Chen',
      title: 'Sales Representative',
      department: 'Sales',
      manager: 'David Wilson',
      selfRating: 3.0,
      managerRating: 4.2,
      proposedRating: 3.8,
      variance: -1.2,
      notes: 'Underestimates own performance, exceeded sales targets',
      flagged: true,
    },
    {
      id: '4',
      name: 'Sarah Williams',
      title: 'Financial Analyst',
      department: 'Finance',
      manager: 'Emma Thompson',
      selfRating: 3.8,
      managerRating: 3.9,
      proposedRating: 3.9,
      calibratedRating: 3.8,
      variance: -0.1,
      notes: 'Solid performer, meeting all expectations',
      flagged: false,
    },
    {
      id: '5',
      name: 'Robert Garcia',
      title: 'Software Engineer',
      department: 'Engineering',
      manager: 'Sarah Johnson',
      selfRating: 4.8,
      managerRating: 3.2,
      proposedRating: 3.5,
      variance: 1.6,
      notes: 'Overestimates performance, missed key deadlines',
      flagged: true,
    },
  ]);

  const departments = ['all', ...Array.from(new Set(employees.map((e) => e.department)))];

  const filteredEmployees = employees
    .filter((e) => selectedDepartment === 'all' || e.department === selectedDepartment)
    .filter((e) => !showFlaggedOnly || e.flagged)
    .sort((a, b) => {
      if (sortBy === 'variance') return Math.abs(b.variance) - Math.abs(a.variance);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'department') return a.department.localeCompare(b.department);
      return 0;
    });

  const ratingDistribution = {
    5: employees.filter((e) => (e.calibratedRating || e.proposedRating) >= 4.5).length,
    4: employees.filter((e) => {
      const rating = e.calibratedRating || e.proposedRating;
      return rating >= 3.5 && rating < 4.5;
    }).length,
    3: employees.filter((e) => {
      const rating = e.calibratedRating || e.proposedRating;
      return rating >= 2.5 && rating < 3.5;
    }).length,
    2: employees.filter((e) => {
      const rating = e.calibratedRating || e.proposedRating;
      return rating >= 1.5 && rating < 2.5;
    }).length,
    1: employees.filter((e) => (e.calibratedRating || e.proposedRating) < 1.5).length,
  };

  const handleCalibrateRating = (employeeId: string, newRating: number) => {
    setEmployees(
      employees.map((e) =>
        e.id === employeeId ? { ...e, calibratedRating: newRating } : e
      )
    );
    toast.success('Rating calibrated successfully');
  };

  const handleFlagEmployee = (employeeId: string) => {
    setEmployees(
      employees.map((e) => (e.id === employeeId ? { ...e, flagged: !e.flagged } : e))
    );
  };

  const handleSaveCalibrations = () => {
    toast.success('Calibration data saved successfully');
  };

  const handleFinalizeCalibrations = () => {
    if (
      confirm(
        'Are you sure you want to finalize calibrations? This will lock all ratings and proceed to publishing.'
      )
    ) {
      toast.success('Calibrations finalized! Moving to publishing phase.');
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600 bg-green-50';
    if (rating >= 3.5) return 'text-blue-600 bg-blue-50';
    if (rating >= 2.5) return 'text-yellow-600 bg-yellow-50';
    if (rating >= 1.5) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getVarianceColor = (variance: number) => {
    const absVariance = Math.abs(variance);
    if (absVariance >= 1.5) return 'text-red-600 bg-red-50';
    if (absVariance >= 1.0) return 'text-orange-600 bg-orange-50';
    if (absVariance >= 0.5) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={`/performance/reviews/${id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Calibration Session</h1>
            <p className="text-gray-600 mt-1">{cycle.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveCalibrations}>
            <Save className="h-4 w-4 mr-2" />
            Save Progress
          </Button>
          <Button onClick={handleFinalizeCalibrations}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Finalize Calibrations
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{cycle.totalEmployees}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Calibrated</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {cycle.calibratedCount}/{cycle.totalEmployees}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Flagged for Review</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{cycle.flaggedCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {Math.round((cycle.calibratedCount / cycle.totalEmployees) * 100)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(ratingDistribution)
              .reverse()
              .map(([rating, count]) => (
                <div key={rating}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">
                      {rating} - {['Outstanding', 'Exceeds', 'Meets', 'Developing', 'Needs Improvement'][5 - parseInt(rating)]}
                    </span>
                    <span className="text-gray-600">
                      {count} employees ({Math.round((count / employees.length) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        parseInt(rating) >= 4
                          ? 'bg-green-600'
                          : parseInt(rating) >= 3
                          ? 'bg-blue-600'
                          : 'bg-orange-600'
                      }`}
                      style={{ width: `${(count / employees.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 flex-wrap items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border rounded-lg"
            >
              <option value="variance">Sort by Variance</option>
              <option value="name">Sort by Name</option>
              <option value="department">Sort by Department</option>
            </select>
            <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={showFlaggedOnly}
                onChange={(e) => setShowFlaggedOnly(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Show flagged only</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Calibration Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Calibrations ({filteredEmployees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Employee</th>
                  <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Department</th>
                  <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">Self</th>
                  <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">Manager</th>
                  <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">Proposed</th>
                  <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">Variance</th>
                  <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">Calibrated</th>
                  <th className="text-center py-3 px-4 font-semibold text-sm text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id} className={`hover:bg-gray-50 ${employee.flagged ? 'bg-orange-50' : ''}`}>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{employee.name}</p>
                        <p className="text-sm text-gray-600">{employee.title}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">{employee.department}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRatingColor(employee.selfRating)}`}>
                        {employee.selfRating.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRatingColor(employee.managerRating)}`}>
                        {employee.managerRating.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRatingColor(employee.proposedRating)}`}>
                        {employee.proposedRating.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getVarianceColor(employee.variance)}`}>
                        {employee.variance > 0 ? '+' : ''}
                        {employee.variance.toFixed(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {employee.calibratedRating ? (
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getRatingColor(employee.calibratedRating)}`}>
                          {employee.calibratedRating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Not set</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedEmployee(employee)}
                        >
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleFlagEmployee(employee.id)}
                          className={employee.flagged ? 'bg-orange-50 border-orange-300' : ''}
                        >
                          <AlertTriangle className={`h-4 w-4 ${employee.flagged ? 'text-orange-600' : 'text-gray-400'}`} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Calibration Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Calibrate Rating - {selectedEmployee.name}</h2>
              <button onClick={() => setSelectedEmployee(null)} className="text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Self Rating</p>
                  <p className="text-2xl font-bold">{selectedEmployee.selfRating.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Manager Rating</p>
                  <p className="text-2xl font-bold">{selectedEmployee.managerRating.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Proposed Rating</p>
                  <p className="text-2xl font-bold">{selectedEmployee.proposedRating.toFixed(1)}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium mb-2">Set Calibrated Rating</label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleCalibrateRating(selectedEmployee.id, rating)}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        selectedEmployee.calibratedRating === rating
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl font-bold">{rating}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium mb-2">Manager Notes</label>
                <div className="bg-gray-50 p-3 rounded-lg text-sm">{selectedEmployee.notes}</div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedEmployee(null)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={() => setSelectedEmployee(null)} className="flex-1">
                  Save & Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
