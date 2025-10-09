import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Plus } from 'lucide-react';

export default function PerformancePage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Management</h1>
          <p className="text-gray-600 mt-1">Track and manage employee performance reviews</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Review
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-gray-500">No performance reviews found</p>
        </CardContent>
      </Card>
    </div>
  );
}
