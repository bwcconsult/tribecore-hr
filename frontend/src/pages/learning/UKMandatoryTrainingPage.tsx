import { useState, useEffect } from 'react';
import { BookOpen, Clock, Award, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import * as learningService from '../../services/learningService';

export default function UKMandatoryTrainingPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await learningService.getMandatoryTraining();
      setCourses(data);
    } catch (error) {
      console.error('Failed to load mandatory training', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'ALL', label: 'All Courses', icon: BookOpen },
    { value: 'STATUTORY', label: 'Statutory Training', icon: Shield },
    { value: 'MANDATORY', label: 'Mandatory Training', icon: AlertCircle },
    { value: 'ROLE_SPECIFIC', label: 'Role-Specific', icon: Award },
  ];

  const filteredCourses = selectedCategory === 'ALL'
    ? courses
    : courses.filter(c => c.category === selectedCategory);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      STATUTORY: 'bg-red-100 text-red-700 border-red-200',
      MANDATORY: 'bg-orange-100 text-orange-700 border-orange-200',
      ROLE_SPECIFIC: 'bg-blue-100 text-blue-700 border-blue-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">UK Mandatory Training</h1>
        <p className="text-gray-600 mt-1">
          Statutory and mandatory training courses required for UK workplace compliance
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">UK Workplace Training Requirements</h3>
            <p className="text-sm text-blue-700 mb-3">
              These training courses are legally required or organizationally mandated based on UK legislation.
              Requirements vary based on industry, job roles, and company size.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="bg-white rounded-lg p-3">
                <p className="font-medium text-blue-900">Statutory Training</p>
                <p className="text-blue-600 text-xs">Legally mandated by UK law</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="font-medium text-blue-900">Mandatory Training</p>
                <p className="text-blue-600 text-xs">Required by organization policy</p>
              </div>
              <div className="bg-white rounded-lg p-3">
                <p className="font-medium text-blue-900">Role-Specific</p>
                <p className="text-blue-600 text-xs">Required for certain roles only</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              selectedCategory === cat.value
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading courses...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-200 overflow-hidden"
            >
              {/* Course Image */}
              {course.imageUrl && (
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-white opacity-50" />
                  </div>
                </div>
              )}

              <div className="p-6">
                {/* Category Badge */}
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border mb-3 ${getCategoryColor(course.category)}`}>
                  {course.category.replace('_', ' ')}
                </span>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">{course.description}</p>

                {/* Course Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{course.durationMinutes} minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Award className="w-4 h-4" />
                    <span>Valid for {course.validityMonths} months</span>
                  </div>
                  {course.requiresCertification && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Certificate provided</span>
                    </div>
                  )}
                </div>

                {/* Legislation */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-700 mb-2">UK Legislation:</p>
                  <div className="flex flex-wrap gap-1">
                    {course.ukLegislation?.slice(0, 2).map((law: string, idx: number) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {law.length > 30 ? law.substring(0, 30) + '...' : law}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Applicable To */}
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-700 mb-1">Applicable to:</p>
                  <p className="text-xs text-gray-600">{course.applicableTo?.join(', ')}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm">
                    View Details
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
                    Enroll
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredCourses.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No courses found in this category</p>
        </div>
      )}
    </div>
  );
}
