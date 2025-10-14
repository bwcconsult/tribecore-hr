import { useState, useEffect } from 'react';
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  Copy,
  Save,
  X,
  Calendar,
  Clock,
  DollarSign,
  Shield,
  AlertCircle,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { holidayPlannerService, LeaveType } from '../../services/holidayPlannerService';

export default function HRPolicyStudio() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [selectedType, setSelectedType] = useState<LeaveType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    entitlement: true,
    accrual: false,
    carryover: false,
    purchaseSell: false,
    approval: false,
    compliance: false,
  });

  // Mock organization ID
  const organizationId = 'ORG001';

  useEffect(() => {
    loadPolicy();
  }, []);

  const loadPolicy = async () => {
    try {
      setLoading(true);
      const policy = await holidayPlannerService.getPolicy(organizationId);
      setLeaveTypes(policy.leaveTypes);
    } catch (error) {
      console.error('Failed to load policy:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getLeaveTypeColor = (code: string): string => {
    const colors: Record<string, string> = {
      AL: '#4CAF50',
      SICK: '#F44336',
      TOIL: '#9C27B0',
      MAT: '#FF9800',
      PAT: '#2196F3',
      STUDY: '#673AB7',
    };
    return colors[code] || '#757575';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading policy studio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Settings className="w-8 h-8 text-blue-600" />
              HR Policy Studio
            </h1>
            <p className="text-gray-600 mt-1">No-code leave policy configuration</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md">
            <Plus className="w-5 h-5" />
            New Leave Type
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Leave Types</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{leaveTypes.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Policies</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {leaveTypes.filter(lt => lt.unit).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">With Carryover</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {leaveTypes.filter(lt => lt.carryover?.enabled).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Purchase/Sell</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {leaveTypes.filter(lt => lt.purchaseSell?.purchaseEnabled || lt.purchaseSell?.sellEnabled).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leave Types List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Types</h3>
            
            {leaveTypes.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No leave types configured</p>
                <button className="mt-4 text-sm text-blue-600 hover:text-blue-700">
                  Add your first leave type
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {leaveTypes.map((type) => (
                  <button
                    key={type.code}
                    onClick={() => setSelectedType(type)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      selectedType?.code === type.code
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getLeaveTypeColor(type.code) }}
                        />
                        <span className="font-medium text-gray-900">{type.name}</span>
                      </div>
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {type.code}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>Unit: {type.unit}</span>
                      {type.minNoticeDays > 0 && (
                        <span>Notice: {type.minNoticeDays}d</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Configuration Panel */}
        <div className="lg:col-span-2">
          {!selectedType ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Info className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Select a Leave Type
              </h3>
              <p className="text-gray-600">
                Choose a leave type from the list to view and edit its configuration
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: getLeaveTypeColor(selectedType.code) }}
                      />
                      {selectedType.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Code: {selectedType.code} • Unit: {selectedType.unit}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                      <Copy className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className={`p-2 rounded-lg ${
                        isEditing
                          ? 'text-blue-600 bg-blue-100'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Configuration Sections */}
              <div className="p-6 space-y-4">
                {/* Entitlement Section */}
                <div className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleSection('entitlement')}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">Entitlement</span>
                    </div>
                    {expandedSections.entitlement ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  {expandedSections.entitlement && (
                    <div className="p-4 pt-0 space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Full-Time Hours/Year:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {selectedType.entitlement?.fullTimeHoursPerYear || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Full-Time Days/Year:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {selectedType.entitlement?.fullTimeDaysPerYear || 'N/A'}
                          </span>
                        </div>
                      </div>
                      {isEditing && (
                        <div className="pt-3 border-t border-gray-200">
                          <input
                            type="number"
                            placeholder="Full-Time Hours/Year"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            defaultValue={selectedType.entitlement?.fullTimeHoursPerYear}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Accrual Section */}
                <div className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleSection('accrual')}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-gray-900">Accrual</span>
                    </div>
                    {expandedSections.accrual ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  {expandedSections.accrual && (
                    <div className="p-4 pt-0 space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Method:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {selectedType.accrual?.method || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Rounding:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {selectedType.accrual?.rounding || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Carryover Section */}
                {selectedType.carryover && (
                  <div className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleSection('carryover')}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-gray-900">Carryover</span>
                        {selectedType.carryover.enabled && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                            Enabled
                          </span>
                        )}
                      </div>
                      {expandedSections.carryover ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    {expandedSections.carryover && (
                      <div className="p-4 pt-0 space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Max Hours:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {selectedType.carryover.maxHours || 'Unlimited'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Expires On:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {selectedType.carryover.expiresOn || 'Never'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Purchase/Sell Section */}
                {selectedType.purchaseSell && (
                  <div className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleSection('purchaseSell')}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-orange-600" />
                        <span className="font-semibold text-gray-900">Purchase/Sell</span>
                        {(selectedType.purchaseSell.purchaseEnabled || selectedType.purchaseSell.sellEnabled) && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                            Available
                          </span>
                        )}
                      </div>
                      {expandedSections.purchaseSell ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    {expandedSections.purchaseSell && (
                      <div className="p-4 pt-0 space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Purchase Max:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {selectedType.purchaseSell.purchaseMaxHours || 0}h
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Sell Max:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {selectedType.purchaseSell.sellMaxHours || 0}h
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Approval Requirements */}
                <div className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleSection('approval')}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-900">Approval</span>
                    </div>
                    {expandedSections.approval ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  {expandedSections.approval && (
                    <div className="p-4 pt-0 space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Min Notice Days:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {selectedType.minNoticeDays}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Min Block Hours:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {selectedType.minNoticeDays}h
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {isEditing && (
                <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <X className="w-4 h-4 inline mr-2" />
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Save className="w-4 h-4 inline mr-2" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Preset Templates */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preset Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {['UK Standard', 'US FMLA', 'SA BCEA', 'Nigeria', 'NHS AfC'].map((preset) => (
            <button
              key={preset}
              className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-center"
            >
              <p className="font-medium text-gray-900">{preset}</p>
              <p className="text-xs text-gray-600 mt-1">Apply preset</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
