import { useState } from 'react';
import { X, Plane, MapPin, Calendar, DollarSign, FileText } from 'lucide-react';

interface NewTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function NewTripModal({ isOpen, onClose, onSubmit }: NewTripModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    tripName: '',
    tripType: 'DOMESTIC',
    fromLocation: '',
    toLocation: '',
    destinationCountry: '',
    isVisaRequired: false,
    businessPurpose: '',
    startDate: '',
    endDate: '',
    estimatedCost: '',
    currency: 'GBP',
    travelPreferences: {
      flightClass: '',
      hotelPreference: '',
      mealPreference: '',
      specialRequests: '',
    },
    notes: '',
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">New Trip Request</h2>
              <p className="text-sm text-gray-600">Step {step} of 2</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
            <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`} />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          {step === 1 && (
            <div className="p-6 space-y-5">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">Trip Details</h3>

              {/* Trip Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trip Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="tripName"
                  value={formData.tripName}
                  onChange={handleChange}
                  placeholder="e.g., Trip to New York"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Trip Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Travel Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.tripType === 'DOMESTIC'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <input
                      type="radio"
                      name="tripType"
                      value="DOMESTIC"
                      checked={formData.tripType === 'DOMESTIC'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Domestic</p>
                      <p className="text-sm text-gray-500">Within your home country</p>
                    </div>
                  </label>
                  <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.tripType === 'INTERNATIONAL'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}>
                    <input
                      type="radio"
                      name="tripType"
                      value="INTERNATIONAL"
                      checked={formData.tripType === 'INTERNATIONAL'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">International</p>
                      <p className="text-sm text-gray-500">Outside your home country</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* From/To Locations */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fromLocation"
                    value={formData.fromLocation}
                    onChange={handleChange}
                    placeholder="e.g., London - LHR"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="toLocation"
                    value={formData.toLocation}
                    onChange={handleChange}
                    placeholder="e.g., New York - JFK"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* International Fields */}
              {formData.tripType === 'INTERNATIONAL' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Destination Country
                    </label>
                    <input
                      type="text"
                      name="destinationCountry"
                      value={formData.destinationCountry}
                      onChange={handleChange}
                      placeholder="Select country"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isVisaRequired"
                        checked={formData.isVisaRequired}
                        onChange={handleChange}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Visa Required</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Business Purpose */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Purpose
                </label>
                <textarea
                  name="businessPurpose"
                  value={formData.businessPurpose}
                  onChange={handleChange}
                  placeholder="Max 250 characters"
                  rows={3}
                  maxLength={250}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{formData.businessPurpose.length}/250</p>
              </div>

              {/* Estimated Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Cost
                </label>
                <div className="flex gap-2">
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="GBP">GBP</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                  <input
                    type="number"
                    name="estimatedCost"
                    value={formData.estimatedCost}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="p-6 space-y-5">
              <h3 className="font-semibold text-lg text-gray-900 mb-4">Travel Preferences (Optional)</h3>

              {/* Flight Class */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Flight Class
                </label>
                <select
                  name="travelPreferences.flightClass"
                  value={formData.travelPreferences.flightClass}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select class</option>
                  <option value="Economy">Economy</option>
                  <option value="Premium Economy">Premium Economy</option>
                  <option value="Business">Business</option>
                  <option value="First">First Class</option>
                </select>
              </div>

              {/* Hotel Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hotel Preference
                </label>
                <input
                  type="text"
                  name="travelPreferences.hotelPreference"
                  value={formData.travelPreferences.hotelPreference}
                  onChange={handleChange}
                  placeholder="e.g., Marriott, Hilton"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Meal Preference */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meal Preference
                </label>
                <input
                  type="text"
                  name="travelPreferences.mealPreference"
                  value={formData.travelPreferences.mealPreference}
                  onChange={handleChange}
                  placeholder="e.g., Vegetarian, Vegan, Halal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requests
                </label>
                <textarea
                  name="travelPreferences.specialRequests"
                  value={formData.travelPreferences.specialRequests}
                  onChange={handleChange}
                  placeholder="Any special requirements or requests"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Any other information"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-between bg-gray-50">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-white transition-colors"
            >
              Back
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-white transition-colors"
            >
              Cancel
            </button>
          )}
          <div className="flex gap-3">
            {step < 2 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Save and Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
