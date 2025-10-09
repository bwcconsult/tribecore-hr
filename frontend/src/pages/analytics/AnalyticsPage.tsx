import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';

export default function AnalyticsPage() {
  const kpis = [
    { title: 'Headcount Growth', value: '+12%', icon: Users, color: 'text-blue-600' },
    { title: 'Attrition Rate', value: '8.5%', icon: TrendingUp, color: 'text-green-600' },
    { title: 'Avg. Salary', value: '$65k', icon: DollarSign, color: 'text-purple-600' },
    { title: 'Engagement Score', value: '78%', icon: Target, color: 'text-orange-600' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
        <p className="text-gray-600 mt-1">Workforce insights and predictive analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <p className={`text-2xl font-bold ${kpi.color} mt-2`}>{kpi.value}</p>
                </div>
                <kpi.icon className={`h-8 w-8 ${kpi.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Headcount Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Chart placeholder</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attrition Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Chart placeholder</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compensation Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Chart placeholder</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Diversity Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Chart placeholder</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
