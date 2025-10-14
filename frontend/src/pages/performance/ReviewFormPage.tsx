import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Send, Star, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

export default function ReviewFormPage() {
  const { id, employeeId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Mock data
  const reviewForm = {
    cycleId: id,
    cycleName: 'Q4 2024 Performance Review',
    employeeName: 'John Smith',
    employeeTitle: 'Senior Software Engineer',
    employeeDepartment: 'Engineering',
    reviewType: 'MANAGER_REVIEW',
    ratingScale: 'FIVE_POINT',
    sections: [
      {
        id: 'objectives',
        name: 'Objectives & Key Results',
        weight: 60,
        description: 'Evaluate performance against set objectives for the review period',
        questions: [
          {
            id: 'obj_completion',
            text: 'How well did the employee achieve their objectives?',
            type: 'RATING',
            required: true,
            competencyKey: 'goal_achievement',
          },
          {
            id: 'obj_quality',
            text: 'Please provide specific examples of objective achievements:',
            type: 'MULTILINE',
            required: true,
          },
          {
            id: 'obj_challenges',
            text: 'What obstacles did they face and how did they overcome them?',
            type: 'MULTILINE',
            required: false,
          },
        ],
      },
      {
        id: 'competencies',
        name: 'Core Competencies',
        weight: 30,
        description: 'Rate performance across key competencies',
        questions: [
          {
            id: 'comp_technical',
            text: 'Technical Skills & Expertise',
            type: 'RATING',
            required: true,
            competencyKey: 'technical',
          },
          {
            id: 'comp_communication',
            text: 'Communication & Collaboration',
            type: 'RATING',
            required: true,
            competencyKey: 'communication',
          },
          {
            id: 'comp_leadership',
            text: 'Leadership & Initiative',
            type: 'RATING',
            required: true,
            competencyKey: 'leadership',
          },
          {
            id: 'comp_problem_solving',
            text: 'Problem Solving & Innovation',
            type: 'RATING',
            required: true,
            competencyKey: 'problem_solving',
          },
          {
            id: 'comp_comments',
            text: 'Please provide context for your competency ratings:',
            type: 'MULTILINE',
            required: true,
          },
        ],
      },
      {
        id: 'values',
        name: 'Company Values',
        weight: 10,
        description: 'Assess alignment with company values',
        questions: [
          {
            id: 'val_integrity',
            text: 'Integrity & Ethics',
            type: 'RATING',
            required: true,
            competencyKey: 'integrity',
          },
          {
            id: 'val_collaboration',
            text: 'Teamwork & Collaboration',
            type: 'RATING',
            required: true,
            competencyKey: 'teamwork',
          },
          {
            id: 'val_customer',
            text: 'Customer Focus',
            type: 'RATING',
            required: true,
            competencyKey: 'customer_focus',
          },
        ],
      },
      {
        id: 'development',
        name: 'Development & Growth',
        weight: 0,
        description: 'Identify strengths and areas for improvement',
        questions: [
          {
            id: 'dev_strengths',
            text: 'Key Strengths (What should they keep doing?)',
            type: 'MULTILINE',
            required: true,
          },
          {
            id: 'dev_improvements',
            text: 'Areas for Development (What could they improve?)',
            type: 'MULTILINE',
            required: true,
          },
          {
            id: 'dev_support',
            text: 'How can the organization support their growth?',
            type: 'MULTILINE',
            required: false,
          },
        ],
      },
    ],
  };

  const ratingDefinitions = {
    1: { label: 'Needs Improvement', description: 'Performance consistently below expectations', color: 'text-red-600' },
    2: { label: 'Developing', description: 'Performance occasionally below expectations', color: 'text-orange-600' },
    3: { label: 'Meets Expectations', description: 'Performance consistently meets expectations', color: 'text-yellow-600' },
    4: { label: 'Exceeds Expectations', description: 'Performance frequently exceeds expectations', color: 'text-green-600' },
    5: { label: 'Outstanding', description: 'Performance consistently far exceeds expectations', color: 'text-blue-600' },
  };

  const [currentSection, setCurrentSection] = useState(0);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [textResponses, setTextResponses] = useState<Record<string, string>>({});

  const handleRating = (questionId: string, value: number) => {
    setRatings({ ...ratings, [questionId]: value });
  };

  const handleTextChange = (questionId: string, value: string) => {
    setTextResponses({ ...textResponses, [questionId]: value });
  };

  const isQuestionAnswered = (question: any) => {
    if (question.type === 'RATING') {
      return ratings[question.id] !== undefined;
    }
    return textResponses[question.id]?.trim().length > 0;
  };

  const isSectionComplete = () => {
    const section = reviewForm.sections[currentSection];
    const requiredQuestions = section.questions.filter((q) => q.required);
    return requiredQuestions.every((q) => isQuestionAnswered(q));
  };

  const handleNext = () => {
    if (currentSection < reviewForm.sections.length - 1) {
      setCurrentSection(currentSection + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSaveDraft = () => {
    toast.success('Review saved as draft');
  };

  const handleSubmit = () => {
    const unansweredSections = reviewForm.sections.filter((section, idx) => {
      const requiredQuestions = section.questions.filter((q) => q.required);
      return requiredQuestions.some((q) => !isQuestionAnswered(q));
    });

    if (unansweredSections.length > 0) {
      toast.error('Please complete all required questions before submitting');
      return;
    }

    if (confirm('Are you sure you want to submit this review? You will not be able to edit it after submission.')) {
      toast.success('Review submitted successfully!');
      setTimeout(() => {
        navigate(`/performance/reviews/${id}`);
      }, 1500);
    }
  };

  const currentSectionData = reviewForm.sections[currentSection];
  const progressPercentage = ((currentSection + 1) / reviewForm.sections.length) * 100;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to={`/performance/reviews/${id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{reviewForm.cycleName}</h1>
            <p className="text-gray-600 mt-1">
              {reviewForm.reviewType.replace('_', ' ')} for {reviewForm.employeeName}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handleSubmit}>
            <Send className="h-4 w-4 mr-2" />
            Submit Review
          </Button>
        </div>
      </div>

      {/* Employee Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{reviewForm.employeeName}</h2>
              <p className="text-gray-600">{reviewForm.employeeTitle}</p>
              <p className="text-sm text-gray-500">{reviewForm.employeeDepartment}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Rating Scale</p>
              <p className="font-medium">{reviewForm.ratingScale.replace('_', '-')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress Bar */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-600">
            Section {currentSection + 1} of {reviewForm.sections.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {reviewForm.sections.map((section, idx) => (
          <button
            key={section.id}
            onClick={() => setCurrentSection(idx)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-colors ${
              idx === currentSection
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {section.name}
            {section.weight > 0 && <span className="ml-2 text-xs opacity-75">({section.weight}%)</span>}
          </button>
        ))}
      </div>

      {/* Rating Scale Reference */}
      {currentSectionData.questions.some((q) => q.type === 'RATING') && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Rating Scale Reference</h3>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(ratingDefinitions).map(([value, def]) => (
                <div key={value} className="text-center">
                  <div className={`font-bold ${def.color}`}>{value}</div>
                  <div className="text-xs font-medium text-gray-900">{def.label}</div>
                  <div className="text-xs text-gray-600">{def.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{currentSectionData.name}</CardTitle>
          {currentSectionData.description && (
            <p className="text-gray-600 mt-2">{currentSectionData.description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-8">
          {currentSectionData.questions.map((question) => (
            <div key={question.id} className="border-b pb-6 last:border-b-0">
              <div className="flex items-start justify-between mb-3">
                <label className="font-medium text-gray-900">
                  {question.text}
                  {question.required && <span className="text-red-600 ml-1">*</span>}
                </label>
              </div>

              {question.type === 'RATING' && (
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => handleRating(question.id, value)}
                      className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                        ratings[question.id] === value
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Star
                          className={`h-6 w-6 ${
                            ratings[question.id] === value
                              ? 'text-blue-600 fill-blue-600'
                              : 'text-gray-400'
                          }`}
                        />
                        <span className="text-2xl font-bold">{value}</span>
                        <span className="text-xs text-center">
                          {ratingDefinitions[value as keyof typeof ratingDefinitions].label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {question.type === 'TEXT' && (
                <input
                  type="text"
                  value={textResponses[question.id] || ''}
                  onChange={(e) => handleTextChange(question.id, e.target.value)}
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="Enter your response..."
                />
              )}

              {question.type === 'MULTILINE' && (
                <textarea
                  value={textResponses[question.id] || ''}
                  onChange={(e) => handleTextChange(question.id, e.target.value)}
                  rows={6}
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="Enter your detailed response..."
                />
              )}

              {question.required && !isQuestionAnswered(question) && (
                <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  This question is required
                </p>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pb-8">
        <Button variant="outline" onClick={handlePrevious} disabled={currentSection === 0}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous Section
        </Button>

        <div className="flex gap-2">
          {currentSection === reviewForm.sections.length - 1 ? (
            <>
              <Button variant="outline" onClick={handleSaveDraft}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button onClick={handleSubmit}>
                <Send className="h-4 w-4 mr-2" />
                Submit Review
              </Button>
            </>
          ) : (
            <Button onClick={handleNext} disabled={!isSectionComplete()}>
              Next Section
              <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
