import { useState } from 'react';
import { X, Upload, User, MapPin, Calendar, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function ReportIncidentModal({ isOpen, onClose, onSubmit }: ReportIncidentModalProps) {
  const [formData, setFormData] = useState({
    type: 'ACCIDENT',
    severity: 'MINOR',
    title: '',
    description: '',
    incidentDateTime: '',
    location: '',
    specificLocation: '',
    reportedBy: '',
    personsInvolved: '',
    witnesses: '',
    immediateAction: '',
    injuryDetails: '',
    medicalTreatmentRequired: false,
    hospitalVisit: false,
    isRIDDORReportable: false,
  });

  const [photos, setPhotos] = useState<File[]>([]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      organizationId: 'org-123', // Get from auth context
      personsInvolved: formData.personsInvolved.split(',').map(p => p.trim()).filter(Boolean),
      witnesses: formData.witnesses.split(',').map(w => w.trim()).filter(Boolean),
    };

    try {
      await onSubmit(payload);
      toast.success('Incident reported successfully');
      onClose();
      setFormData({
        type: 'ACCIDENT',
        severity: 'MINOR',
        title: '',
        description: '',
        incidentDateTime: '',
        location: '',
        specificLocation: '',
        reportedBy: '',
        personsInvolved: '',
        witnesses: '',
        immediateAction: '',
        injuryDetails: '',
        medicalTreatmentRequired: false,
        hospitalVisit: false,
        isRIDDORReportable: false,
      });
    } catch (error) {
      toast.error('Failed to report incident');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Report Incident</h2>
              <p className="text-sm text-gray-600">Report accidents and near-misses in real-time</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Incident Type & Severity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Incident Type *</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="ACCIDENT">Accident</option>
                <option value="NEAR_MISS">Near Miss</option>
                <option value="DANGEROUS_OCCURRENCE">Dangerous Occurrence</option>
                <option value="OCCUPATIONAL_ILL_HEALTH">Occupational Ill Health</option>
                <option value="PROPERTY_DAMAGE">Property Damage</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Severity *</label>
              <select
                required
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              >
                <option value="MINOR">Minor</option>
                <option value="MODERATE">Moderate</option>
                <option value="SERIOUS">Serious</option>
                <option value="MAJOR">Major</option>
                <option value="FATAL">Fatal</option>
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Incident Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Slip on wet floor"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide detailed description of what happened..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Date/Time & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.incidentDateTime}
                onChange={(e) => setFormData({ ...formData, incidentDateTime: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Warehouse A"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Specific Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Specific Location</label>
            <input
              type="text"
              value={formData.specificLocation}
              onChange={(e) => setFormData({ ...formData, specificLocation: e.target.value })}
              placeholder="e.g., Near loading dock, Aisle 3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* People Involved */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Persons Involved
              </label>
              <input
                type="text"
                value={formData.personsInvolved}
                onChange={(e) => setFormData({ ...formData, personsInvolved: e.target.value })}
                placeholder="Names separated by commas"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Witnesses</label>
              <input
                type="text"
                value={formData.witnesses}
                onChange={(e) => setFormData({ ...formData, witnesses: e.target.value })}
                placeholder="Names separated by commas"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Immediate Action */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Immediate Action Taken</label>
            <textarea
              rows={3}
              value={formData.immediateAction}
              onChange={(e) => setFormData({ ...formData, immediateAction: e.target.value })}
              placeholder="What immediate actions were taken?"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Injury Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Injury Details (if applicable)</label>
            <textarea
              rows={3}
              value={formData.injuryDetails}
              onChange={(e) => setFormData({ ...formData, injuryDetails: e.target.value })}
              placeholder="Describe any injuries sustained..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.medicalTreatmentRequired}
                onChange={(e) => setFormData({ ...formData, medicalTreatmentRequired: e.target.checked })}
                className="w-4 h-4 text-red-600 rounded"
              />
              <span className="text-sm text-gray-700">Medical treatment required</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.hospitalVisit}
                onChange={(e) => setFormData({ ...formData, hospitalVisit: e.target.checked })}
                className="w-4 h-4 text-red-600 rounded"
              />
              <span className="text-sm text-gray-700">Hospital visit required</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isRIDDORReportable}
                onChange={(e) => setFormData({ ...formData, isRIDDORReportable: e.target.checked })}
                className="w-4 h-4 text-red-600 rounded"
              />
              <span className="text-sm text-gray-700">RIDDOR reportable</span>
            </label>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Upload className="w-4 h-4 inline mr-1" />
              Upload Photos
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files) {
                    setPhotos(Array.from(e.target.files));
                  }
                }}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Click to upload photos</p>
                <p className="text-xs text-gray-400 mt-1">{photos.length} file(s) selected</p>
              </label>
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
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Report Incident
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
