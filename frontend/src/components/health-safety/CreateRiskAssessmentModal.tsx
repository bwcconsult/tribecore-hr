import { useState } from 'react';
import { X, Plus, Trash2, Shield, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface Hazard {
  id: string;
  hazard: string;
  whoAtRisk: string;
  existingControls: string;
  likelihood: number;
  severity: number;
  additionalControls: string;
  actionRequired: string;
  actionOwner: string;
  actionDeadline: string;
}

interface CreateRiskAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function CreateRiskAssessmentModal({ isOpen, onClose, onSubmit }: CreateRiskAssessmentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    department: '',
    assessedBy: '',
    assessmentDate: '',
    nextReviewDate: '',
  });

  const [hazards, setHazards] = useState<Hazard[]>([
    {
      id: '1',
      hazard: '',
      whoAtRisk: '',
      existingControls: '',
      likelihood: 3,
      severity: 3,
      additionalControls: '',
      actionRequired: '',
      actionOwner: '',
      actionDeadline: '',
    },
  ]);

  if (!isOpen) return null;

  const calculateRiskLevel = (likelihood: number, severity: number) => {
    const rating = likelihood * severity;
    if (rating <= 5) return { level: 'LOW', color: 'bg-green-100 text-green-700' };
    if (rating <= 12) return { level: 'MEDIUM', color: 'bg-yellow-100 text-yellow-700' };
    if (rating <= 20) return { level: 'HIGH', color: 'bg-orange-100 text-orange-700' };
    return { level: 'VERY HIGH', color: 'bg-red-100 text-red-700' };
  };

  const addHazard = () => {
    setHazards([
      ...hazards,
      {
        id: Date.now().toString(),
        hazard: '',
        whoAtRisk: '',
        existingControls: '',
        likelihood: 3,
        severity: 3,
        additionalControls: '',
        actionRequired: '',
        actionOwner: '',
        actionDeadline: '',
      },
    ]);
  };

  const removeHazard = (id: string) => {
    if (hazards.length > 1) {
      setHazards(hazards.filter(h => h.id !== id));
    }
  };

  const updateHazard = (id: string, field: string, value: any) => {
    setHazards(hazards.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      organizationId: 'org-123',
      hazards: hazards.filter(h => h.hazard.trim()),
    };

    try {
      await onSubmit(payload);
      toast.success('Risk assessment created successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to create risk assessment');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">New Risk Assessment</h2>
              <p className="text-sm text-gray-600">Create and manage risk assessments with 600+ templates</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Assessment Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Office workstation assessment"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the work activity or process being assessed..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Main Office"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g., Operations"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assessed By *</label>
                <input
                  type="text"
                  required
                  value={formData.assessedBy}
                  onChange={(e) => setFormData({ ...formData, assessedBy: e.target.value })}
                  placeholder="Assessor name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Date *</label>
                <input
                  type="date"
                  required
                  value={formData.assessmentDate}
                  onChange={(e) => setFormData({ ...formData, assessmentDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Next Review Date</label>
                <input
                  type="date"
                  value={formData.nextReviewDate}
                  onChange={(e) => setFormData({ ...formData, nextReviewDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Hazards Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Hazards & Controls</h3>
              <button
                type="button"
                onClick={addHazard}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Hazard
              </button>
            </div>

            <div className="space-y-6">
              {hazards.map((hazard, index) => {
                const risk = calculateRiskLevel(hazard.likelihood, hazard.severity);
                return (
                  <div key={hazard.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">Hazard #{index + 1}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${risk.color}`}>
                          Risk: {risk.level} ({hazard.likelihood * hazard.severity})
                        </span>
                        {hazards.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeHazard(hazard.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <AlertTriangle className="w-4 h-4 inline mr-1" />
                          Hazard Description *
                        </label>
                        <input
                          type="text"
                          required
                          value={hazard.hazard}
                          onChange={(e) => updateHazard(hazard.id, 'hazard', e.target.value)}
                          placeholder="e.g., Slips, trips and falls"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Who is at Risk?</label>
                        <input
                          type="text"
                          value={hazard.whoAtRisk}
                          onChange={(e) => updateHazard(hazard.id, 'whoAtRisk', e.target.value)}
                          placeholder="e.g., All employees, Visitors"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Existing Controls</label>
                        <input
                          type="text"
                          value={hazard.existingControls}
                          onChange={(e) => updateHazard(hazard.id, 'existingControls', e.target.value)}
                          placeholder="Current control measures"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Likelihood (1-5) *
                        </label>
                        <select
                          value={hazard.likelihood}
                          onChange={(e) => updateHazard(hazard.id, 'likelihood', parseInt(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={1}>1 - Very Unlikely</option>
                          <option value={2}>2 - Unlikely</option>
                          <option value={3}>3 - Possible</option>
                          <option value={4}>4 - Likely</option>
                          <option value={5}>5 - Very Likely</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Severity (1-5) *
                        </label>
                        <select
                          value={hazard.severity}
                          onChange={(e) => updateHazard(hazard.id, 'severity', parseInt(e.target.value))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={1}>1 - Negligible</option>
                          <option value={2}>2 - Minor</option>
                          <option value={3}>3 - Moderate</option>
                          <option value={4}>4 - Major</option>
                          <option value={5}>5 - Catastrophic</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Additional Controls Required</label>
                        <input
                          type="text"
                          value={hazard.additionalControls}
                          onChange={(e) => updateHazard(hazard.id, 'additionalControls', e.target.value)}
                          placeholder="What else needs to be done?"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Action Required</label>
                        <input
                          type="text"
                          value={hazard.actionRequired}
                          onChange={(e) => updateHazard(hazard.id, 'actionRequired', e.target.value)}
                          placeholder="Specific actions needed"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Action Owner</label>
                        <input
                          type="text"
                          value={hazard.actionOwner}
                          onChange={(e) => updateHazard(hazard.id, 'actionOwner', e.target.value)}
                          placeholder="Who is responsible?"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Action Deadline</label>
                        <input
                          type="date"
                          value={hazard.actionDeadline}
                          onChange={(e) => updateHazard(hazard.id, 'actionDeadline', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Assessment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
