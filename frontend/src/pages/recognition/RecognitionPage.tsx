import { useState } from 'react';
import { Award, Trophy, Star, TrendingUp, Users, Heart, Plus, Gift, Crown } from 'lucide-react';
import { toast } from 'sonner';

interface Recognition {
  id: string;
  recipientName: string;
  giverName: string;
  category: string;
  title: string;
  message: string;
  likes: number;
  pointsAwarded: number;
  createdAt: string;
  isPublic: boolean;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  color: string;
  pointsValue: number;
}

export default function RecognitionPage() {
  const [selectedTab, setSelectedTab] = useState<'feed' | 'give' | 'badges' | 'leaderboard'>('feed');
  const [showGiveModal, setShowGiveModal] = useState(false);

  const mockRecognitions: Recognition[] = [
    {
      id: '1',
      recipientName: 'Sarah Johnson',
      giverName: 'Michael Brown',
      category: 'EXCELLENCE',
      title: 'Outstanding Project Delivery',
      message: 'Sarah went above and beyond to deliver the Q4 project ahead of schedule with exceptional quality!',
      likes: 24,
      pointsAwarded: 100,
      createdAt: '2025-10-12T10:30:00',
      isPublic: true,
    },
    {
      id: '2',
      recipientName: 'James Wilson',
      giverName: 'Emily Chen',
      category: 'TEAMWORK',
      title: 'Amazing Team Player',
      message: 'James consistently helps team members and creates a positive work environment.',
      likes: 18,
      pointsAwarded: 50,
      createdAt: '2025-10-11T14:20:00',
      isPublic: true,
    },
  ];

  const mockBadges: Badge[] = [
    {
      id: '1',
      name: 'Rising Star',
      description: 'Awarded to employees showing exceptional growth',
      iconUrl: '⭐',
      color: 'yellow',
      pointsValue: 200,
    },
    {
      id: '2',
      name: 'Team Champion',
      description: 'For outstanding collaboration and teamwork',
      iconUrl: '🏆',
      color: 'blue',
      pointsValue: 150,
    },
    {
      id: '3',
      name: 'Innovation Hero',
      description: 'For bringing innovative ideas to life',
      iconUrl: '💡',
      color: 'purple',
      pointsValue: 300,
    },
  ];

  const leaderboard = [
    { rank: 1, name: 'Sarah Johnson', points: 1250, recognitions: 15 },
    { rank: 2, name: 'James Wilson', points: 1100, recognitions: 12 },
    { rank: 3, name: 'Emily Chen', points: 950, recognitions: 10 },
    { rank: 4, name: 'Michael Brown', points: 800, recognitions: 8 },
    { rank: 5, name: 'Lisa Anderson', points: 750, recognitions: 7 },
  ];

  const stats = {
    totalRecognitions: 342,
    pointsEarned: 2450,
    badgesEarned: 8,
    recognitionsGiven: 15,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employee Recognition</h1>
            <p className="text-gray-600 mt-1">Celebrate achievements and appreciate great work</p>
          </div>
          <button
            onClick={() => setShowGiveModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg"
          >
            <Heart className="w-5 h-5" />
            Give Recognition
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Recognitions</p>
              <p className="text-3xl font-bold mt-1">{stats.totalRecognitions}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Points Earned</p>
              <p className="text-3xl font-bold mt-1">{stats.pointsEarned}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Badges Earned</p>
              <p className="text-3xl font-bold mt-1">{stats.badgesEarned}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Given</p>
              <p className="text-3xl font-bold mt-1">{stats.recognitionsGiven}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <div className="flex gap-6 px-6">
            <button
              onClick={() => setSelectedTab('feed')}
              className={`py-4 px-2 border-b-2 font-medium ${
                selectedTab === 'feed'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Recognition Feed
            </button>
            <button
              onClick={() => setSelectedTab('badges')}
              className={`py-4 px-2 border-b-2 font-medium ${
                selectedTab === 'badges'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              My Badges
            </button>
            <button
              onClick={() => setSelectedTab('leaderboard')}
              className={`py-4 px-2 border-b-2 font-medium ${
                selectedTab === 'leaderboard'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Leaderboard
            </button>
          </div>
        </div>

        <div className="p-6">
          {selectedTab === 'feed' && (
            <div className="space-y-6">
              {mockRecognitions.map((recognition) => (
                <div key={recognition.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {recognition.recipientName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{recognition.giverName}</span>
                          <span className="text-gray-500">recognized</span>
                          <span className="font-semibold text-gray-900">{recognition.recipientName}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(recognition.createdAt).toLocaleDateString()} •{' '}
                          {new Date(recognition.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {recognition.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{recognition.title}</h3>
                  <p className="text-gray-600 mb-4">{recognition.message}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
                        <Heart className="w-5 h-5" />
                        <span className="text-sm font-medium">{recognition.likes}</span>
                      </button>
                      <div className="flex items-center gap-2 text-yellow-600">
                        <Star className="w-5 h-5" />
                        <span className="text-sm font-medium">{recognition.pointsAwarded} points</span>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">Share</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedTab === 'badges' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Your Badges</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {mockBadges.map((badge) => (
                  <div key={badge.id} className="border border-gray-200 rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                    <div className="text-6xl mb-3">{badge.iconUrl}</div>
                    <h4 className="font-semibold text-gray-900 mb-2">{badge.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                    <div className="flex items-center justify-center gap-1 text-yellow-600">
                      <Star className="w-4 h-4" />
                      <span className="text-sm font-medium">{badge.pointsValue} points</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'leaderboard' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Top Performers</h3>
                <select className="px-4 py-2 border border-gray-300 rounded-lg">
                  <option>This Month</option>
                  <option>This Quarter</option>
                  <option>This Year</option>
                  <option>All Time</option>
                </select>
              </div>

              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.rank}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          entry.rank === 1
                            ? 'bg-yellow-500 text-white'
                            : entry.rank === 2
                            ? 'bg-gray-400 text-white'
                            : entry.rank === 3
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {entry.rank === 1 ? <Crown className="w-5 h-5" /> : entry.rank}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{entry.name}</div>
                        <div className="text-sm text-gray-600">{entry.recognitions} recognitions</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="font-bold text-gray-900">{entry.points} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
