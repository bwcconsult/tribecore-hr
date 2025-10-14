import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { BarChart3, TrendingUp, Users, DollarSign, Award, Target, Download } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';

export default function ISO30414Dashboard() {
  const { user } = useAuthStore();

  const handleGenerateReport = () => {
    toast.success('Generating ISO 30414 Board Report...', {
      duration: 3000,
      icon: '📊',
    });
    // Backend integration will download PDF report
  };

  //Mock dashboard data (backend integration pending)
  const dashboardData = {
    summary: { totalMetrics: 31, verificationRate: 87.5, lastUpdated: new Date().toISOString() },
  };
  
  const metrics: any = {
    COSTS: [],
    PRODUCTIVITY: [],
    TURNOVER: [],
    DIVERSITY: [],
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          ISO 30414 Analytics
        </h1>
        <p className="text-gray-600 mt-1">Human Capital Reporting & Board Metrics</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Metrics</p>
                <p className="text-2xl font-bold">{dashboardData?.summary?.totalMetrics || 0}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Verification Rate</p>
                <p className="text-2xl font-bold">
                  {dashboardData?.summary?.verificationRate?.toFixed(1) || 0}%
                </p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-sm font-medium">
                  {dashboardData?.summary?.lastUpdated 
                    ? new Date(dashboardData.summary.lastUpdated).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Button onClick={handleGenerateReport}>
                <Download className="h-4 w-4 mr-2" />
                Generate Board Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metric Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Costs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.COSTS?.map((metric: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">{metric.name}</span>
                  <span className="text-lg font-bold">
                    {metric.value?.toLocaleString()} {metric.unit}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Productivity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Productivity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.PRODUCTIVITY?.map((metric: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">{metric.name}</span>
                  <span className="text-lg font-bold">
                    {metric.value?.toLocaleString()} {metric.unit}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Turnover */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Turnover
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.TURNOVER?.map((metric: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">{metric.name}</span>
                  <div className="text-right">
                    <span className="text-lg font-bold">{metric.value}%</span>
                    {metric.change && (
                      <span className={`text-xs ml-2 ${metric.change > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {metric.change > 0 ? '↑' : '↓'} {Math.abs(metric.change)}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Diversity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Diversity & Inclusion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.DIVERSITY?.map((metric: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">{metric.name}</span>
                  <span className="text-lg font-bold">{metric.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
