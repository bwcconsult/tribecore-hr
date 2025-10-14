import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Users,
  BarChart3,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Send,
  Settings,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

export default function ReviewCycleDetailPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const cycle = {
    id: id,
    name: 'Q4 2024 Performance Review',
    type: 'QUARTERLY',
    status: 'MANAGER_REVIEW_OPEN',
    periodStart: '2024-10-01',
    periodEnd: '2024-12-31',
    selfReviewStartDate: '2025-01-01',
    selfReviewEndDate: '2025-01-10',
    managerReviewStartDate: '2025-01-11',
    managerReviewEndDate: '2025-01-20',
    participantCount: 250,
    completionRate: 65,
    selfReviewsCompleted: 245,
    managerReviewsCompleted: 163,
    peerReviewsCompleted: 0,
    enablePeerReviews: false,
    enableUpwardReviews: true,
    ratingScale: 'FIVE_POINT',
    requireCalibration: true,
    linkToCompensation: true,
  };

  const participants = [
    {
      id: '1',
      name: 'John Smith',
      department: 'Engineering',
      selfReviewStatus: 'COMPLETED',
      managerReviewStatus: 'PENDING',
      manager: 'Sarah Johnson',
      lastActivity: '2025-01-08',
    },
    {
      id: '2',
      name: 'Emily Davis',
      department: 'Marketing',
      selfReviewStatus: 'COMPLETED',
      managerReviewStatus: 'COMPLETED',
      manager: 'Mike Brown',
      lastActivity: '2025-01-15',
    },
    {
      id: '3',
      name: 'Michael Chen',
      department: 'Sales',
      selfReviewStatus: 'IN_PROGRESS',
      managerReviewStatus: 'NOT_STARTED',
      manager: 'David Wilson',
      lastActivity: '2025-01-12',
    },
    {
      id: '4',
      name: 'Sarah Williams',
      department: 'Finance',
      selfReviewStatus: 'COMPLETED',
      managerReviewStatus: 'COMPLETED',
      manager: 'Emma Thompson',
      lastActivity: '2025-01-14',
    },
    {
      id: '5',
      name: 'Robert Garcia',
      department: 'Engineering',
      selfReviewStatus: 'NOT_STARTED',
      managerReviewStatus: 'NOT_STARTED',
      manager: 'Sarah Johnson',
      lastActivity: 'Never',
    },
  ];

  const timeline = [
    { phase: 'Review Period', start: cycle.periodStart, end: cycle.periodEnd, status: 'COMPLETED' },
    { phase: 'Self Reviews', start: cycle.selfReviewStartDate, end: cycle.selfReviewEndDate, status: 'COMPLETED' },
    { phase: 'Manager Reviews', start: cycle.managerReviewStartDate, end: cycle.managerReviewEndDate, status: 'IN_PROGRESS' },
    { phase: 'Calibration', start: '2025-01-21', end: '2025-01-25', status: 'UPCOMING' },
    { phase: 'Publishing', start: '2025-01-26', end: '2025-01-26', status: 'UPCOMING' },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      COMPLETED: 'bg-green-100 text-green-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      PENDING: 'bg-orange-100 text-orange-800',
      NOT_STARTED: 'bg-gray-100 text-gray-600',
      UPCOMING: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || colors.NOT_STARTED;
  };

  const handleSendReminders = () => {
    toast.success('Reminders sent to 87 participants with pending reviews');
  };

  const handleExportData = () => {
    toast.success('Exporting review cycle data...');
  };

  const handlePublishResults = () => {
    if (confirm('Are you sure you want to publish review results? This action cannot be undone.')) {
      toast.success('Review results published successfully!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/performance/reviews">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{cycle.name}</h1>
            <p className="text-gray-600 mt-1">
              {cycle.type} • {new Date(cycle.periodStart).toLocaleDateString()} - {new Date(cycle.periodEnd).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleSendReminders}>
            <Send className="h-4 w-4 mr-2" />
            Send Reminders
          </Button>
          <Link to={`/performance/reviews/${id}/calibration`}>
            <Button>
              <BarChart3 className="h-4 w-4 mr-2" />
              Calibration
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Participants</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{cycle.participantCount}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Self Reviews</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {cycle.selfReviewsCompleted}/{cycle.participantCount}
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
                <p className="text-sm text-gray-600">Manager Reviews</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {cycle.managerReviewsCompleted}/{cycle.participantCount}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overall Progress</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{cycle.completionRate}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <div className="border-b">
          <div className="flex gap-4 px-6">
            {['overview', 'participants', 'timeline', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <CardContent className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Cycle Configuration</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{cycle.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rating Scale:</span>
                      <span className="font-medium">{cycle.ratingScale.replace('_', '-')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Peer Reviews:</span>
                      <span className="font-medium">{cycle.enablePeerReviews ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Upward Reviews:</span>
                      <span className="font-medium">{cycle.enableUpwardReviews ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Calibration:</span>
                      <span className="font-medium">{cycle.requireCalibration ? 'Required' : 'Optional'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Compensation Link:</span>
                      <span className="font-medium">{cycle.linkToCompensation ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Completion Breakdown</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Self Reviews</span>
                        <span className="font-medium">
                          {Math.round((cycle.selfReviewsCompleted / cycle.participantCount) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(cycle.selfReviewsCompleted / cycle.participantCount) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Manager Reviews</span>
                        <span className="font-medium">
                          {Math.round((cycle.managerReviewsCompleted / cycle.participantCount) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full"
                          style={{ width: `${(cycle.managerReviewsCompleted / cycle.participantCount) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900">Action Required</h4>
                    <p className="text-sm text-yellow-800 mt-1">
                      87 participants have not completed their reviews. Consider sending reminders.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Participants Tab */}
          {activeTab === 'participants' && (
            <div>
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search participants..."
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Employee</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Department</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Manager</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Self Review</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Manager Review</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm text-gray-700">Last Activity</th>
                      <th className="text-right py-3 px-4 font-semibold text-sm text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {participants.map((participant) => (
                      <tr key={participant.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-900">{participant.name}</span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{participant.department}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{participant.manager}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(participant.selfReviewStatus)}`}>
                            {participant.selfReviewStatus.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(participant.managerReviewStatus)}`}>
                            {participant.managerReviewStatus.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{participant.lastActivity}</td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {timeline.map((phase, idx) => (
                <div key={idx} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        phase.status === 'COMPLETED'
                          ? 'bg-green-100'
                          : phase.status === 'IN_PROGRESS'
                          ? 'bg-yellow-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      {phase.status === 'COMPLETED' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : phase.status === 'IN_PROGRESS' ? (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <Calendar className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    {idx < timeline.length - 1 && <div className="w-0.5 h-16 bg-gray-200 my-2"></div>}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">{phase.phase}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(phase.status)}`}>
                        {phase.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {new Date(phase.start).toLocaleDateString()} - {new Date(phase.end).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Danger Zone</h3>
                <div className="border border-red-200 rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Publish Results</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Make review results visible to all participants. This action cannot be undone.
                      </p>
                    </div>
                    <Button variant="outline" onClick={handlePublishResults} className="border-red-300 text-red-700 hover:bg-red-50">
                      Publish
                    </Button>
                  </div>
                  <div className="border-t pt-4 flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Close Review Cycle</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Permanently close this review cycle. No further changes can be made.
                      </p>
                    </div>
                    <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                      Close Cycle
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
