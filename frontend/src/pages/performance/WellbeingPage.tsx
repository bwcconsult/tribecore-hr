import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
  Heart,
  TrendingUp,
  Smile,
  Zap,
  Scale,
  Calendar,
  Plus,
  MessageSquare,
} from 'lucide-react';
import { performanceEnhancedService } from '../../services/performanceEnhancedService';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';

export default function WellbeingPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Check-in form state
  const [happiness, setHappiness] = useState(7);
  const [motivation, setMotivation] = useState(7);
  const [workLifeBalance, setWorkLifeBalance] = useState(7);
  const [comment, setComment] = useState('');
  const [concerns, setConcerns] = useState<string[]>([]);
  const [positives, setPositives] = useState<string[]>([]);
  const [requestsSupport, setRequestsSupport] = useState(false);
  const [supportNeeded, setSupportNeeded] = useState('');

  const { data: checks, isLoading: loadingChecks } = useQuery({
    queryKey: ['wellbeing-checks', user?.id],
    queryFn: () => performanceEnhancedService.wellbeing.getChecks(user?.id || '', 10),
    enabled: !!user?.id,
  });

  const { data: trend } = useQuery({
    queryKey: ['wellbeing-trend', user?.id],
    queryFn: () => performanceEnhancedService.wellbeing.getTrend(user?.id || ''),
    enabled: !!user?.id,
  });

  const createCheckIn = useMutation({
    mutationFn: (data: any) => performanceEnhancedService.wellbeing.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellbeing-checks'] });
      queryClient.invalidateQueries({ queryKey: ['wellbeing-trend'] });
      toast.success('Wellbeing check-in submitted successfully!');
      resetForm();
    },
    onError: () => {
      toast.error('Failed to submit check-in');
    },
  });

  const resetForm = () => {
    setHappiness(7);
    setMotivation(7);
    setWorkLifeBalance(7);
    setComment('');
    setConcerns([]);
    setPositives([]);
    setRequestsSupport(false);
    setSupportNeeded('');
  };

  const handleSubmit = () => {
    if (!user?.id) return;

    createCheckIn.mutate({
      userId: user.id,
      happiness,
      motivation,
      workLifeBalance,
      comment,
      concerns,
      positives,
      requestsSupport,
      supportNeeded,
      visibility: 'VISIBLE_TO_MANAGER',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return 'Great';
    if (score >= 5) return 'Okay';
    return 'Needs Attention';
  };

  const latestCheck = checks?.[0];
  const averageHappiness = checks
    ? checks.reduce((sum: number, c: any) => sum + c.happiness, 0) / checks.length
    : 0;
  const averageMotivation = checks
    ? checks.reduce((sum: number, c: any) => sum + c.motivation, 0) / checks.length
    : 0;
  const averageBalance = checks
    ? checks.reduce((sum: number, c: any) => sum + c.workLifeBalance, 0) / checks.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Wellbeing Check-in</h1>
          <p className="text-gray-600 mt-1">Track your happiness, motivation, and work-life balance</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/performance')}>
          Back to Performance
        </Button>
      </div>

      {/* Latest Stats */}
      {latestCheck && (
        <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Your Latest Check-in</h3>
              <span className="text-sm text-gray-600">
                {new Date(latestCheck.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <Smile className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-900">{latestCheck.happiness}/10</p>
                <p className="text-sm text-gray-600">Happiness</p>
              </div>
              <div className="text-center">
                <Zap className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-900">{latestCheck.motivation}/10</p>
                <p className="text-sm text-gray-600">Motivation</p>
              </div>
              <div className="text-center">
                <Scale className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-3xl font-bold text-gray-900">{latestCheck.workLifeBalance}/10</p>
                <p className="text-sm text-gray-600">Work-Life Balance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Average Stats */}
      {checks && checks.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg. Happiness</p>
                  <p className={`text-3xl font-bold ${getScoreColor(averageHappiness)}`}>
                    {averageHappiness.toFixed(1)}/10
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{getScoreLabel(averageHappiness)}</p>
                </div>
                <div className="bg-pink-50 p-3 rounded-full">
                  <Smile className="w-6 h-6 text-pink-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg. Motivation</p>
                  <p className={`text-3xl font-bold ${getScoreColor(averageMotivation)}`}>
                    {averageMotivation.toFixed(1)}/10
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{getScoreLabel(averageMotivation)}</p>
                </div>
                <div className="bg-orange-50 p-3 rounded-full">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Avg. Balance</p>
                  <p className={`text-3xl font-bold ${getScoreColor(averageBalance)}`}>
                    {averageBalance.toFixed(1)}/10
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{getScoreLabel(averageBalance)}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-full">
                  <Scale className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Check-in Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-600" />
            New Check-in
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Happiness Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Smile className="w-4 h-4 text-pink-500" />
                Happiness
              </label>
              <span className={`text-2xl font-bold ${getScoreColor(happiness)}`}>
                {happiness}/10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={happiness}
              onChange={(e) => setHappiness(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Not happy</span>
              <span>Very happy</span>
            </div>
          </div>

          {/* Motivation Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-500" />
                Motivation
              </label>
              <span className={`text-2xl font-bold ${getScoreColor(motivation)}`}>
                {motivation}/10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={motivation}
              onChange={(e) => setMotivation(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Not motivated</span>
              <span>Highly motivated</span>
            </div>
          </div>

          {/* Work-Life Balance Slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Scale className="w-4 h-4 text-blue-500" />
                Work-Life Balance
              </label>
              <span className={`text-2xl font-bold ${getScoreColor(workLifeBalance)}`}>
                {workLifeBalance}/10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={workLifeBalance}
              onChange={(e) => setWorkLifeBalance(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Poor balance</span>
              <span>Great balance</span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4" />
              Comment (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How are you feeling? Any thoughts you want to share?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
            />
          </div>

          {/* Request Support */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="requestSupport"
              checked={requestsSupport}
              onChange={(e) => setRequestsSupport(e.target.checked)}
              className="mt-1"
            />
            <div className="flex-1">
              <label htmlFor="requestSupport" className="text-sm font-medium text-gray-700 cursor-pointer">
                I would like to discuss this with my manager
              </label>
              {requestsSupport && (
                <textarea
                  value={supportNeeded}
                  onChange={(e) => setSupportNeeded(e.target.value)}
                  placeholder="What kind of support would help?"
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={2}
                />
              )}
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Privacy:</strong> Your check-in will be visible to you and your direct manager.
              HR can see aggregated, anonymized data only.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={resetForm}>
              Reset
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createCheckIn.isPending}
            >
              {createCheckIn.isPending ? 'Submitting...' : 'Submit Check-in'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History */}
      {checks && checks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              Check-in History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {checks.map((check: any) => (
                <div key={check.id} className="border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(check.createdAt).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Happiness: </span>
                      <span className={`font-bold ${getScoreColor(check.happiness)}`}>
                        {check.happiness}/10
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Motivation: </span>
                      <span className={`font-bold ${getScoreColor(check.motivation)}`}>
                        {check.motivation}/10
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Balance: </span>
                      <span className={`font-bold ${getScoreColor(check.workLifeBalance)}`}>
                        {check.workLifeBalance}/10
                      </span>
                    </div>
                  </div>
                  {check.comment && (
                    <p className="text-sm text-gray-600 mt-2 italic">{check.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
