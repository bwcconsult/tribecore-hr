import { Calendar, Briefcase, TrendingUp, Users, DollarSign, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Activity {
  id: string;
  date: string;
  type: string;
  description: string;
  payload?: {
    previousRole?: string;
    newRole?: string;
    previousDepartment?: string;
    newDepartment?: string;
    previousSalary?: number;
    newSalary?: number;
  };
}

interface EmploymentTimelineProps {
  activities: Activity[];
}

export default function EmploymentTimeline({ activities }: EmploymentTimelineProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'HIRED':
        return <Briefcase className="w-5 h-5 text-green-600" />;
      case 'ROLE_CHANGE':
      case 'PROMOTION':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'DEPARTMENT_TRANSFER':
        return <Users className="w-5 h-5 text-purple-600" />;
      case 'SALARY_CHANGE':
        return <DollarSign className="w-5 h-5 text-emerald-600" />;
      case 'FTE_CHANGE':
        return <Clock className="w-5 h-5 text-orange-600" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'HIRED':
        return 'bg-green-100 border-green-200';
      case 'ROLE_CHANGE':
      case 'PROMOTION':
        return 'bg-blue-100 border-blue-200';
      case 'DEPARTMENT_TRANSFER':
        return 'bg-purple-100 border-purple-200';
      case 'SALARY_CHANGE':
        return 'bg-emerald-100 border-emerald-200';
      case 'FTE_CHANGE':
        return 'bg-orange-100 border-orange-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  const formatActivityType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={activity.id} className="relative pl-8">
          {/* Timeline line */}
          {index < activities.length - 1 && (
            <div className="absolute left-2.5 top-8 bottom-0 w-0.5 bg-gray-200" />
          )}

          {/* Timeline dot */}
          <div className="absolute left-0 top-1.5">
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${getActivityColor(
                activity.type
              )}`}
            >
              {getActivityIcon(activity.type)}
            </div>
          </div>

          {/* Content */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-medium text-gray-900">
                  {formatActivityType(activity.type)}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
              </div>
              <span className="text-sm text-gray-500">
                {format(new Date(activity.date), 'dd MMM yyyy')}
              </span>
            </div>

            {/* Activity Details */}
            {activity.payload && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {activity.payload.previousRole && activity.payload.newRole && (
                    <div>
                      <span className="text-gray-600">Role: </span>
                      <span className="text-gray-400">{activity.payload.previousRole}</span>
                      <span className="mx-2">→</span>
                      <span className="text-gray-900 font-medium">{activity.payload.newRole}</span>
                    </div>
                  )}
                  {activity.payload.previousDepartment && activity.payload.newDepartment && (
                    <div>
                      <span className="text-gray-600">Department: </span>
                      <span className="text-gray-400">{activity.payload.previousDepartment}</span>
                      <span className="mx-2">→</span>
                      <span className="text-gray-900 font-medium">
                        {activity.payload.newDepartment}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      {activities.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No employment activities recorded yet</p>
        </div>
      )}
    </div>
  );
}
