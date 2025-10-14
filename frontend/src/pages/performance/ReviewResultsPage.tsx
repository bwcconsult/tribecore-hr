import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Star,
  TrendingUp,
  Target,
  MessageSquare,
  Calendar,
  User,
  Award,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

export default function ReviewResultsPage() {
  const { id, employeeId } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const reviewResult = {
    cycleName: 'Q4 2024 Performance Review',
    cycleType: 'QUARTERLY',
    reviewPeriod: {
      start: '2024-10-01',
      end: '2024-12-31',
    },
    employee: {
      name: 'John Smith',
      title: 'Senior Software Engineer',
      department: 'Engineering',
      hireDate: '2020-03-15',
    },
    reviewer: {
      name: 'Sarah Johnson',
      title: 'Engineering Manager',
    },
    publishedDate: '2025-01-26',
    overallRating: 4.2,
    selfRating: 4.5,
    managerRating: 4.0,
    calibratedRating: 4.2,
    sections: [
      {
        name: 'Objectives & Key Results',
        weight: 60,
        rating: 4.3,
        competencies: [
          {
            name: 'Goal Achievement',
            rating: 4.5,
            selfRating: 4.5,
            managerRating: 4.5,
            comments: 'Exceeded all quarterly objectives, delivered 3 major features ahead of schedule.',
          },
        ],
        feedback: {
          strengths: 'Consistently delivered high-quality work. Excellent problem-solving skills and proactive approach to challenges.',
          improvements: 'Could benefit from earlier communication when facing blockers.',
        },
      },
      {
        name: 'Core Competencies',
        weight: 30,
        rating: 4.0,
        competencies: [
          {
            name: 'Technical Skills',
            rating: 4.5,
            selfRating: 4.5,
            managerRating: 4.5,
            comments: 'Strong technical expertise across multiple technologies. Quick learner.',
          },
          {
            name: 'Communication',
            rating: 3.5,
            selfRating: 4.0,
            managerRating: 3.5,
            comments: 'Good written communication. Could improve verbal communication in team meetings.',
          },
          {
            name: 'Leadership',
            rating: 4.0,
            selfRating: 4.5,
            managerRating: 4.0,
            comments: 'Shows initiative and mentors junior team members effectively.',
          },
          {
            name: 'Problem Solving',
            rating: 4.5,
            selfRating: 5.0,
            managerRating: 4.5,
            comments: 'Excellent analytical skills. Finds creative solutions to complex problems.',
          },
        ],
        feedback: {
          strengths: 'Strong technical leader who others look up to. Great at breaking down complex problems.',
          improvements: 'Would benefit from more active participation in architecture discussions.',
        },
      },
      {
        name: 'Company Values',
        weight: 10,
        rating: 4.2,
        competencies: [
          {
            name: 'Integrity',
            rating: 4.5,
            selfRating: 4.5,
            managerRating: 4.5,
            comments: 'Always acts with integrity and sets a great example for the team.',
          },
          {
            name: 'Teamwork',
            rating: 4.0,
            selfRating: 4.5,
            managerRating: 4.0,
            comments: 'Good team player, could be more proactive in cross-team collaboration.',
          },
          {
            name: 'Customer Focus',
            rating: 4.0,
            selfRating: 4.0,
            managerRating: 4.0,
            comments: 'Understands customer needs and delivers quality solutions.',
          },
        ],
      },
    ],
    developmentPlan: {
      strengths: [
        'Exceptional technical skills and problem-solving ability',
        'Proactive and self-motivated',
        'Excellent at mentoring junior engineers',
        'Consistently delivers high-quality work on time',
      ],
      areasForImprovement: [
        'Communication in team meetings and stakeholder updates',
        'Early escalation of blockers and risks',
        'Participation in cross-functional initiatives',
      ],
      nextGoals: [
        {
          description: 'Lead architecture design for Q1 2025 major initiative',
          targetDate: '2025-03-31',
          priority: 'HIGH',
        },
        {
          description: 'Improve presentation skills - complete public speaking workshop',
          targetDate: '2025-02-28',
          priority: 'MEDIUM',
        },
        {
          description: 'Mentor 2 junior engineers through onboarding',
          targetDate: '2025-03-31',
          priority: 'MEDIUM',
        },
      ],
      supportNeeded: [
        'Public speaking/presentation skills training',
        'Leadership development program enrollment',
        'Regular 1:1s focused on communication skills',
      ],
    },
    managerComments: 'John has been an exceptional contributor this quarter. His technical skills are outstanding and he consistently delivers high-quality work. The main area for development is communication - both in terms of speaking up more in meetings and providing earlier updates when facing challenges. With focused development in this area, John is on track for a Staff Engineer promotion in 2025.',
    employeeComments: 'Thank you for the feedback. I appreciate the recognition of my technical contributions. I acknowledge that communication is an area I need to work on and I am committed to improving. I look forward to the development opportunities outlined.',
    acknowledgedAt: '2025-01-27T10:30:00Z',
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600 bg-green-50';
    if (rating >= 3.5) return 'text-blue-600 bg-blue-50';
    if (rating >= 2.5) return 'text-yellow-600 bg-yellow-50';
    if (rating >= 1.5) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return 'Outstanding';
    if (rating >= 3.5) return 'Exceeds Expectations';
    if (rating >= 2.5) return 'Meets Expectations';
    if (rating >= 1.5) return 'Developing';
    return 'Needs Improvement';
  };

  const handleExportPDF = () => {
    toast.success('Downloading review as PDF...');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/performance/reviews">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Reviews
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Performance Review Results</h1>
            <p className="text-gray-600 mt-1">{reviewResult.cycleName}</p>
          </div>
        </div>
        <Button variant="outline" onClick={handleExportPDF}>
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Employee Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{reviewResult.employee.name}</h2>
                  <p className="text-gray-600">{reviewResult.employee.title}</p>
                  <p className="text-sm text-gray-500">{reviewResult.employee.department}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Review Period:</span>
                  <span className="font-medium">
                    {new Date(reviewResult.reviewPeriod.start).toLocaleDateString()} -{' '}
                    {new Date(reviewResult.reviewPeriod.end).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Reviewed by:</span>
                  <span className="font-medium">
                    {reviewResult.reviewer.name} ({reviewResult.reviewer.title})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-gray-600">Published:</span>
                  <span className="font-medium">{new Date(reviewResult.publishedDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Overall Rating</p>
                <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl ${getRatingColor(reviewResult.overallRating)}`}>
                  <Award className="h-8 w-8" />
                  <div className="text-left">
                    <p className="text-4xl font-bold">{reviewResult.overallRating.toFixed(1)}</p>
                    <p className="text-sm font-medium">{getRatingLabel(reviewResult.overallRating)}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-gray-600">Self</p>
                    <p className="text-lg font-bold">{reviewResult.selfRating.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Manager</p>
                    <p className="text-lg font-bold">{reviewResult.managerRating.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Final</p>
                    <p className="text-lg font-bold">{reviewResult.calibratedRating.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <div className="border-b">
          <div className="flex gap-4 px-6">
            {['overview', 'detailed', 'development', 'comments'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <CardContent className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {reviewResult.sections.map((section) => (
                    <Card key={section.name} className="border-2">
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-600 mb-1">{section.name}</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-3xl font-bold">{section.rating.toFixed(1)}</p>
                          <span className="text-sm text-gray-500">/ 5.0</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Weight: {section.weight}%</p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(section.rating / 5) * 100}%` }}
                          ></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-green-50 border-green-200">
                  <CardHeader>
                    <CardTitle className="text-green-900 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Key Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {reviewResult.developmentPlan.strengths.map((strength, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-green-900">
                          <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-blue-900 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Development Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {reviewResult.developmentPlan.areasForImprovement.map((area, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-blue-900">
                          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Detailed Tab */}
          {activeTab === 'detailed' && (
            <div className="space-y-6">
              {reviewResult.sections.map((section) => (
                <Card key={section.name} className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{section.name}</span>
                      <span className={`px-4 py-2 rounded-full text-lg font-bold ${getRatingColor(section.rating)}`}>
                        {section.rating.toFixed(1)}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {section.competencies.map((comp, idx) => (
                      <div key={idx} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{comp.name}</h4>
                          <div className="flex gap-4 text-sm">
                            <span className="text-gray-600">
                              Self: <span className="font-bold">{comp.selfRating.toFixed(1)}</span>
                            </span>
                            <span className="text-gray-600">
                              Manager: <span className="font-bold">{comp.managerRating.toFixed(1)}</span>
                            </span>
                            <span className={`px-3 py-1 rounded-full font-bold ${getRatingColor(comp.rating)}`}>
                              {comp.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700">{comp.comments}</p>
                      </div>
                    ))}
                    {section.feedback && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-green-900 mb-2">Strengths</h5>
                          <p className="text-sm text-green-800">{section.feedback.strengths}</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-blue-900 mb-2">Areas to Develop</h5>
                          <p className="text-sm text-blue-800">{section.feedback.improvements}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Development Tab */}
          {activeTab === 'development' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Goals for Next Period</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviewResult.developmentPlan.nextGoals.map((goal, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-4 border rounded-lg">
                        <Target className="h-5 w-5 text-blue-600 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold">{goal.description}</h4>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                goal.priority === 'HIGH'
                                  ? 'bg-red-100 text-red-800'
                                  : goal.priority === 'MEDIUM'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {goal.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Target: {new Date(goal.targetDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Support & Resources Needed</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {reviewResult.developmentPlan.supportNeeded.map((support, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                        <span>{support}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Manager Comments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap">{reviewResult.managerComments}</p>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">{reviewResult.reviewer.name}</span>
                      <span className="mx-2">•</span>
                      {new Date(reviewResult.publishedDate).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Employee Acknowledgment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap">{reviewResult.employeeComments}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p>
                      <span className="font-medium">Acknowledged on</span>
                      <span className="mx-2">•</span>
                      {new Date(reviewResult.acknowledgedAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
