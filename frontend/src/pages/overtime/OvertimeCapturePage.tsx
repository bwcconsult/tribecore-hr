import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
  Clock,
  PauseCircle,
  PlayCircle,
  StopCircle,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Coffee,
  Moon,
  Sun,
  Activity,
  DollarSign,
  Info,
} from 'lucide-react';
import overtimeService, { Shift, FatigueScore } from '../../services/overtimeService';
import { toast } from 'react-hot-toast';

export default function OvertimeCapturePage() {
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [showBreakModal, setShowBreakModal] = useState(false);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch fatigue score
  const { data: fatigueScore } = useQuery({
    queryKey: ['fatigue-score', 'current-user'],
    queryFn: () => overtimeService.checkFatigue('current-user'),
  });

  // Fetch comp-time balance
  const { data: compTimeBalance } = useQuery({
    queryKey: ['comp-time-balance', 'current-user'],
    queryFn: () => overtimeService.getCompTimeBalance('current-user'),
  });

  // Clock in mutation
  const clockInMutation = useMutation({
    mutationFn: () => overtimeService.createShift({
      employeeId: 'current-user',
      organizationId: 'current-org',
      scheduledStart: new Date(),
      scheduledEnd: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
      actualStart: new Date(),
      source: 'MOBILE_APP',
      shiftType: getShiftType(),
    }),
    onSuccess: (data) => {
      if (data.success) {
        toast.success('Clocked in successfully!');
        queryClient.invalidateQueries({ queryKey: ['shifts'] });
      } else {
        toast.error(data.warnings?.join(', ') || 'Failed to clock in');
      }
    },
    onError: () => {
      toast.error('Failed to clock in');
    },
  });

  // Clock out mutation
  const clockOutMutation = useMutation({
    mutationFn: (shiftId: string) => overtimeService.punch(shiftId, {
      timestamp: new Date(),
    }),
    onSuccess: () => {
      toast.success('Clocked out successfully!');
      setActiveShift(null);
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });

  // Add break mutation
  const addBreakMutation = useMutation({
    mutationFn: (data: { shiftId: string; type: 'MEAL' | 'REST' | 'OTHER'; isPaid: boolean }) =>
      overtimeService.addBreak(data.shiftId, {
        start: new Date(),
        end: new Date(Date.now() + 30 * 60 * 1000), // 30 min default
        isPaid: data.isPaid,
        type: data.type,
      }),
    onSuccess: () => {
      toast.success('Break added successfully!');
      setShowBreakModal(false);
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    },
  });

  const getShiftType = () => {
    const hour = currentTime.getHours();
    if (hour >= 22 || hour < 6) return 'NIGHT';
    if (hour >= 18) return 'EVENING';
    return 'DAY';
  };

  const getFatigueColor = (level?: string) => {
    switch (level) {
      case 'LOW': return 'text-green-600 bg-green-50';
      case 'MODERATE': return 'text-yellow-600 bg-yellow-50';
      case 'HIGH': return 'text-orange-600 bg-orange-50';
      case 'CRITICAL': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getShiftIcon = () => {
    const type = getShiftType();
    if (type === 'NIGHT') return <Moon className="w-5 h-5" />;
    if (type === 'EVENING') return <Activity className="w-5 h-5" />;
    return <Sun className="w-5 h-5" />;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Overtime Clock</h1>
        <p className="text-gray-600 mt-1">Track your hours and manage overtime</p>
      </div>

      {/* Current Time & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Clock In/Out Card */}
        <Card className="lg:col-span-2">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Time</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {currentTime.toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getShiftIcon()}
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {getShiftType()} Shift
                </span>
              </div>
            </div>

            {/* Clock In/Out Buttons */}
            <div className="flex gap-4">
              {!activeShift ? (
                <Button
                  onClick={() => clockInMutation.mutate()}
                  disabled={clockInMutation.isPending}
                  className="flex-1 py-4 text-lg"
                >
                  {clockInMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Clocking In...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-6 h-6 mr-2" />
                      Clock In
                    </>
                  )}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => setShowBreakModal(true)}
                    variant="outline"
                    className="flex-1 py-4"
                  >
                    <Coffee className="w-5 h-5 mr-2" />
                    Add Break
                  </Button>
                  <Button
                    onClick={() => clockOutMutation.mutate(activeShift.id)}
                    disabled={clockOutMutation.isPending}
                    className="flex-1 py-4 text-lg bg-red-600 hover:bg-red-700"
                  >
                    <StopCircle className="w-6 h-6 mr-2" />
                    Clock Out
                  </Button>
                </>
              )}
            </div>

            {/* Active Shift Info */}
            {activeShift && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-green-700">Active Shift</span>
                  </div>
                  <span className="text-sm text-green-600">
                    Started at {new Date(activeShift.scheduledStart).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fatigue Score Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Fatigue Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            {fatigueScore ? (
              <>
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold mb-4 ${getFatigueColor(fatigueScore.level)}`}>
                  {fatigueScore.level}
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Score</span>
                    <span className="text-2xl font-bold text-gray-900">{fatigueScore.score}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        fatigueScore.score < 30 ? 'bg-green-500' :
                        fatigueScore.score < 60 ? 'bg-yellow-500' :
                        fatigueScore.score < 85 ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${fatigueScore.score}%` }}
                    ></div>
                  </div>
                </div>

                {/* Factors */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Hours Worked (7d)</span>
                    <span className="font-medium">{fatigueScore.factors.hoursWorked}h</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Night Shifts</span>
                    <span className="font-medium">{fatigueScore.factors.nightShifts}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Consecutive Days</span>
                    <span className="font-medium">{fatigueScore.factors.consecutiveDays}</span>
                  </div>
                </div>

                {/* Recommendations */}
                {fatigueScore.recommendations.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-semibold text-blue-700 mb-2">Recommendations:</p>
                    {fatigueScore.recommendations.slice(0, 2).map((rec, idx) => (
                      <p key={idx} className="text-xs text-blue-600">• {rec}</p>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">Loading fatigue data...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">42.5h</p>
                <p className="text-xs text-gray-500 mt-1">5h overtime</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">OT This Month</p>
                <p className="text-2xl font-bold text-gray-900">18.5h</p>
                <p className="text-xs text-green-600 mt-1">$462.50</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Comp-Time</p>
                <p className="text-2xl font-bold text-gray-900">
                  {compTimeBalance?.balanceHours || 0}h
                </p>
                <p className="text-xs text-gray-500 mt-1">Available</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Shifts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Shifts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((_, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Day Shift</p>
                    <p className="text-sm text-gray-600">
                      Dec {15 - idx}, 2024 • 8:00 AM - 5:30 PM
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">9.5h</p>
                    <p className="text-xs text-green-600">+1.5h OT</p>
                  </div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Approved
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Break Modal */}
      {showBreakModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add Break</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Break Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="py-3"
                      onClick={() => {
                        if (activeShift) {
                          addBreakMutation.mutate({
                            shiftId: activeShift.id,
                            type: 'MEAL',
                            isPaid: false,
                          });
                        }
                      }}
                    >
                      <Coffee className="w-4 h-4 mr-2" />
                      Meal (30 min)
                    </Button>
                    <Button
                      variant="outline"
                      className="py-3"
                      onClick={() => {
                        if (activeShift) {
                          addBreakMutation.mutate({
                            shiftId: activeShift.id,
                            type: 'REST',
                            isPaid: true,
                          });
                        }
                      }}
                    >
                      <PauseCircle className="w-4 h-4 mr-2" />
                      Rest (15 min)
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowBreakModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
