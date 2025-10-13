import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import {
  Target,
  MessageSquare,
  Heart,
  Award,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ArrowRight,
  Users,
  BarChart3,
  FileText,
  Clock,
} from 'lucide-react';
import { performanceEnhancedService } from '../../services/performanceEnhancedService';
import { useAuthStore } from '../../stores/authStore';

export default function PerformanceHomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['performance-dashboard', user?.id],
    queryFn: () => performanceEnhancedService.dashboards.getEmployeeDashboard(user?.id || ''),
    enabled: !!user?.id,
  });

  const { data: nudges } = useQuery({
    queryKey: ['nudges'],
    queryFn: () => performanceEnhancedService.nudges.getMine(),
  });

  const quickAccessCards = [
    {
      title: 'My Objectives',
      description: 'Track your goals and key results',
      icon: Target,
      color: 'from-blue-500 to-blue-600',
      route: '/performance/objectives',
      stats: dashboard?.objectives
        ? `${dashboard.objectives.active} active, ${dashboard.objectives.atRisk} at risk`
        : 'Loading...',
    },
    {
      title: '1:1 Meetings',
      description: 'Schedule and manage one-on-ones',
      icon: MessageSquare,
      color: 'from-purple-500 to-purple-600',
      route: '/performance/one-on-ones',
      stats: dashboard?.upcomingOneOnOne
        ? `Next: ${new Date(dashboard.upcomingOneOnOne.scheduledAt).toLocaleDateString()}`
        : 'No upcoming 1:1s',
    },
    {
      title: 'Wellbeing',
      description: 'Check in on how you are feeling',
      icon: Heart,
      color: 'from-pink-500 to-pink-600',
      route: '/performance/wellbeing',
      stats: dashboard?.wellbeing
        ? `Last updated ${new Date(dashboard.wellbeing.lastUpdated).toLocaleDateString()}`
        : 'Not tracked yet',
    },
    {
      title: 'Feedback',
      description: 'Give and receive feedback',
      icon: MessageSquare,
      color: 'from-green-500 to-green-600',
      route: '/performance/feedback',
      stats: dashboard?.feedback
        ? `${dashboard.feedback.count} received`
        : 'No feedback yet',
    },
    {
      title: 'Recognition',
      description: 'Celebrate achievements',
      icon: Award,
      color: 'from-yellow-500 to-yellow-600',
      route: '/performance/recognition',
      stats: dashboard?.recognition
        ? `${dashboard.recognition.count} high fives`
        : 'No recognition yet',
    },
    {
      title: 'Actions',
      description: 'Tasks and commitments',
      icon: CheckCircle2,
      color: 'from-indigo-500 to-indigo-600',
      route: '/performance/actions',
      stats: dashboard?.actions
        ? `${dashboard.actions.total} actions, ${dashboard.actions.overdue} overdue`
        : 'No actions',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance & Development</h1>
          <p className="text-gray-600 mt-1">Continuous growth through objectives, feedback, and 1:1s</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/performance/actions')}>
            <CheckCircle2 className="w-4 h-4 mr-2" />
            My Actions
          </Button>
          <Button onClick={() => navigate('/performance/objectives')}>
            <Target className="w-4 h-4 mr-2" />
            My Objectives
          </Button>
        </div>
      </div>

      {/* Nudges/Alerts */}
      {nudges && nudges.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-2">Action Required</h3>
              <div className="space-y-2">
                {nudges.slice(0, 3).map((nudge: any) => (
                  <div key={nudge.id} className="flex items-center justify-between bg-white rounded p-3">
                    <div>
                      <p className="font-medium text-gray-900">{nudge.title}</p>
                      <p className="text-sm text-gray-600">{nudge.message}</p>
                    </div>
                    {nudge.actions && nudge.actions.length > 0 && (
                      <Button
                        size="sm"
                        onClick={() => navigate(nudge.actions[0].url)}
                      >
                        {nudge.actions[0].label}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickAccessCards.map((card) => (
          <div
            key={card.title}
            onClick={() => navigate(card.route)}
            className={`bg-gradient-to-br ${card.color} rounded-xl shadow-lg p-6 text-white cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1`}
          >
            <div className="flex items-center justify-between mb-4">
              <card.icon className="w-10 h-10" />
              <ArrowRight className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">{card.title}</h3>
            <p className="text-white/90 text-sm mb-3">{card.description}</p>
            <p className="text-white/80 text-xs font-medium">{card.stats}</p>
          </div>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Objectives</p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboard?.objectives?.active || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {dashboard?.objectives?.atRisk || 0} at risk
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-full">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Open Actions</p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboard?.actions?.total || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {dashboard?.actions?.overdue || 0} overdue
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-full">
                <CheckCircle2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Feedback Received</p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboard?.feedback?.count || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">This quarter</p>
              </div>
              <div className="bg-green-50 p-3 rounded-full">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Recognition</p>
                <p className="text-3xl font-bold text-gray-900">
                  {dashboard?.recognition?.count || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">High fives</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-full">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Feedback */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              Recent Feedback
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.feedback?.recent && dashboard.feedback.recent.length > 0 ? (
              <div className="space-y-3">
                {dashboard.feedback.recent.map((item: any) => (
                  <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-sm text-gray-900">
                        {item.fromUser?.firstName} {item.fromUser?.lastName}
                      </p>
                      <span className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{item.text}</p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {item.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No feedback yet</p>
            )}
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate('/performance/feedback')}
            >
              View All Feedback
            </Button>
          </CardContent>
        </Card>

        {/* Recent Recognition */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Recent Recognition
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.recognition?.recent && dashboard.recognition.recent.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recognition.recent.map((item: any) => (
                  <div key={item.id} className="p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-yellow-600" />
                        <p className="font-medium text-sm text-gray-900">
                          {item.fromUser?.firstName} {item.fromUser?.lastName}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{item.text}</p>
                    <div className="mt-2">
                      <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded font-medium">
                        {item.badge.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recognition yet</p>
            )}
            <Button
              variant="outline"
              className="w-full mt-4"
              onClick={() => navigate('/performance/recognition')}
            >
              View All Recognition
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Wellbeing Check-in */}
      {dashboard?.wellbeing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-600" />
              Your Wellbeing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-pink-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Happiness</p>
                <p className="text-3xl font-bold text-pink-600">
                  {dashboard.wellbeing.happiness}/10
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Motivation</p>
                <p className="text-3xl font-bold text-purple-600">
                  {dashboard.wellbeing.motivation}/10
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Work-Life Balance</p>
                <p className="text-3xl font-bold text-blue-600">
                  {dashboard.wellbeing.workLifeBalance}/10
                </p>
              </div>
            </div>
            <Button
              className="w-full mt-4"
              onClick={() => navigate('/performance/wellbeing')}
            >
              Update Wellbeing Check-in
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
