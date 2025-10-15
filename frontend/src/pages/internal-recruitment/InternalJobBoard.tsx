import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  Clock,
  TrendingUp,
  Users,
  Search,
  Filter,
  ArrowRight,
  Star,
  Building2,
} from 'lucide-react';
import { axiosInstance } from '../../lib/axios';
import { toast } from 'react-hot-toast';

export default function InternalJobBoard() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedType, setSelectedType] = useState('');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const orgId = 'org-123'; // Replace with actual org ID
      const response = await axiosInstance.get(
        `/api/v1/internal-recruitment/jobs/organization/${orgId}`,
        {
          params: {
            status: 'OPEN',
            ...(selectedDepartment && { departmentId: selectedDepartment }),
          },
        }
      );
      setJobs(response.data);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load internal opportunities');
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !selectedType || job.jobType === selectedType;
    return matchesSearch && matchesType;
  });

  const getJobTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      PROMOTION: 'bg-purple-100 text-purple-700',
      TRANSFER: 'bg-blue-100 text-blue-700',
      LATERAL_MOVE: 'bg-green-100 text-green-700',
      DEVELOPMENTAL: 'bg-yellow-100 text-yellow-700',
      TEMPORARY: 'bg-gray-100 text-gray-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const getJobTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      PROMOTION: TrendingUp,
      TRANSFER: ArrowRight,
      LATERAL_MOVE: ArrowRight,
      DEVELOPMENTAL: Users,
      TEMPORARY: Clock,
    };
    return icons[type] || Briefcase;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Internal Opportunities</h1>
        <p className="text-gray-600">Explore career growth opportunities within the organization</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Open Positions</p>
              <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="bg-purple-50 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Promotions</p>
              <p className="text-2xl font-bold text-gray-900">
                {jobs.filter(j => j.jobType === 'PROMOTION').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="bg-green-50 p-3 rounded-lg">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Departments</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(jobs.map(j => j.departmentId)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-50 p-3 rounded-lg">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Urgent</p>
              <p className="text-2xl font-bold text-gray-900">
                {jobs.filter(j => j.isUrgent).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search opportunities..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="PROMOTION">Promotions</option>
            <option value="TRANSFER">Transfers</option>
            <option value="LATERAL_MOVE">Lateral Moves</option>
            <option value="DEVELOPMENTAL">Developmental</option>
            <option value="TEMPORARY">Temporary</option>
          </select>

          <button
            onClick={loadJobs}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Filter className="w-5 h-5" />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Job Listings */}
      <div className="grid grid-cols-1 gap-6">
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No opportunities match your criteria</p>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const TypeIcon = getJobTypeIcon(job.jobType);
            return (
              <div
                key={job.id}
                className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-blue-500"
                onClick={() => navigate(`/internal-recruitment/jobs/${job.id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{job.jobTitle}</h3>
                      {job.isUrgent && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                          URGENT
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getJobTypeColor(job.jobType)}`}>
                        <TypeIcon className="w-3 h-3" />
                        {job.jobType.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{job.description.substring(0, 200)}...</p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        {job.departmentName}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {job.locationName}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Posted {new Date(job.postedDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {job.applicationCount} applicants
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/internal-recruitment/apply/${job.id}`);
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      Apply Now
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    {job.salaryMin && job.salaryMax && (
                      <p className="text-sm text-gray-600 mt-2">
                        £{job.salaryMin.toLocaleString()} - £{job.salaryMax.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Skills */}
                {job.requiredSkills && job.requiredSkills.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Required Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills.slice(0, 5).map((skill: any, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                        >
                          {skill.skillName}
                        </span>
                      ))}
                      {job.requiredSkills.length > 5 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          +{job.requiredSkills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
