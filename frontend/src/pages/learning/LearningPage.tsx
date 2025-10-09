import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Plus, BookOpen, Award, TrendingUp } from 'lucide-react';

export default function LearningPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Learning & Development</h1>
          <p className="text-gray-600 mt-1">Courses, training, and certifications</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'Active Courses', count: 0, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Completed', count: 0, icon: Award, color: 'text-green-600', bg: 'bg-green-50' },
          { title: 'In Progress', count: 0, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
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
          <CardTitle>Available Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-gray-500">No courses available</p>
        </CardContent>
      </Card>
    </div>
  );
}
