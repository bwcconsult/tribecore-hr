import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Play, Pause, Plus } from 'lucide-react';

export default function TimeTrackingPage() {
  const [isTracking, setIsTracking] = useState(false);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Time Tracking</h1>
          <p className="text-gray-600 mt-1">Track time spent on projects and tasks</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Manual Entry
        </Button>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <input
                type="text"
                placeholder="What are you working on?"
                className="w-full text-lg border-0 focus:outline-none focus:ring-0"
              />
            </div>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-mono font-bold text-gray-900">00:00:00</span>
              <Button
                size="lg"
                onClick={() => setIsTracking(!isTracking)}
                className={isTracking ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                {isTracking ? (
                  <>
                    <Pause className="h-5 w-5 mr-2" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Start
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {[
          { title: 'Today', hours: '0h', color: 'text-blue-600' },
          { title: 'This Week', hours: '0h', color: 'text-green-600' },
          { title: 'This Month', hours: '0h', color: 'text-purple-600' },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className={`text-3xl font-bold ${stat.color} mt-2`}>{stat.hours}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-gray-500">No time entries yet</p>
        </CardContent>
      </Card>
    </div>
  );
}
