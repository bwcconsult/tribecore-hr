import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function OnboardingPage() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Onboarding</h1>
          <p className="text-gray-600 mt-1">Manage employee onboarding workflows</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Start Onboarding
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'In Progress', count: 5, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Completed', count: 23, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { title: 'Overdue', count: 2, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
          { title: 'Avg Completion', count: '12 days', icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
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
          <CardTitle>Active Onboarding</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-gray-500">No active onboarding workflows</p>
        </CardContent>
      </Card>
    </div>
  );
}
