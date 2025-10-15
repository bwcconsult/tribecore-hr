import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Users, Target, TrendingUp, Plus, Filter, FileText, GitBranch, Calendar, BarChart3, ArrowRight, Sparkles } from 'lucide-react';
import { axiosInstance } from '../../lib/axios';

export default function RecruitmentDashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [appsRes, metricsRes] = await Promise.all([
        axiosInstance.get('/recruitment/applications', { params: { organizationId: 'ORG001' } }),
        axiosInstance.get('/recruitment/pipeline/metrics', { params: { organizationId: 'ORG001' } })
      ]);
      setApplications(appsRes.data);
      setMetrics(metricsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stages = [
    { key: 'NEW', label: 'New', color: 'bg-gray-100 text-gray-700' },
    { key: 'SCREENING', label: 'Screening', color: 'bg-blue-100 text-blue-700' },
    { key: 'HM_SCREEN', label: 'HM Screen', color: 'bg-purple-100 text-purple-700' },
    { key: 'INTERVIEW', label: 'Interview', color: 'bg-orange-100 text-orange-700' },
    { key: 'OFFER', label: 'Offer', color: 'bg-green-100 text-green-700' },
    { key: 'HIRED', label: 'Hired', color: 'bg-emerald-100 text-emerald-700' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Briefcase className="w-8 h-8 text-blue-600" />
              Recruitment Pipeline
            </h1>
            <p className="text-gray-600 mt-1">Applicant tracking from requisition to hire</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/recruitment/requisitions/new')}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
            >
              <Plus className="w-5 h-5" />
              New Requisition
            </button>
            <button
              onClick={() => navigate('/recruitment/jobs/new')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Post Job
            </button>
          </div>
        </div>
      </div>

      {/* Feature Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div 
          className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500"
          onClick={() => navigate('/recruitment/requisitions')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Requisitions</h3>
          <p className="text-sm text-gray-600">Create & approve job requisitions with multi-step workflow</p>
          <div className="mt-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span className="text-xs text-gray-500">Dynamic Approvals • SLA Tracking</span>
          </div>
        </div>

        <div 
          className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-green-500"
          onClick={() => navigate('/recruitment/pipeline/all')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <GitBranch className="h-6 w-6 text-green-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Pipeline (Kanban)</h3>
          <p className="text-sm text-gray-600">Drag & drop candidates through 9-stage hiring pipeline</p>
          <div className="mt-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span className="text-xs text-gray-500">AI Scoring • Flags • Tags</span>
          </div>
        </div>

        <div 
          className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-purple-500"
          onClick={() => navigate('/recruitment/interviews')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-50 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Interviews</h3>
          <p className="text-sm text-gray-600">Schedule interviews & submit scorecards with SLA reminders</p>
          <div className="mt-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span className="text-xs text-gray-500">Panel Scheduling • Scorecards</span>
          </div>
        </div>

        <div 
          className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-orange-500"
          onClick={() => navigate('/recruitment/analytics')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-50 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <ArrowRight className="h-5 w-5 text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Analytics</h3>
          <p className="text-sm text-gray-600">Real-time metrics, funnels, time-to-hire & source effectiveness</p>
          <div className="mt-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            <span className="text-xs text-gray-500">15+ Metrics • Charts • Insights</span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Applications</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{metrics?.total || 0}</p>
            </div>
            <Users className="w-10 h-10 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Jobs</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">12</p>
            </div>
            <Target className="w-10 h-10 text-purple-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Interviews This Week</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">8</p>
            </div>
            <Users className="w-10 h-10 text-orange-600" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Offers Pending</p>
              <p className="text-3xl font-bold text-green-600 mt-1">3</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-600" />
          </div>
        </div>
      </div>

      {/* Pipeline Kanban */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Pipeline Overview</h3>
        <div className="grid grid-cols-6 gap-4">
          {stages.map(stage => (
            <div key={stage.key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">{stage.label}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${stage.color}`}>
                  {metrics?.byStage?.[stage.key] || 0}
                </span>
              </div>
              <div className="space-y-2">
                {applications
                  .filter(app => app.stage === stage.key)
                  .slice(0, 3)
                  .map(app => (
                    <div
                      key={app.id}
                      onClick={() => navigate(`/recruitment/applications/${app.id}`)}
                      className="bg-gray-50 p-2 rounded cursor-pointer hover:bg-gray-100"
                    >
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {app.candidate?.firstName} {app.candidate?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{app.jobPosting?.title}</p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion Rates */}
      {metrics?.conversionRates && (
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Conversion Rates</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(metrics.conversionRates).map(([key, value]) => (
              <div key={key} className="text-center">
                <p className="text-2xl font-bold text-blue-600">{value as string}</p>
                <p className="text-xs text-gray-600 mt-1">{key.replace(/_/g, ' → ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
