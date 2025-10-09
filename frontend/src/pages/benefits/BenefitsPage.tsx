import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Plus, Heart, Shield, Briefcase, GraduationCap } from 'lucide-react';

export default function BenefitsPage() {
  const benefits = [
    { name: 'Health Insurance', enrolled: 45, icon: Heart, color: 'text-red-600' },
    { name: 'Dental & Vision', enrolled: 38, icon: Shield, color: 'text-blue-600' },
    { name: '401(k) Retirement', enrolled: 42, icon: Briefcase, color: 'text-green-600' },
    { name: 'Education Allowance', enrolled: 15, icon: GraduationCap, color: 'text-purple-600' },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Benefits</h1>
          <p className="text-gray-600 mt-1">Manage employee benefits and enrollments</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Benefit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {benefits.map((benefit) => (
          <Card key={benefit.name} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 bg-gray-50 rounded-lg`}>
                  <benefit.icon className={`h-6 w-6 ${benefit.color}`} />
                </div>
                <span className="text-xs font-medium text-gray-500">{benefit.enrolled} enrolled</span>
              </div>
              <h3 className="font-medium text-gray-900">{benefit.name}</h3>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-gray-500">No recent enrollments</p>
        </CardContent>
      </Card>
    </div>
  );
}
