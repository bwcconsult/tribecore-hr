import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Plus, BookOpen, Award, TrendingUp, Edit2, Trash2, Users, Clock, GraduationCap, Shield, BarChart3, ArrowRight } from 'lucide-react';
import { learningService, Course } from '../../services/learningService';
import CourseFormModal from '../../components/learning/CourseFormModal';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../lib/utils';

export default function LearningPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const { data: courses, isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => learningService.getAllCourses(),
  });

  const { data: enrollments } = useQuery({
    queryKey: ['course-enrollments'],
    queryFn: () => learningService.getAllEnrollments(),
  });

  const deleteMutation = useMutation({
    mutationFn: learningService.deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete course');
    },
  });

  const handleAdd = () => {
    setSelectedCourse(null);
    setIsModalOpen(true);
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCourse(null);
  };

  // Calculate stats
  const calculateStats = () => {
    const coursesList = courses?.data || [];
    const enrollmentsList = enrollments?.data || [];
    
    const activeCourses = coursesList.filter((c: Course) => c.status === 'ACTIVE').length;
    const completedEnrollments = enrollmentsList.filter((e: any) => e.status === 'COMPLETED').length;
    const inProgressEnrollments = enrollmentsList.filter((e: any) => e.status === 'IN_PROGRESS').length;
    const totalEnrollments = enrollmentsList.length;

    return { activeCourses, completedEnrollments, inProgressEnrollments, totalEnrollments };
  };

  const stats = calculateStats();

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'BEGINNER': return 'bg-green-100 text-green-800';
      case 'INTERMEDIATE': return 'bg-blue-100 text-blue-800';
      case 'ADVANCED': return 'bg-purple-100 text-purple-800';
      case 'EXPERT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning & Development</h1>
          <p className="text-gray-600 mt-1">Courses, training, and certifications</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div 
          onClick={() => navigate('/learning/my-learning')}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <GraduationCap className="w-12 h-12" />
            <ArrowRight className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">My Learning</h3>
          <p className="text-blue-100">Track your courses, progress, and achievements</p>
        </div>

        <div 
          onClick={() => navigate('/learning/mandatory-training')}
          className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <Shield className="w-12 h-12" />
            <ArrowRight className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">UK Mandatory Training</h3>
          <p className="text-red-100">View all 11 statutory and mandatory courses</p>
        </div>

        <div 
          onClick={() => navigate('/learning/compliance')}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1"
        >
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="w-12 h-12" />
            <ArrowRight className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Compliance Dashboard</h3>
          <p className="text-green-100">Monitor organization-wide training compliance</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Active Courses', count: stats.activeCourses, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Completed', count: stats.completedEnrollments, icon: Award, color: 'text-green-600', bg: 'bg-green-50' },
          { title: 'In Progress', count: stats.inProgressEnrollments, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
          { title: 'Total Enrollments', count: stats.totalEnrollments, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
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

      {/* Course Catalog */}
      <Card>
        <CardHeader>
          <CardTitle>Course Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-gray-500">Loading...</p>
          ) : courses?.data?.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No courses available</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first course.</p>
              <div className="mt-6">
                <Button onClick={handleAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses?.data?.map((course: Course) => (
                <div
                  key={course.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  {/* Course Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getLevelBadgeColor(course.level)}`}>
                        {course.level}
                      </span>
                      {course.certificateOffered && (
                        <GraduationCap className="h-4 w-4 text-purple-600" title="Certificate offered" />
                      )}
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                      course.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {course.status}
                    </span>
                  </div>

                  {/* Course Title & Description */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                  {/* Course Meta */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.category.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration} hours</span>
                    </div>
                    {course.instructor && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="h-4 w-4" />
                        <span>{course.instructor}</span>
                      </div>
                    )}
                    {course.currentEnrollments !== undefined && (
                      <div className="text-sm font-medium text-blue-600">
                        {course.currentEnrollments} enrolled
                        {course.maxEnrollments && ` / ${course.maxEnrollments} max`}
                      </div>
                    )}
                  </div>

                  {/* Course Footer */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-gray-500">
                      {course.format.replace('_', ' ')}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(course)}
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(course.id)}
                        disabled={deleteMutation.isPending}
                        title="Delete"
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

      <CourseFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        course={selectedCourse}
      />
    </div>
  );
}
