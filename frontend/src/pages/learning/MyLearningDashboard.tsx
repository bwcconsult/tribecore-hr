import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Award, Clock, TrendingUp, PlayCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import * as learningService from '../../services/learningService';

export default function MyLearningDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const employeeId = 'emp-1'; // Replace with actual logged-in employee

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await learningService.getEmployeeLearningDashboard(employeeId);
      setDashboard(data);
    } catch (error) {
      console.error('Failed to load learning dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your learning dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Learning</h1>
        <p className="text-gray-600 mt-1">Track your courses, progress, and achievements</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-100">Total Enrollments</p>
            <BookOpen className="w-5 h-5 text-blue-100" />
          </div>
          <p className="text-4xl font-bold">{dashboard?.totalEnrollments || 0}</p>
          <p className="text-sm text-blue-100 mt-1">Courses enrolled</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-green-100">Completed</p>
            <CheckCircle2 className="w-5 h-5 text-green-100" />
          </div>
          <p className="text-4xl font-bold">{dashboard?.completedCourses || 0}</p>
          <p className="text-sm text-green-100 mt-1">Courses completed</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-purple-100">In Progress</p>
            <TrendingUp className="w-5 h-5 text-purple-100" />
          </div>
          <p className="text-4xl font-bold">{dashboard?.inProgressCourses || 0}</p>
          <p className="text-sm text-purple-100 mt-1">Currently learning</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-orange-100">Learning Hours</p>
            <Clock className="w-5 h-5 text-orange-100" />
          </div>
          <p className="text-4xl font-bold">{dashboard?.totalLearningHours || 0}</p>
          <p className="text-sm text-orange-100 mt-1">Hours completed</p>
        </div>
      </div>

      {/* Mandatory Training Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Mandatory Training Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Completed</p>
                  <p className="text-sm text-green-600">{dashboard?.mandatoryTraining?.completed || 0} courses</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {dashboard?.mandatoryTraining?.completed || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Pending</p>
                  <p className="text-sm text-red-600">Action required</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-red-600">
                {dashboard?.mandatoryTraining?.pending || 0}
              </span>
            </div>

            {dashboard?.mandatoryTraining?.pending > 0 && (
              <button
                onClick={() => navigate('/learning/mandatory-training')}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Complete Mandatory Training
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Achievements
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Learning Champion</p>
                <p className="text-sm text-gray-600">Completed 10+ courses</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Compliance Master</p>
                <p className="text-sm text-gray-600">All mandatory training completed</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Dedicated Learner</p>
                <p className="text-sm text-gray-600">50+ hours of training</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Learning */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Continue Learning</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboard?.recentEnrollments?.slice(0, 3).map((enrollment: any) => (
            <div
              key={enrollment.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
              onClick={() => navigate(`/learning/course/${enrollment.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  enrollment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                  enrollment.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {enrollment.status.replace('_', ' ')}
                </span>
                {enrollment.isMandatory && (
                  <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    Mandatory
                  </span>
                )}
              </div>

              <h4 className="font-semibold text-gray-900 mb-2">{enrollment.course?.title}</h4>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Progress</span>
                  <span className="text-xs font-medium text-gray-900">
                    {Math.round(enrollment.progressPercentage || 0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${enrollment.progressPercentage || 0}%` }}
                  />
                </div>
              </div>

              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm flex items-center justify-center gap-2">
                <PlayCircle className="w-4 h-4" />
                {enrollment.status === 'COMPLETED' ? 'Review' : 'Continue'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* All Courses */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">All My Courses</h3>
          <button
            onClick={() => navigate('/learning')}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Browse All Courses →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-3 text-sm font-medium text-gray-700">Course</th>
                <th className="text-left p-3 text-sm font-medium text-gray-700">Status</th>
                <th className="text-left p-3 text-sm font-medium text-gray-700">Progress</th>
                <th className="text-left p-3 text-sm font-medium text-gray-700">Enrolled</th>
                <th className="text-left p-3 text-sm font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {dashboard?.recentEnrollments?.map((enrollment: any) => (
                <tr key={enrollment.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="p-3">
                    <div>
                      <p className="font-medium text-gray-900">{enrollment.course?.title}</p>
                      {enrollment.isMandatory && (
                        <span className="text-xs text-red-600">Mandatory</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      enrollment.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      enrollment.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {enrollment.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${enrollment.progressPercentage || 0}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {Math.round(enrollment.progressPercentage || 0)}%
                      </span>
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => navigate(`/learning/course/${enrollment.id}`)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {enrollment.status === 'COMPLETED' ? 'Review' : 'Continue'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
