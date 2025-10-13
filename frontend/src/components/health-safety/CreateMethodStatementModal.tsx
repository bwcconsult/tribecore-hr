import { useState } from 'react';
import { X, FileText, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface CreateMethodStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function CreateMethodStatementModal({ isOpen, onClose, onSubmit }: CreateMethodStatementModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    activity: '',
    location: '',
    preparedBy: '',
    issueDate: '',
  });

  const [steps, setSteps] = useState([{ task: '', hazards: '', controls: '', ppe: '' }]);

  if (!isOpen) return null;

  const addStep = () => setSteps([...steps, { task: '', hazards: '', controls: '', ppe: '' }]);
  const removeStep = (idx: number) => setSteps(steps.filter((_, i) => i !== idx));
  const updateStep = (idx: number, field: string, value: string) => {
    const newSteps = [...steps];
    newSteps[idx] = { ...newSteps[idx], [field]: value };
    setSteps(newSteps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      organizationId: 'org-123',
      sequence: steps.map((s, i) => ({ step: i + 1, ...s, hazards: s.hazards.split(','), controls: s.controls.split(','), ppe: s.ppe.split(',') })),
      scope: { objectives: '', limitations: '', assumptions: '' },
      resources: { personnel: [], equipment: [], materials: [] },
    };
    try {
      await onSubmit(payload);
      toast.success('Method statement created');
      onClose();
    } catch (error) {
      toast.error('Failed to create method statement');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-xl font-bold">Create Method Statement</h2>
          </div>
          <button onClick={onClose}><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="Title *" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="px-4 py-2 border rounded-lg" />
            <input required placeholder="Activity *" value={formData.activity} onChange={(e) => setFormData({ ...formData, activity: e.target.value })} className="px-4 py-2 border rounded-lg" />
            <input required placeholder="Location *" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="px-4 py-2 border rounded-lg" />
            <input required placeholder="Prepared By *" value={formData.preparedBy} onChange={(e) => setFormData({ ...formData, preparedBy: e.target.value })} className="px-4 py-2 border rounded-lg" />
            <input type="date" required value={formData.issueDate} onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })} className="px-4 py-2 border rounded-lg" />
          </div>

          <textarea required rows={3} placeholder="Description *" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2 border rounded-lg" />

          <div>
            <div className="flex justify-between mb-3">
              <h3 className="font-semibold">Work Steps</h3>
              <button type="button" onClick={addStep} className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg text-sm"><Plus className="w-4 h-4" />Add Step</button>
            </div>
            {steps.map((step, idx) => (
              <div key={idx} className="border rounded-lg p-4 mb-3 space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Step {idx + 1}</span>
                  {steps.length > 1 && <button type="button" onClick={() => removeStep(idx)}><Trash2 className="w-4 h-4 text-red-600" /></button>}
                </div>
                <input placeholder="Task" value={step.task} onChange={(e) => updateStep(idx, 'task', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                <input placeholder="Hazards (comma separated)" value={step.hazards} onChange={(e) => updateStep(idx, 'hazards', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                <input placeholder="Controls (comma separated)" value={step.controls} onChange={(e) => updateStep(idx, 'controls', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                <input placeholder="PPE Required (comma separated)" value={step.ppe} onChange={(e) => updateStep(idx, 'ppe', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <button type="button" onClick={onClose} className="px-6 py-2 border rounded-lg">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg">Create Statement</button>
          </div>
        </form>
      </div>
    </div>
  );
}
