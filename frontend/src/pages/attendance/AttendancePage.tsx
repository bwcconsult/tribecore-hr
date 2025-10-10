import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Clock, Plus, Edit2, Trash2, LogIn, LogOut, Calendar, User, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { attendanceService, Attendance } from '../../services/attendanceService';
import { employeeService } from '../../services/employeeService';
import AttendanceFormModal from '../../components/attendance/AttendanceFormModal';
import { toast } from 'react-hot-toast';
import { formatDate } from '../../lib/utils';

export default function AttendancePage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');

  const { data: attendanceRecords, isLoading } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => attendanceService.getAll(),
  });

  const { data: employeesData } = useQuery({
    queryKey: ['employees'],
    queryFn: () => employeeService.getAll({ limit: 100 }),
  });

  const deleteMutation = useMutation({
    mutationFn: attendanceService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Attendance record deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete attendance record');
    },
  });

  const clockInMutation = useMutation({
    mutationFn: attendanceService.clockIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Clocked in successfully!');
      setSelectedEmployee('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to clock in');
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => attendanceService.clockOut(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Clocked out successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to clock out');
    },
  });

  const handleClockIn = () => {
    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }
    clockInMutation.mutate({ employeeId: selectedEmployee });
  };

  const handleClockOut = (id: string) => {
    if (window.confirm('Are you sure you want to clock out?')) {
      clockOutMutation.mutate({ id });
    }
  };

  const handleAdd = () => {
    setSelectedAttendance(null);
    setIsModalOpen(true);
  };

  const handleEdit = (attendance: Attendance) => {
    setSelectedAttendance(attendance);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAttendance(null);
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      PRESENT: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      ABSENT: { color: 'bg-red-100 text-red-800', icon: XCircle },
      LATE: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
      HALF_DAY: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      ON_LEAVE: { color: 'bg-purple-100 text-purple-800', icon: Calendar },
      REMOTE: { color: 'bg-indigo-100 text-indigo-800', icon: User },
    };
    return badges[status] || badges.PRESENT;
  };

  // Calculate stats
  const calculateStats = () => {
    const records = attendanceRecords?.data || [];
    const today = new Date().toISOString().split('T')[0];
    
    const todayRecords = records.filter((r: Attendance) => 
      r.date.split('T')[0] === today
    );
    
    const present = todayRecords.filter((r: Attendance) => 
      r.status === 'PRESENT' || r.status === 'LATE' || r.status === 'REMOTE'
    ).length;
    
    const absent = todayRecords.filter((r: Attendance) => 
      r.status === 'ABSENT'
    ).length;
    
    const late = todayRecords.filter((r: Attendance) => 
      r.status === 'LATE'
    ).length;
    
    const activeClockIns = records.filter((r: Attendance) => 
      r.clockIn && !r.clockOut
    ).length;

    return { present, absent, late, activeClockIns };
  };

  const stats = calculateStats();
  const employees = employeesData?.data || [];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600 mt-1">Track employee attendance and clock-ins</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Record
        </Button>
      </div>

      {/* Clock In/Out Card */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Clock In/Out</h3>
          <div className="flex items-center gap-4">
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Employee...</option>
              {employees.map((emp: any) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} - {emp.department}
                </option>
              ))}
            </select>
            <Button
              onClick={handleClockIn}
              disabled={clockInMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Clock In
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        {[
          { title: 'Present Today', count: stats.present, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
          { title: 'Absent Today', count: stats.absent, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
          { title: 'Late Today', count: stats.late, icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { title: 'Active Clock-Ins', count: stats.activeClockIns, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
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

      {/* Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-gray-500">Loading...</p>
          ) : attendanceRecords?.data?.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records</h3>
              <p className="mt-1 text-sm text-gray-500">Start tracking attendance by clocking in or adding records.</p>
              <div className="mt-6">
                <Button onClick={handleAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Record
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left text-sm text-gray-500">
                    <th className="pb-3 font-medium">Employee</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Clock In</th>
                    <th className="pb-3 font-medium">Clock Out</th>
                    <th className="pb-3 font-medium">Hours</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords?.data?.map((record: Attendance) => {
                    const badge = getStatusBadge(record.status);
                    const StatusIcon = badge.icon;
                    
                    return (
                      <tr key={record.id} className="border-b last:border-0">
                        <td className="py-4 text-sm font-medium">
                          {record.employeeName || 'Unknown'}
                        </td>
                        <td className="py-4 text-sm">{formatDate(record.date)}</td>
                        <td className="py-4 text-sm">
                          {new Date(record.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-4 text-sm">
                          {record.clockOut ? (
                            new Date(record.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleClockOut(record.id)}
                              disabled={clockOutMutation.isPending}
                              className="text-red-600 hover:text-red-700"
                            >
                              <LogOut className="h-3 w-3 mr-1" />
                              Clock Out
                            </Button>
                          )}
                        </td>
                        <td className="py-4 text-sm font-semibold text-blue-600">
                          {record.workHours ? `${record.workHours.toFixed(2)}h` : '-'}
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {record.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(record)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(record.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AttendanceFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        attendance={selectedAttendance}
      />
    </div>
  );
}
