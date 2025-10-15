import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recruitmentService, Interview, Scorecard } from '../../services/recruitment.service';
import Button from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle,
  Plus,
  Filter,
  Search,
} from 'lucide-react';

export function InterviewsPage() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<Interview[]>([]);
  const [pendingScorecards, setPendingScorecards] = useState<Scorecard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'scorecards'>('upcoming');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allInterviews, upcoming, scorecards, statsData] = await Promise.all([
        recruitmentService.getInterviews({ limit: 50 }),
        recruitmentService.getMyUpcomingInterviews(),
        recruitmentService.getMyPendingScorecards(),
        recruitmentService.getInterviewStats(),
      ]);

      setInterviews(allInterviews.data || []);
      setUpcomingInterviews(upcoming || []);
      setPendingScorecards(scorecards || []);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInterviewTypeBadge = (type: string) => {
    const config: Record<string, { color: string; label: string }> = {
      PHONE_SCREEN: { color: 'blue', label: 'Phone Screen' },
      VIDEO_SCREEN: { color: 'purple', label: 'Video Screen' },
      ONSITE: { color: 'green', label: 'On-site' },
      TECHNICAL: { color: 'orange', label: 'Technical' },
      BEHAVIORAL: { color: 'pink', label: 'Behavioral' },
      PANEL: { color: 'indigo', label: 'Panel' },
      CULTURE_FIT: { color: 'yellow', label: 'Culture Fit' },
    };

    const { color, label } = config[type] || { color: 'gray', label: type };
    return <Badge variant={color as any}>{label}</Badge>;
  };

  const getScorecardStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: any }> = {
      PENDING: { color: 'gray', icon: Clock },
      IN_PROGRESS: { color: 'blue', icon: Clock },
      SUBMITTED: { color: 'green', icon: CheckCircle },
      OVERDUE: { color: 'red', icon: AlertCircle },
    };

    const { color, icon: Icon } = config[status] || config.PENDING;

    return (
      <Badge variant={color as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const formatDateTime = (date: Date) => {
    const d = new Date(date);
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const isUpcoming = (date: Date) => {
    return new Date(date) > new Date();
  };

  const isPast = (date: Date) => {
    return new Date(date) < new Date();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    const d = new Date(date);
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interviews</h1>
          <p className="text-gray-600 mt-1">Manage interviews and submit feedback</p>
        </div>
        <Button onClick={() => navigate('/recruitment/interviews/schedule')}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Interview
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalUpcoming}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Past Week</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalPastWeek}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Scorecards</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingScorecards}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdueScorecards}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upcoming'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Upcoming Interviews ({upcomingInterviews.length})
          </button>
          <button
            onClick={() => setActiveTab('scorecards')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'scorecards'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending Scorecards ({pendingScorecards.length})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All Interviews ({interviews.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {upcomingInterviews.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No upcoming interviews</p>
              </CardContent>
            </Card>
          ) : (
            upcomingInterviews.map((interview) => {
              const { date, time } = formatDateTime(interview.scheduledStart);
              const today = isToday(interview.scheduledStart);

              return (
                <Card key={interview.id} className={today ? 'border-2 border-blue-500' : ''}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getInterviewTypeBadge(interview.type)}
                          {today && <Badge variant="info">TODAY</Badge>}
                        </div>

                        <div className="space-y-2 mt-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">{date}</span>
                            <Clock className="h-4 w-4 ml-2" />
                            <span>{time}</span>
                          </div>

                          {interview.location && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span>{interview.location}</span>
                            </div>
                          )}

                          {interview.meetingLink && (
                            <div className="flex items-center gap-2 text-sm">
                              <Video className="h-4 w-4 text-blue-600" />
                              <a
                                href={interview.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                Join Video Call
                              </a>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="h-4 w-4" />
                            <span>
                              Panel: {interview.panel.map((p: any) => p.name).join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/recruitment/interviews/${interview.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'scorecards' && (
        <div className="space-y-4">
          {pendingScorecards.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No pending scorecards</p>
              </CardContent>
            </Card>
          ) : (
            pendingScorecards.map((scorecard) => {
              const dueDate = new Date(scorecard.dueAt);
              const isOverdue = dueDate < new Date();
              const hoursUntilDue = Math.floor(
                (dueDate.getTime() - Date.now()) / (1000 * 60 * 60)
              );

              return (
                <Card
                  key={scorecard.id}
                  className={isOverdue ? 'border-2 border-red-500' : ''}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getScorecardStatusBadge(scorecard.status)}
                          {isOverdue && (
                            <Badge variant="danger" className="flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              OVERDUE
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-2 mt-3">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Interviewer:</span> {scorecard.interviewerName}
                          </div>

                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Due:</span>{' '}
                            {dueDate.toLocaleDateString()} at {dueDate.toLocaleTimeString()}
                            {!isOverdue && hoursUntilDue < 24 && (
                              <span className="text-orange-600 ml-2">
                                ({hoursUntilDue}h remaining)
                              </span>
                            )}
                          </div>

                          {scorecard.recommendation && (
                            <div className="text-sm">
                              <span className="font-medium">Recommendation:</span>{' '}
                              <Badge
                                variant={
                                  scorecard.recommendation.includes('STRONG_HIRE')
                                    ? 'success'
                                    : scorecard.recommendation.includes('NO_HIRE')
                                    ? 'danger'
                                    : 'warning'
                                }
                              >
                                {scorecard.recommendation}
                              </Badge>
                            </div>
                          )}

                          {scorecard.overallScore && (
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Score:</span> {scorecard.overallScore}/100
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="ml-4">
                        <Button
                          size="sm"
                          onClick={() =>
                            navigate(`/recruitment/scorecards/${scorecard.id}/submit`)
                          }
                        >
                          {scorecard.status === 'PENDING' ? 'Submit Feedback' : 'Edit Feedback'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'all' && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {interviews.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No interviews found</p>
                </div>
              ) : (
                interviews.map((interview) => {
                  const { date, time } = formatDateTime(interview.scheduledStart);
                  const upcoming = isUpcoming(interview.scheduledStart);
                  const past = isPast(interview.scheduledStart);

                  return (
                    <div
                      key={interview.id}
                      className="border rounded-lg p-4 hover:border-blue-500 cursor-pointer transition-colors"
                      onClick={() => navigate(`/recruitment/interviews/${interview.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getInterviewTypeBadge(interview.type)}
                            {upcoming && <Badge variant="info">Upcoming</Badge>}
                            {past && <Badge variant="default">Completed</Badge>}
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mt-3">
                            <div>
                              <Calendar className="h-4 w-4 inline mr-1" />
                              {date}
                            </div>
                            <div>
                              <Clock className="h-4 w-4 inline mr-1" />
                              {time}
                            </div>
                            <div>
                              <Users className="h-4 w-4 inline mr-1" />
                              {interview.panel.length} panelists
                            </div>
                            {interview.outcome && (
                              <div>
                                <Badge
                                  variant={
                                    interview.outcome === 'STRONG_YES' ? 'success' : 'danger'
                                  }
                                >
                                  {interview.outcome}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>

                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
