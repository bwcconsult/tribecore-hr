import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Save,
  Send,
  ArrowLeft,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

type QuestionType = 'MULTIPLE_CHOICE' | 'TEXT' | 'RATING' | 'YES_NO' | 'SCALE';

interface Question {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  order: number;
}

export default function SurveyBuilderPage() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: '',
      type,
      required: false,
      options: type === 'MULTIPLE_CHOICE' ? ['Option 1', 'Option 2'] : undefined,
      order: questions.length,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => (q.id === id ? { ...q, ...updates } : q)));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map(q =>
        q.id === questionId
          ? { ...q, options: [...(q.options || []), `Option ${(q.options?.length || 0) + 1}`] }
          : q
      )
    );
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map(q =>
        q.id === questionId
          ? {
              ...q,
              options: q.options?.map((opt, idx) => (idx === optionIndex ? value : opt)),
            }
          : q
      )
    );
  };

  const handleSave = () => {
    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }
    toast.success('Survey saved as draft!');
  };

  const handlePublish = () => {
    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }
    toast.success('Survey published successfully!');
    navigate('/surveys');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/surveys')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Survey Builder</h1>
            <p className="text-gray-600 mt-1">Add and configure survey questions</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
          <Button variant="outline" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={handlePublish}>
            <Send className="h-4 w-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      {!showPreview ? (
        <>
          {/* Question Types */}
          <Card>
            <CardHeader>
              <CardTitle>Add Question</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Button variant="outline" onClick={() => addQuestion('TEXT')}>
                  Text Response
                </Button>
                <Button variant="outline" onClick={() => addQuestion('MULTIPLE_CHOICE')}>
                  Multiple Choice
                </Button>
                <Button variant="outline" onClick={() => addQuestion('RATING')}>
                  Rating (1-5)
                </Button>
                <Button variant="outline" onClick={() => addQuestion('YES_NO')}>
                  Yes/No
                </Button>
                <Button variant="outline" onClick={() => addQuestion('SCALE')}>
                  Scale (1-10)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Questions List */}
          <div className="space-y-4">
            {questions.map((question, index) => (
              <Card key={question.id}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="cursor-move mt-2">
                      <GripVertical className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium mb-1">
                            Question {index + 1}
                          </label>
                          <input
                            type="text"
                            value={question.text}
                            onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                            placeholder="Enter your question..."
                            className="w-full border rounded px-3 py-2"
                          />
                        </div>
                        <div className="w-48">
                          <label className="block text-sm font-medium mb-1">Type</label>
                          <select
                            value={question.type}
                            onChange={(e) =>
                              updateQuestion(question.id, { type: e.target.value as QuestionType })
                            }
                            className="w-full border rounded px-3 py-2"
                          >
                            <option value="TEXT">Text</option>
                            <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                            <option value="RATING">Rating</option>
                            <option value="YES_NO">Yes/No</option>
                            <option value="SCALE">Scale</option>
                          </select>
                        </div>
                      </div>

                      {question.type === 'MULTIPLE_CHOICE' && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium">Options</label>
                          {question.options?.map((option, optIdx) => (
                            <div key={optIdx} className="flex gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) =>
                                  updateOption(question.id, optIdx, e.target.value)
                                }
                                className="flex-1 border rounded px-3 py-2"
                              />
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(question.id)}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Option
                          </Button>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={question.required}
                            onChange={(e) =>
                              updateQuestion(question.id, { required: e.target.checked })
                            }
                            className="rounded"
                          />
                          <span className="text-sm font-medium">Required question</span>
                        </label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {questions.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">
                  <p className="text-lg font-medium mb-2">No questions added yet</p>
                  <p className="text-sm">Click the buttons above to add your first question</p>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      ) : (
        /* Preview Mode */
        <Card>
          <CardHeader>
            <CardTitle>Survey Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="space-y-2">
                <label className="block font-medium">
                  {index + 1}. {question.text || 'Untitled Question'}
                  {question.required && <span className="text-red-600 ml-1">*</span>}
                </label>

                {question.type === 'TEXT' && (
                  <textarea className="w-full border rounded px-3 py-2" rows={3} />
                )}

                {question.type === 'MULTIPLE_CHOICE' && (
                  <div className="space-y-2">
                    {question.options?.map((option, idx) => (
                      <label key={idx} className="flex items-center gap-2">
                        <input type="radio" name={question.id} />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}

                {question.type === 'YES_NO' && (
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" name={question.id} />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name={question.id} />
                      <span>No</span>
                    </label>
                  </div>
                )}

                {(question.type === 'RATING' || question.type === 'SCALE') && (
                  <div className="flex gap-2">
                    {Array.from({
                      length: question.type === 'RATING' ? 5 : 10,
                    }).map((_, idx) => (
                      <button
                        key={idx}
                        className="w-10 h-10 border rounded hover:bg-blue-50"
                      >
                        {idx + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {questions.length === 0 && (
              <p className="text-center text-gray-500 py-8">
                No questions to preview. Add questions to see the preview.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
