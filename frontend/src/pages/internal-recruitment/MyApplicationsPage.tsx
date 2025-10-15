import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Briefcase,
} from 'lucide-react';
import { axiosInstance } from '../../lib/axios';

export default function MyApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const employeeId = 'emp-123'; // Replace with actual employee ID
      const response = await axiosInstance.get(
        `/api/v1/internal-recruitment/applications/employee/${employeeId}`
      );
      setApplications(response.data);
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      SUBMITTED: Clock,
      MANAGER_REVIEW: Clock,
      MANAGER_APPROVED: CheckCircle,
      MANAGER_DECLINED: XCircle,
      HR_REVIEW: Clock,
      INTERVIEW_SCHEDULED: FileText,
      TRANSFERRED: CheckCircle,
      REJECTED: XCircle,
      WITHDRAWN: AlertCircle,
    };
    return icons[status] || Clock;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SUBMITTED: 'bg-blue-100 text-blue-700',
      MANAGER_REVIEW: 'bg-yellow-100 text-yellow-700',
      MANAGER_APPROVED: 'bg-green-100 text-green-700',
      MANAGER_DECLINED: 'bg-red-100 text-red-700',
      HR_REVIEW: 'bg-purple-100 text-purple-700',
      INTERVIEW_SCHEDULED: 'bg-indigo-100 text-indigo-700',
      TRANSFERRED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
      WITHDRAWN: 'bg-gray-100 text-gray-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600">Track your internal job applications</p>
        </div>
        <button
          onClick={() => navigate('/internal-recruitment/jobs')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Browse Opportunities
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-1">Total Applications</p>
          <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-1">In Progress</p>
          <p className="text-3xl font-bold text-blue-600">
            {applications.filter(a => 
              ['SUBMITTED', 'MANAGER_REVIEW', 'HR_REVIEW', 'INTERVIEW_SCHEDULED'].includes(a.status)
            ).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-1">Approved</p>
          <p className="text-3xl font-bold text-green-600">
            {applications.filter(a => a.status === 'MANAGER_APPROVED').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="text-sm text-gray-600 mb-1">Transferred</p>
          <p className="text-3xl font-bold text-purple-600">
            {applications.filter(a => a.status === 'TRANSFERRED').length}
          </p>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">All Applications</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {applications.length === 0 ? (
            <div className="p-12 text-center">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">You haven't applied to any internal positions yet</p>
              <button
                onClick={() => navigate('/internal-recruitment/jobs')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Explore Opportunities
              </button>
            </div>
          ) : (
            applications.map((app) => {
              const StatusIcon = getStatusIcon(app.status);
              return (
                <div key={app.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          Application #{app.applicationNumber}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(app.status)}`}>
                          <StatusIcon className="w-3 h-3" />
                          {app.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-2">
                        Position: <span className="font-semibold">{app.jobPostingId}</span>
                      </p>
                      
                      <p className="text-sm text-gray-500">
                        Applied: {new Date(app.appliedDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>

                      {/* Timeline */}
                      {app.timeline && app.timeline.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Application Timeline:</p>
                          <div className="space-y-2">
                            {app.timeline.slice(-3).map((event: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                <span className="font-medium">{event.stage}</span>
                                <span>•</span>
                                <span>{new Date(event.date).toLocaleDateString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => navigate(`/internal-recruitment/applications/${app.id}`)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
