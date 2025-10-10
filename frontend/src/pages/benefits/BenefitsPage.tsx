import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Plus, Heart, Shield, Briefcase, GraduationCap, Edit2, Trash2, Users, DollarSign, CheckCircle } from 'lucide-react';
import { benefitsService, BenefitEnrollment } from '../../services/benefitsService';
import EnrollmentFormModal from '../../components/benefits/EnrollmentFormModal';
import { toast } from 'react-hot-toast';
import { formatDate, formatCurrency } from '../../lib/utils';

export default function BenefitsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<BenefitEnrollment | null>(null);

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['benefit-enrollments'],
    queryFn: () => benefitsService.getAllEnrollments(),
  });

  const { data: plansData } = useQuery({
    queryKey: ['benefit-plans'],
    queryFn: () => benefitsService.getAllPlans(),
  });

  const deleteMutation = useMutation({
    mutationFn: benefitsService.deleteEnrollment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefit-enrollments'] });
      toast.success('Enrollment deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete enrollment');
    },
  });

  const handleAdd = () => {
    setSelectedEnrollment(null);
    setIsModalOpen(true);
  };

  const handleEdit = (enrollment: BenefitEnrollment) => {
    setSelectedEnrollment(enrollment);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this enrollment?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEnrollment(null);
  };

  // Calculate stats
  const calculateStats = () => {
    const enrollmentsList = enrollments?.data || [];
    const plans = plansData?.data || [];
    
    const totalEnrollments = enrollmentsList.length;
    const activeEnrollments = enrollmentsList.filter((e: BenefitEnrollment) => e.status === 'ACTIVE').length;
    const totalCost = enrollmentsList.reduce((sum: number, e: BenefitEnrollment) => sum + (e.totalCost || 0), 0);
    const totalPlans = plans.length;

    return { totalEnrollments, activeEnrollments, totalCost, totalPlans };
  };

  const stats = calculateStats();
  const plans = plansData?.data || [];

  // Group enrollments by plan type
  const getEnrollmentsByType = () => {
    const enrollmentsList = enrollments?.data || [];
    const typeMap: { [key: string]: { count: number; icon: any; color: string } } = {
      'HEALTH': { count: 0, icon: Heart, color: 'text-red-600' },
      'DENTAL': { count: 0, icon: Shield, color: 'text-blue-600' },
      'RETIREMENT': { count: 0, icon: Briefcase, color: 'text-green-600' },
      'EDUCATION': { count: 0, icon: GraduationCap, color: 'text-purple-600' },
    };

    enrollmentsList.forEach((enrollment: BenefitEnrollment) => {
      const plan = plans.find((p: any) => p.id === enrollment.benefitPlanId);
      if (plan && typeMap[plan.type]) {
        typeMap[plan.type].count++;
      }
    });

    return Object.entries(typeMap).map(([type, data]) => ({
      name: type.charAt(0) + type.slice(1).toLowerCase(),
      enrolled: data.count,
      icon: data.icon,
      color: data.color,
    }));
  };

  const benefitTypes = getEnrollmentsByType();

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Benefits</h1>
          <p className="text-gray-600 mt-1">Manage employee benefits and enrollments</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Enroll Employee
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Total Enrollments', value: stats.totalEnrollments, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { title: 'Active Enrollments', value: stats.activeEnrollments, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { title: 'Total Monthly Cost', value: `$${stats.totalCost.toFixed(2)}`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
          { title: 'Available Plans', value: stats.totalPlans, icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Benefit Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {benefitTypes.map((benefit) => (
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

      {/* Enrollments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Benefit Enrollments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-gray-500">Loading...</p>
          ) : enrollments?.data?.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No enrollments</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by enrolling an employee in a benefit plan.</p>
              <div className="mt-6">
                <Button onClick={handleAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Enroll Employee
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm text-gray-500">
                    <th className="pb-3 font-medium">Employee</th>
                    <th className="pb-3 font-medium">Benefit Plan</th>
                    <th className="pb-3 font-medium">Coverage</th>
                    <th className="pb-3 font-medium">Effective Date</th>
                    <th className="pb-3 font-medium">Employee Cost</th>
                    <th className="pb-3 font-medium">Employer Cost</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments?.data?.map((enrollment: BenefitEnrollment) => (
                    <tr key={enrollment.id} className="border-b last:border-0">
                      <td className="py-4 text-sm font-medium">
                        {enrollment.employeeName || 'Unknown'}
                      </td>
                      <td className="py-4 text-sm">
                        {enrollment.benefitPlanName || 'Unknown Plan'}
                      </td>
                      <td className="py-4 text-sm">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                          {enrollment.coverage.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-4 text-sm">{formatDate(enrollment.effectiveDate)}</td>
                      <td className="py-4 text-sm text-red-600">
                        ${enrollment.employeeContribution.toFixed(2)}
                      </td>
                      <td className="py-4 text-sm text-green-600">
                        ${enrollment.employerContribution.toFixed(2)}
                      </td>
                      <td className="py-4 text-sm font-semibold text-gray-900">
                        ${enrollment.totalCost.toFixed(2)}
                      </td>
                      <td className="py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          enrollment.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          enrollment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(enrollment)}
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(enrollment.id)}
                            disabled={deleteMutation.isPending}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <EnrollmentFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        enrollment={selectedEnrollment}
      />
    </div>
  );
}
