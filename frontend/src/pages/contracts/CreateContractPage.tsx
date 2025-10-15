import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, ChevronLeft, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

export default function CreateContractPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: 'EMPLOYMENT',
    title: '',
    description: '',
    counterpartyName: '',
    counterpartyEmail: '',
    value: '',
    currency: 'GBP',
    startDate: '',
    endDate: '',
    jurisdiction: 'UK',
    dataCategories: [] as string[],
    requiresDPIA: false,
    requiresSCC: false,
  });

  const handleSubmit = async () => {
    // API call to create contract
    toast.success('Contract created successfully');
    navigate('/contracts');
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Contract</h1>
        <p className="text-gray-600 mt-1">Complete the form to create a new contract</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {s}
            </div>
            {s < 3 && (
              <div
                className={`w-24 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`}
              ></div>
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && 'Basic Information'}
            {step === 2 && 'Financial & Dates'}
            {step === 3 && 'Compliance & Risk'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Contract Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => updateField('type', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="EMPLOYMENT">Employment</option>
                    <option value="VENDOR">Vendor Agreement</option>
                    <option value="CUSTOMER">Customer Agreement</option>
                    <option value="NDA">Non-Disclosure Agreement</option>
                    <option value="MSA">Master Service Agreement</option>
                    <option value="SOW">Statement of Work</option>
                    <option value="SLA">Service Level Agreement</option>
                    <option value="LEASE">Lease Agreement</option>
                    <option value="PARTNERSHIP">Partnership Agreement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Contract Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="e.g., Senior Software Engineer Employment Contract"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={4}
                    placeholder="Brief description of the contract"
                    className="w-full px-3 py-2 border rounded-lg"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Counterparty Name *
                    </label>
                    <input
                      type="text"
                      value={formData.counterpartyName}
                      onChange={(e) => updateField('counterpartyName', e.target.value)}
                      placeholder="Individual or Company Name"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Counterparty Email</label>
                    <input
                      type="email"
                      value={formData.counterpartyEmail}
                      onChange={(e) => updateField('counterpartyEmail', e.target.value)}
                      placeholder="contact@example.com"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 2: Financial & Dates */}
            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Contract Value</label>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => updateField('value', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Currency</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => updateField('currency', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="GBP">GBP (£)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Start Date *</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => updateField('startDate', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">End Date *</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => updateField('endDate', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 3: Compliance */}
            {step === 3 && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Jurisdiction</label>
                  <select
                    value={formData.jurisdiction}
                    onChange={(e) => updateField('jurisdiction', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="UK">United Kingdom</option>
                    <option value="US-NY">United States - New York</option>
                    <option value="EU">European Union</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Data Categories</label>
                  <div className="space-y-2">
                    {['PII', 'PHI', 'FINANCIAL', 'CONFIDENTIAL'].map((cat) => (
                      <label key={cat} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.dataCategories.includes(cat)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateField('dataCategories', [...formData.dataCategories, cat]);
                            } else {
                              updateField(
                                'dataCategories',
                                formData.dataCategories.filter((c) => c !== cat),
                              );
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.requiresDPIA}
                      onChange={(e) => updateField('requiresDPIA', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">
                      Requires Data Protection Impact Assessment (DPIA)
                    </span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.requiresSCC}
                      onChange={(e) => updateField('requiresSCC', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">
                      Requires Standard Contractual Clauses (SCC)
                    </span>
                  </label>
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <div>
                {step > 1 && (
                  <Button variant="outline" onClick={handleBack}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => navigate('/contracts')}>
                  Cancel
                </Button>
                {step < 3 ? (
                  <Button onClick={handleNext}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit}>
                    <Save className="h-4 w-4 mr-2" />
                    Create Contract
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
