import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Users,
  TrendingUp,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

export default function SurveyResultsPage() {
  const { id } = useParams();

  // Mock survey data
  const survey = {
    id,
    title: 'Employee Engagement Survey Q4 2024',
    description: 'Quarterly pulse check on employee satisfaction and engagement',
    responseCount: 127,
    targetCount: 250,
    responseRate: 50.8,
  };

  // Mock analytics data
  const analytics = {
    questions: [
      {
        id: '1',
        text: 'How satisfied are you with your current role?',
        type: 'RATING',
        average: 4.2,
        distribution: { '1': 2, '2': 5, '3': 18, '4': 52, '5': 50 },
      },
      {
        id: '2',
        text: 'Do you feel valued by your team?',
        type: 'YES_NO',
        distribution: { Yes: 98, No: 29 },
      },
      {
        id: '3',
        text: 'What would improve your work experience?',
        type: 'MULTIPLE_CHOICE',
        distribution: {
          'Better work-life balance': 45,
          'Career development opportunities': 38,
          'Flexible working': 52,
          'Recognition and rewards': 31,
        },
      },
      {
        id: '4',
        text: 'Rate your satisfaction with leadership communication',
        type: 'SCALE',
        average: 7.6,
        distribution: { '5': 8, '6': 12, '7': 28, '8': 42, '9': 25, '10': 12 },
      },
    ],
  };

  const handleExport = () => {
    toast.success('Exporting survey results...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/surveys">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Surveys
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{survey.title}</h1>
            <p className="text-gray-600 mt-1">{survey.description}</p>
          </div>
        </div>
        <Button onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export Results
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Responses</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{survey.responseCount}</p>
              </div>
              <Users className="h-10 w-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Response Rate</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{survey.responseRate}%</p>
                <p className="text-xs text-gray-500 mt-1">
                  {survey.responseCount} of {survey.targetCount} target
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Questions</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{analytics.questions.length}</p>
              </div>
              <BarChart3 className="h-10 w-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question Results */}
      <div className="space-y-6">
        {analytics.questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                Question {index + 1}: {question.text}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(question.type === 'RATING' || question.type === 'SCALE') && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-4xl font-bold text-blue-600">{question.average}</p>
                      <p className="text-sm text-gray-600">Average Rating</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(question.distribution).map(([rating, count]) => {
                      const total = Object.values(question.distribution).reduce(
                        (a: number, b: number) => a + b,
                        0
                      );
                      const percentage = ((count as number) / total) * 100;
                      return (
                        <div key={rating} className="flex items-center gap-3">
                          <span className="w-12 text-sm font-medium">{rating}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                            <div
                              className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                              style={{ width: `${percentage}%` }}
                            >
                              <span className="text-xs text-white font-medium">
                                {count} ({percentage.toFixed(0)}%)
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {question.type === 'YES_NO' && (
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(question.distribution).map(([option, count]) => {
                    const total = Object.values(question.distribution).reduce(
                      (a: number, b: number) => a + b,
                      0
                    );
                    const percentage = ((count as number) / total) * 100;
                    return (
                      <div
                        key={option}
                        className={`p-6 rounded-lg border-2 ${
                          option === 'Yes'
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                        }`}
                      >
                        <p className="text-lg font-semibold">{option}</p>
                        <p className="text-3xl font-bold mt-2">{count}</p>
                        <p className="text-sm text-gray-600 mt-1">{percentage.toFixed(1)}%</p>
                      </div>
                    );
                  })}
                </div>
              )}

              {question.type === 'MULTIPLE_CHOICE' && (
                <div className="space-y-2">
                  {Object.entries(question.distribution)
                    .sort(([, a], [, b]) => (b as number) - (a as number))
                    .map(([option, count]) => {
                      const total = Object.values(question.distribution).reduce(
                        (a: number, b: number) => a + b,
                        0
                      );
                      const percentage = ((count as number) / total) * 100;
                      return (
                        <div key={option} className="flex items-center gap-3">
                          <span className="w-48 text-sm font-medium truncate">{option}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                            <div
                              className="bg-purple-600 h-8 rounded-full flex items-center justify-end pr-3"
                              style={{ width: `${percentage}%` }}
                            >
                              <span className="text-sm text-white font-medium">
                                {count} ({percentage.toFixed(0)}%)
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
