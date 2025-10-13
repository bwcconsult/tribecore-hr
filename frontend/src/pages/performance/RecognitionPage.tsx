import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
  Award,
  Plus,
  ThumbsUp,
  Star,
  Trophy,
  Zap,
  Users,
  Heart,
  Lightbulb,
  Target,
  TrendingUp,
} from 'lucide-react';
import { performanceEnhancedService, Recognition } from '../../services/performanceEnhancedService';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';

export default function RecognitionPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isGiveModalOpen, setIsGiveModalOpen] = useState(false);

  const { data: recognition, isLoading } = useQuery({
    queryKey: ['recognition', user?.id],
    queryFn: () => performanceEnhancedService.recognition.getAll(user?.id),
    enabled: !!user?.id,
  });

  const createRecognition = useMutation({
    mutationFn: (data: any) => performanceEnhancedService.recognition.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recognition'] });
      toast.success('Recognition sent successfully! 🎉');
      setIsGiveModalOpen(false);
    },
    onError: () => {
      toast.error('Failed to send recognition');
    },
  });

  const addReaction = useMutation({
    mutationFn: ({ id, emoji }: { id: string; emoji: string }) =>
      performanceEnhancedService.recognition.addReaction(id, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recognition'] });
      toast.success('Reaction added!');
    },
  });

  const getBadgeIcon = (badge: string) => {
    switch (badge) {
      case 'CUSTOMER_FIRST':
        return <Star className="w-6 h-6" />;
      case 'INNOVATION':
        return <Lightbulb className="w-6 h-6" />;
      case 'TEAM_PLAYER':
        return <Users className="w-6 h-6" />;
      case 'OWNERSHIP':
        return <Target className="w-6 h-6" />;
      case 'CRAFT_EXCELLENCE':
        return <Trophy className="w-6 h-6" />;
      case 'EFFECTIVE_COMMUNICATOR':
        return <Award className="w-6 h-6" />;
      case 'CONTINUOUS_GROWTH':
        return <TrendingUp className="w-6 h-6" />;
      case 'PROBLEM_SOLVER':
        return <Zap className="w-6 h-6" />;
      case 'LEADERSHIP':
        return <Star className="w-6 h-6" />;
      case 'ABOVE_AND_BEYOND':
        return <Trophy className="w-6 h-6" />;
      default:
        return <Award className="w-6 h-6" />;
    }
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'CUSTOMER_FIRST':
        return 'from-blue-400 to-blue-600';
      case 'INNOVATION':
        return 'from-purple-400 to-purple-600';
      case 'TEAM_PLAYER':
        return 'from-green-400 to-green-600';
      case 'OWNERSHIP':
        return 'from-orange-400 to-orange-600';
      case 'CRAFT_EXCELLENCE':
        return 'from-yellow-400 to-yellow-600';
      case 'EFFECTIVE_COMMUNICATOR':
        return 'from-pink-400 to-pink-600';
      case 'CONTINUOUS_GROWTH':
        return 'from-indigo-400 to-indigo-600';
      case 'PROBLEM_SOLVER':
        return 'from-red-400 to-red-600';
      case 'LEADERSHIP':
        return 'from-teal-400 to-teal-600';
      case 'ABOVE_AND_BEYOND':
        return 'from-amber-400 to-amber-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const received = recognition?.filter((r: Recognition) => r.toUserId === user?.id) || [];
  const given = recognition?.filter((r: Recognition) => r.fromUserId === user?.id) || [];

  const stats = {
    received: received.length,
    given: given.length,
    thisMonth: received.filter((r: Recognition) => {
      const date = new Date(r.createdAt);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
    totalReactions: received.reduce((sum: number, r: Recognition) => sum + r.reactions, 0),
  };

  // Badge distribution
  const badgeCount = received.reduce((acc: any, r: Recognition) => {
    acc[r.badge] = (acc[r.badge] || 0) + 1;
    return acc;
  }, {});

  const topBadges = Object.entries(badgeCount)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 3);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recognition...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recognition</h1>
          <p className="text-gray-600 mt-1">Celebrate achievements and give high fives</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/performance')}>
            Back to Performance
          </Button>
          <Button onClick={() => setIsGiveModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Give Recognition
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Received</p>
                <p className="text-3xl font-bold text-gray-900">{stats.received}</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-full">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Given</p>
                <p className="text-3xl font-bold text-gray-900">{stats.given}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-full">
                <ThumbsUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">This Month</p>
                <p className="text-3xl font-bold text-gray-900">{stats.thisMonth}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-full">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Reactions</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalReactions}</p>
              </div>
              <div className="bg-pink-50 p-3 rounded-full">
                <Heart className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Badges */}
      {topBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Your Top Badges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topBadges.map(([badge, count]: [string, any]) => (
                <div
                  key={badge}
                  className={`bg-gradient-to-br ${getBadgeColor(badge)} rounded-lg p-4 text-white`}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                      {getBadgeIcon(badge)}
                    </div>
                    <div>
                      <p className="font-bold text-lg">{count}×</p>
                      <p className="text-sm opacity-90">{badge.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recognition Feed */}
      {recognition && recognition.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {recognition.map((item: Recognition) => (
            <Card
              key={item.id}
              className={`hover:shadow-lg transition-shadow ${
                item.isPublic ? 'border-l-4 border-l-yellow-500' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`bg-gradient-to-br ${getBadgeColor(item.badge)} p-4 rounded-xl text-white`}>
                    {getBadgeIcon(item.badge)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-lg text-gray-900">
                        {item.badge.replace(/_/g, ' ')}
                      </span>
                      {item.isPublic && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
                          Public
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-3">
                      {item.toUserId === user?.id ? (
                        <>
                          <strong>From:</strong> {item.fromUser?.firstName} {item.fromUser?.lastName}
                        </>
                      ) : (
                        <>
                          <strong>To:</strong> {item.toUser?.firstName} {item.toUser?.lastName}
                        </>
                      )}
                      {' • '}
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>

                    <p className="text-gray-700 leading-relaxed mb-4">{item.text}</p>

                    {item.values && item.values.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <span className="text-xs text-gray-600">Values:</span>
                        {item.values.map((value) => (
                          <span
                            key={value}
                            className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-medium"
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => addReaction.mutate({ id: item.id, emoji: '👏' })}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{item.reactions} {item.reactions === 1 ? 'reaction' : 'reactions'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No recognition yet</h3>
            <p className="text-gray-600 mb-6">
              Start celebrating your colleagues' achievements by giving recognition!
            </p>
            <Button onClick={() => setIsGiveModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Give Your First Recognition
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Give Recognition Modal Placeholder */}
      {isGiveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Give Recognition</h2>
            <p className="text-gray-600 mb-4">
              Full recognition modal will be implemented with:
              <br />- Employee selector
              <br />- Badge selection (10 badges with icons)
              <br />- Recognition message
              <br />- Company values tags
              <br />- Public/Private toggle
              <br />- Related objective/project picker
              <br />- Share to Slack/Teams options
              <br />
              <br />
              <strong>Available Badges:</strong>
              <br />• Customer First • Innovation • Team Player
              <br />• Ownership • Craft Excellence • Effective Communicator
              <br />• Continuous Growth • Problem Solver • Leadership
              <br />• Above and Beyond
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsGiveModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast('Give recognition functionality coming soon');
                  setIsGiveModalOpen(false);
                }}
              >
                Send Recognition
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
