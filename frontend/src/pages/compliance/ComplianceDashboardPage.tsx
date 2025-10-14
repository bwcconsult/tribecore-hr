import { Shield, CheckCircle, AlertCircle, Clock, FileText, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

export default function ComplianceDashboardPage() {
  const complianceScore = 87;

  const metrics = [
    { label: 'Policy Acknowledgments', value: '92%', icon: FileText, color: 'green' },
    { label: 'Training Completion', value: '85%', icon: Award, color: 'blue' },
    { label: 'Certifications Valid', value: '94%', icon: Shield, color: 'purple' },
    { label: 'Pending Actions', value: '12', icon: Clock, color: 'orange' },
  ];

  const policies = [
    { name: 'Data Protection Policy', acknowledged: 245, total: 250, percentage: 98 },
    { name: 'Code of Conduct', acknowledged: 238, total: 250, percentage: 95 },
    { name: 'Health & Safety Policy', acknowledged: 215, total: 250, percentage: 86 },
    { name: 'IT Security Policy', acknowledged: 228, total: 250, percentage: 91 },
  ];

  const upcomingRenewals = [
    { item: 'First Aid Certificate - John Smith', dueDate: '2024-11-15', daysLeft: 12, status: 'warning' },
    { item: 'Driving License - Sarah Jones', dueDate: '2024-11-20', daysLeft: 17, status: 'ok' },
    { item: 'Food Hygiene Certificate - Mike Brown', dueDate: '2024-11-05', daysLeft: 2, status: 'urgent' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Compliance Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor organizational compliance and risk</p>
      </div>

      {/* Compliance Score */}
      <Card className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm mb-2">Overall Compliance Score</p>
              <p className="text-6xl font-bold">{complianceScore}%</p>
              <p className="text-white/80 text-sm mt-2">Excellent compliance level</p>
            </div>
            <div className="text-right">
              <TrendingUp className="h-16 w-16 text-white/50 mb-2" />
              <p className="text-sm text-white/80">+3% from last month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                </div>
                <metric.icon className={`h-8 w-8 text-${metric.color}-600`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Policy Acknowledgments */}
      <Card>
        <CardHeader>
          <CardTitle>Policy Acknowledgments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {policies.map((policy) => (
              <div key={policy.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-900">{policy.name}</span>
                  <span className="text-gray-600">
                    {policy.acknowledged} / {policy.total} ({policy.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      policy.percentage >= 95
                        ? 'bg-green-600'
                        : policy.percentage >= 80
                        ? 'bg-yellow-600'
                        : 'bg-red-600'
                    }`}
                    style={{ width: `${policy.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Renewals */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Renewals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingRenewals.map((renewal, idx) => (
                <div key={idx} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{renewal.item}</p>
                    <p className="text-xs text-gray-600 mt-1">Due: {new Date(renewal.dueDate).toLocaleDateString()}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      renewal.status === 'urgent'
                        ? 'bg-red-100 text-red-800'
                        : renewal.status === 'warning'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {renewal.daysLeft} days
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Compliance Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { item: 'GDPR Data Protection', complete: true },
                { item: 'Employee Right to Work Checks', complete: true },
                { item: 'Health & Safety Risk Assessments', complete: true },
                { item: 'Fire Safety Training', complete: false },
                { item: 'Annual Compliance Audit', complete: false },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  {item.complete ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                  )}
                  <span className={item.complete ? 'text-gray-900' : 'text-gray-600'}>{item.item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
