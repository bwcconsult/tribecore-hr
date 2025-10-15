import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Plus, Briefcase, Users, TrendingUp, Edit2, Trash2, MapPin, DollarSign, FileText, GitBranch, Calendar, BarChart3, ArrowRight, Sparkles } from 'lucide-react';
import { recruitmentService, Job } from '../../services/recruitmentService';
import JobFormModal from '../../components/recruitment/JobFormModal';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../lib/utils';

export default function RecruitmentPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => recruitmentService.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: recruitmentService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete job');
    },
  });

  const handleAdd = () => {
    setSelectedJob(null);
    setIsModalOpen(true);
  };

  const handleEdit = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJob(null);
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recruitment & ATS</h1>
          <p className="text-gray-600 mt-1">Manage job postings and applications</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Post Job
        </Button>
      </div>

      {/* Feature Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-blue-500"
          onClick={() => navigate('/recruitment/requisitions')}
        >
          <CardContent className="p-6">
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
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-green-500"
          onClick={() => navigate('/recruitment/pipeline/all')}
        >
          <CardContent className="p-6">
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
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-purple-500"
          onClick={() => navigate('/recruitment/interviews')}
        >
          <CardContent className="p-6">
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
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-orange-500"
          onClick={() => navigate('/recruitment/analytics')}
        >
          <CardContent className="p-6">
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
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Open Positions', count: 0, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Total Applicants', count: 0, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
          { title: 'Interviews Scheduled', count: 0, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
          { title: 'Offers Extended', count: 0, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.count}</p>
                </div>
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Job Postings</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-gray-500">Loading...</p>
          ) : jobs?.data?.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No job postings</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by posting your first job.</p>
              <div className="mt-6">
                <Button onClick={handleAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Post Job
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs?.data?.map((job: Job) => (
                <div key={job.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          job.status === 'OPEN' 
                            ? 'bg-green-100 text-green-800'
                            : job.status === 'CLOSED'
                            ? 'bg-gray-100 text-gray-800'
                            : job.status === 'ON_HOLD'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {job.currency} {job.minSalary?.toLocaleString()} - {job.maxSalary?.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {job.openings} {job.openings === 1 ? 'opening' : 'openings'}
                        </span>
                      </div>
                      <p className="mt-3 text-sm text-gray-600 line-clamp-2">{job.description}</p>
                      <div className="mt-2 text-xs text-gray-400">
                        Posted on {formatDate(job.createdAt)}
                        {job.closingDate && ` • Closes on ${formatDate(job.closingDate)}`}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(job)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(job.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <JobFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        job={selectedJob}
      />
    </div>
  );
}
