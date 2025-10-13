import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
  MessageSquare,
  Plus,
  ThumbsUp,
  Eye,
  EyeOff,
  User,
  Calendar,
  Tag,
} from 'lucide-react';
import { performanceEnhancedService, Feedback } from '../../services/performanceEnhancedService';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';

export default function FeedbackPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'received' | 'given'>('received');
  const [isGiveModalOpen, setIsGiveModalOpen] = useState(false);

  const { data: receivedFeedback, isLoading: loadingReceived } = useQuery({
    queryKey: ['feedback-received', user?.id],
    queryFn: () => performanceEnhancedService.feedback.getAll({ toUserId: user?.id }),
    enabled: !!user?.id && filter === 'received',
  });

  const { data: givenFeedback, isLoading: loadingGiven } = useQuery({
    queryKey: ['feedback-given', user?.id],
    queryFn: () => performanceEnhancedService.feedback.getAll({ fromUserId: user?.id }),
    enabled: !!user?.id && filter === 'given',
  });

  const createFeedback = useMutation({
    mutationFn: (data: any) => performanceEnhancedService.feedback.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-received'] });
      queryClient.invalidateQueries({ queryKey: ['feedback-given'] });
      toast.success('Feedback sent successfully!');
      setIsGiveModalOpen(false);
    },
    onError: () => {
      toast.error('Failed to send feedback');
    },
  });

  const markAsRead = useMutation({
    mutationFn: (id: string) => performanceEnhancedService.feedback.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-received'] });
      toast.success('Marked as read');
    },
  });

  const feedback = filter === 'received' ? receivedFeedback : givenFeedback;
  const isLoading = filter === 'received' ? loadingReceived : loadingGiven;

  const stats = {
    received: receivedFeedback?.length || 0,
    given: givenFeedback?.length || 0,
    unread: receivedFeedback?.filter((f: Feedback) => !f.isRead).length || 0,
    thisMonth: receivedFeedback?.filter((f: Feedback) => {
      const date = new Date(f.createdAt);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length || 0,
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PUBLIC':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PRIVATE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PEER':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'UPWARD':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feedback</h1>
          <p className="text-gray-600 mt-1">Give and receive constructive feedback</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/performance')}>
            Back to Performance
          </Button>
          <Button onClick={() => setIsGiveModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Give Feedback
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
              <div className="bg-blue-50 p-3 rounded-full">
                <MessageSquare className="w-6 h-6 text-blue-600" />
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
                <p className="text-sm text-gray-600 mb-1">Unread</p>
                <p className="text-3xl font-bold text-gray-900">{stats.unread}</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-full">
                <Eye className="w-6 h-6 text-orange-600" />
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
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setFilter('received')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'received'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Received ({stats.received})
        </button>
        <button
          onClick={() => setFilter('given')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'given'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Given ({stats.given})
        </button>
      </div>

      {/* Feedback List */}
      {feedback && feedback.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {feedback.map((item: Feedback) => (
            <Card
              key={item.id}
              className={`hover:shadow-lg transition-shadow ${
                !item.isRead && filter === 'received' ? 'border-l-4 border-l-blue-500' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {filter === 'received'
                          ? item.isAnonymous
                            ? 'Anonymous'
                            : `${item.fromUser?.firstName} ${item.fromUser?.lastName}`
                          : `To: ${item.toUser?.firstName} ${item.toUser?.lastName}`}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(
                            item.type,
                          )}`}
                        >
                          {item.type}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        {!item.isRead && filter === 'received' && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {!item.isRead && filter === 'received' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAsRead.mutate(item.id)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Mark Read
                    </Button>
                  )}
                </div>

                <p className="text-gray-700 leading-relaxed mb-4">{item.text}</p>

                {item.tags && item.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag className="w-4 h-4 text-gray-400" />
                    {item.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {item.values && item.values.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap mt-2">
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
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'received' ? 'No feedback received yet' : 'No feedback given yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'received'
                ? 'Request feedback from your peers and manager to improve your performance.'
                : 'Give constructive feedback to help your colleagues grow.'}
            </p>
            {filter === 'given' && (
              <Button onClick={() => setIsGiveModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Give Your First Feedback
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Give Feedback Modal Placeholder */}
      {isGiveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Give Feedback</h2>
            <p className="text-gray-600 mb-4">
              Full feedback modal will be implemented with:
              <br />- Employee selector (multi-select)
              <br />- Feedback type (Private, Public, Peer, Upward)
              <br />- Competency tags (Technical Depth, Problem Solving, etc.)
              <br />- Company values tags
              <br />- Feedback text area
              <br />- Visibility options
              <br />- Anonymous option
              <br />- Add to 1:1 toggle
              <br />- Related objective picker
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsGiveModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  toast('Give feedback functionality coming soon');
                  setIsGiveModalOpen(false);
                }}
              >
                Send Feedback
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
