import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, CheckCircle2, Clock, PlayCircle, 
  FileText, HelpCircle, BookOpen, Award, X 
} from 'lucide-react';
import * as learningService from '../../services/learningService';
import { toast } from 'react-hot-toast';

export default function CoursePlayerPage() {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [currentProgress, setCurrentProgress] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({});
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    if (enrollmentId) {
      loadCourseData();
    }
  }, [enrollmentId]);

  useEffect(() => {
    // Track time spent
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
      if (currentProgress && timeSpent > 0 && timeSpent % 30 === 0) {
        // Update progress every 30 seconds
        updateProgress();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentProgress, timeSpent]);

  const loadCourseData = async () => {
    try {
      const data = await learningService.getEnrollmentProgress(enrollmentId!);
      setEnrollment(data.enrollment);
      setModules(data.modules);
      
      // Auto-select first incomplete lesson
      const firstIncomplete = findFirstIncompleteLesson(data.modules);
      if (firstIncomplete) {
        selectLesson(firstIncomplete.lesson, firstIncomplete.progress);
      }
    } catch (error) {
      console.error('Failed to load course', error);
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const findFirstIncompleteLesson = (mods: any[]) => {
    for (const mod of mods) {
      for (const lesson of mod.lessons) {
        if (!lesson.progress || lesson.progress.status !== 'COMPLETED') {
          return { lesson, progress: lesson.progress };
        }
      }
    }
    return null;
  };

  const selectLesson = async (lesson: any, progress: any) => {
    setCurrentLesson(lesson);
    setCurrentProgress(progress);
    setQuizAnswers({});
    setTimeSpent(progress?.timeSpentSeconds || 0);

    // Start or resume lesson
    if (!progress) {
      try {
        const newProgress = await learningService.startLesson(
          enrollmentId!,
          lesson.id,
          enrollment.employeeId
        );
        setCurrentProgress(newProgress);
      } catch (error) {
        console.error('Failed to start lesson', error);
      }
    }
  };

  const updateProgress = async () => {
    if (!currentProgress) return;

    try {
      const updated = await learningService.updateLessonProgress(currentProgress.id, {
        timeSpentSeconds: timeSpent,
        progressPercentage: calculateLessonProgress(),
      });
      setCurrentProgress(updated);
    } catch (error) {
      console.error('Failed to update progress', error);
    }
  };

  const calculateLessonProgress = () => {
    if (!currentLesson) return 0;
    
    if (currentLesson.type === 'QUIZ') {
      const totalQuestions = currentLesson.quiz?.questions?.length || 0;
      const answeredQuestions = Object.keys(quizAnswers).length;
      return totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
    }
    
    if (currentLesson.type === 'VIDEO') {
      const requiredTime = currentLesson.durationMinutes * 60;
      return requiredTime > 0 ? Math.min((timeSpent / requiredTime) * 100, 100) : 100;
    }
    
    return timeSpent > 60 ? 100 : (timeSpent / 60) * 100;
  };

  const completeLesson = async () => {
    if (!currentProgress) return;

    try {
      await learningService.completeLesson(currentProgress.id);
      toast.success('Lesson completed!');
      await loadCourseData(); // Reload to get updated progress
      
      // Move to next lesson
      const nextLesson = findNextLesson();
      if (nextLesson) {
        selectLesson(nextLesson.lesson, nextLesson.progress);
      } else {
        toast.success('🎉 Course completed!');
      }
    } catch (error) {
      console.error('Failed to complete lesson', error);
      toast.error('Failed to complete lesson');
    }
  };

  const submitQuiz = async () => {
    if (!currentProgress || !currentLesson.quiz) return;

    const answers = currentLesson.quiz.questions.map((q: any) => ({
      questionId: q.id,
      answer: quizAnswers[q.id] || '',
    }));

    try {
      const result = await learningService.submitQuiz(currentProgress.id, answers);
      
      if (result.passed) {
        toast.success(`Quiz passed! Score: ${result.score}%`);
        await loadCourseData();
        const nextLesson = findNextLesson();
        if (nextLesson) {
          selectLesson(nextLesson.lesson, nextLesson.progress);
        }
      } else {
        toast.error(`Quiz failed. Score: ${result.score}%. Please try again.`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit quiz');
    }
  };

  const findNextLesson = () => {
    if (!currentLesson || !modules) return null;
    
    let foundCurrent = false;
    for (const mod of modules) {
      for (const lesson of mod.lessons) {
        if (foundCurrent) {
          return { lesson, progress: lesson.progress };
        }
        if (lesson.id === currentLesson.id) {
          foundCurrent = true;
        }
      }
    }
    return null;
  };

  const renderLessonContent = () => {
    if (!currentLesson) return null;

    switch (currentLesson.type) {
      case 'VIDEO':
        return (
          <div className="space-y-4">
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
              <PlayCircle className="w-16 h-16 text-white opacity-50" />
              <p className="text-white ml-4">Video Player Placeholder</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')} / {currentLesson.durationMinutes}:00</span>
              </div>
              <button
                onClick={completeLesson}
                disabled={timeSpent < currentLesson.durationMinutes * 60}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300"
              >
                Mark as Complete
              </button>
            </div>
          </div>
        );

      case 'READING':
      case 'DOCUMENT':
        return (
          <div className="space-y-4">
            <div className="prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: currentLesson.content || '<p>Content loading...</p>' }} />
            </div>
            <button
              onClick={completeLesson}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Mark as Complete
            </button>
          </div>
        );

      case 'QUIZ':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Quiz Assessment</h3>
              <p className="text-sm text-blue-700">
                Passing score: {currentLesson.quiz.passingScore}% | 
                Attempts: {currentProgress?.quizAttempts || 0} / {currentLesson.quiz.attempts}
              </p>
            </div>

            {currentLesson.quiz.questions.map((question: any, idx: number) => (
              <div key={question.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <p className="font-medium text-gray-900 mb-4">
                  {idx + 1}. {question.question}
                </p>

                {question.type === 'MULTIPLE_CHOICE' && (
                  <div className="space-y-2">
                    {question.options.map((option: string, optIdx: number) => (
                      <label key={optIdx} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={quizAnswers[question.id] === option}
                          onChange={(e) => setQuizAnswers({ ...quizAnswers, [question.id]: e.target.value })}
                          className="w-4 h-4"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'TRUE_FALSE' && (
                  <div className="flex gap-4">
                    {['True', 'False'].map((option) => (
                      <label key={option} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer flex-1">
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={quizAnswers[question.id] === option}
                          onChange={(e) => setQuizAnswers({ ...quizAnswers, [question.id]: e.target.value })}
                          className="w-4 h-4"
                        />
                        <span className="text-gray-700 font-medium">{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'SHORT_ANSWER' && (
                  <input
                    type="text"
                    value={quizAnswers[question.id] || ''}
                    onChange={(e) => setQuizAnswers({ ...quizAnswers, [question.id]: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your answer..."
                  />
                )}
              </div>
            ))}

            <button
              onClick={submitQuiz}
              disabled={Object.keys(quizAnswers).length < currentLesson.quiz.questions.length}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-gray-300"
            >
              Submit Quiz
            </button>
          </div>
        );

      default:
        return <p className="text-gray-500">Content type not supported</p>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/learning')}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">{enrollment?.course?.title}</h1>
                <p className="text-sm text-gray-600">Progress: {Math.round(enrollment?.progressPercentage || 0)}%</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${enrollment?.progressPercentage || 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {Math.round(enrollment?.progressPercentage || 0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar - Course Structure */}
          <div className="col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-24">
              <h2 className="font-semibold text-gray-900 mb-4">Course Content</h2>
              <div className="space-y-3">
                {modules.map((module: any, modIdx: number) => (
                  <div key={module.id} className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">
                      Module {modIdx + 1}: {module.title}
                    </p>
                    <div className="space-y-1 ml-2">
                      {module.lessons.map((lesson: any, lessonIdx: number) => (
                        <button
                          key={lesson.id}
                          onClick={() => selectLesson(lesson, lesson.progress)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                            currentLesson?.id === lesson.id
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : lesson.progress?.status === 'COMPLETED'
                              ? 'text-green-600 hover:bg-green-50'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {lesson.progress?.status === 'COMPLETED' ? (
                            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                          ) : (
                            <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0" />
                          )}
                          <span className="flex-1">{lesson.title}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              {currentLesson ? (
                <>
                  <div className="mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      {currentLesson.type === 'VIDEO' && <PlayCircle className="w-4 h-4" />}
                      {currentLesson.type === 'QUIZ' && <HelpCircle className="w-4 h-4" />}
                      {(currentLesson.type === 'READING' || currentLesson.type === 'DOCUMENT') && <FileText className="w-4 h-4" />}
                      <span className="uppercase">{currentLesson.type}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentLesson.title}</h2>
                    <p className="text-gray-600">{currentLesson.description}</p>
                  </div>

                  {renderLessonContent()}
                </>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a lesson to begin</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
