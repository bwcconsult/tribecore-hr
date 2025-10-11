import { useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  User,
  Briefcase,
  Heart,
  Phone,
  Home,
  Users,
  AlertCircle,
  Calendar,
  Edit,
  Save,
  X,
  Plus,
  Search,
  Loader2,
} from 'lucide-react';
import { PRONOUNS, COUNTRIES, NEXT_OF_KIN_RELATIONSHIPS } from '../../constants/profile-data';
import { lookupPostcode, validatePostcode, type AddressResult } from '../../utils/postcodeService';

type TabType = 'personal' | 'employment' | 'contacts' | 'dependants' | 'nextofkin';

export default function PersonalDetailsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [isEditing, setIsEditing] = useState(false);

  const tabs = [
    { id: 'personal' as TabType, label: 'Personal Information', icon: User },
    { id: 'employment' as TabType, label: 'Employment', icon: Briefcase },
    { id: 'contacts' as TabType, label: 'Emergency Contacts', icon: AlertCircle },
    { id: 'nextofkin' as TabType, label: 'Next of Kin', icon: Heart },
    { id: 'dependants' as TabType, label: 'Dependants', icon: Users },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Personal & Work Details
        </h1>
        <p className="text-gray-600">
          Manage your personal information, employment details, and emergency contacts
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'personal' && <PersonalInformationTab />}
          {activeTab === 'employment' && <EmploymentTab />}
          {activeTab === 'contacts' && <EmergencyContactsTab />}
          {activeTab === 'nextofkin' && <NextOfKinTab />}
          {activeTab === 'dependants' && <DependantsTab />}
        </div>
      </div>
    </div>
  );
}

// Personal Information Tab
function PersonalInformationTab() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLookingUpPostcode, setIsLookingUpPostcode] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressResult[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('GB');
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    preferredName: 'Johnny',
    pronouns: 'he/him',
    dateOfBirth: '1990-05-15',
    gender: 'MALE',
    nationality: 'GB',
    maritalStatus: 'SINGLE',
    personalEmail: 'john@personal.com',
    workPhone: '+44 20 1234 5678',
    personalPhone: '+44 7700 900000',
    addressLine1: '123 Main Street',
    city: 'London',
    postcode: 'SW1A 1AA',
    country: 'GB',
  });

  const handlePostcodeLookup = async () => {
    if (!formData.postcode) {
      toast.error('Please enter a postcode');
      return;
    }

    setIsLookingUpPostcode(true);
    try {
      const results = await lookupPostcode(formData.postcode, selectedCountry);
      setAddressSuggestions(results);
      if (results.length > 0) {
        toast.success(`Found ${results.length} address${results.length > 1 ? 'es' : ''}`);
      }
    } catch (error) {
      toast.error('Failed to lookup postcode. Please enter address manually.');
      setAddressSuggestions([]);
    } finally {
      setIsLookingUpPostcode(false);
    }
  };

  const selectAddress = (address: AddressResult) => {
    setFormData({
      ...formData,
      addressLine1: address.line1,
      city: address.city,
      postcode: address.postcode,
      country: selectedCountry,
    });
    setAddressSuggestions([]);
    toast.success('Address selected');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          {isEditing ? (
            <>
              <X className="w-4 h-4" />
              Cancel
            </>
          ) : (
            <>
              <Edit className="w-4 h-4" />
              Edit
            </>
          )}
        </button>
      </div>

      {/* Legal Name */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Legal Name</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              type="text"
              defaultValue="John"
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              type="text"
              defaultValue="Doe"
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Name
            </label>
            <input
              type="text"
              defaultValue="Johnny"
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Pronouns
            </label>
            <select
              value={formData.pronouns}
              onChange={(e) => setFormData({ ...formData, pronouns: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
            >
              {PRONOUNS.map((pronoun) => (
                <option key={pronoun.value} value={pronoun.value}>
                  {pronoun.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              defaultValue="1990-05-15"
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              defaultValue="MALE"
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="NON_BINARY">Non-binary</option>
              <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nationality
            </label>
            <select
              value={formData.nationality}
              onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
            >
              {COUNTRIES.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marital Status
            </label>
            <select
              defaultValue="SINGLE"
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="SINGLE">Single</option>
              <option value="MARRIED">Married</option>
              <option value="DIVORCED">Divorced</option>
              <option value="WIDOWED">Widowed</option>
              <option value="CIVIL_PARTNERSHIP">Civil Partnership</option>
              <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Work Email
            </label>
            <input
              type="email"
              defaultValue="john.doe@company.com"
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Personal Email
            </label>
            <input
              type="email"
              defaultValue="john@personal.com"
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Work Phone
            </label>
            <input
              type="tel"
              defaultValue="+44 20 1234 5678"
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Personal Phone
            </label>
            <input
              type="tel"
              defaultValue="+44 7700 900000"
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Home Address</h3>
        <div className="grid grid-cols-1 gap-4">
          {/* Postcode Lookup */}
          {isEditing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postcode/ZIP Code Lookup
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="GB">UK</option>
                  <option value="US">USA</option>
                  <option value="CA">Canada</option>
                </select>
                <input
                  type="text"
                  value={formData.postcode}
                  onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                  placeholder="Enter postcode/ZIP"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={handlePostcodeLookup}
                  disabled={isLookingUpPostcode}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isLookingUpPostcode ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Looking up...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Find Address
                    </>
                  )}
                </button>
              </div>
              {addressSuggestions.length > 0 && (
                <div className="mt-2 bg-white border border-gray-200 rounded-lg divide-y">
                  {addressSuggestions.map((address, index) => (
                    <button
                      key={index}
                      onClick={() => selectAddress(address)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-sm font-medium text-gray-900">{address.line1}</div>
                      <div className="text-sm text-gray-600">
                        {address.city}, {address.postcode}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1
            </label>
            <input
              type="text"
              value={formData.addressLine1}
              onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postcode
              </label>
              <input
                type="text"
                value={formData.postcode}
                onChange={(e) => setFormData({ ...formData, postcode: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
              >
                {COUNTRIES.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      {isEditing && (
        <div className="pt-6 border-t border-gray-200">
          <div className="flex gap-3">
            <button 
              onClick={() => {
                // TODO: Save to API
                toast.success('Profile updated successfully!');
                setIsEditing(false);
              }}
              className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Employment Tab
function EmploymentTab() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Employment Details</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          {isEditing ? (
            <>
              <X className="w-4 h-4" />
              Cancel
            </>
          ) : (
            <>
              <Edit className="w-4 h-4" />
              Edit
            </>
          )}
        </button>
      </div>
      
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Current Position</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title
            </label>
            <input
              type="text"
              defaultValue="Senior Software Engineer"
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <input
              type="text"
              defaultValue="Engineering"
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              defaultValue="London, UK"
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              FTE
            </label>
            <input
              type="text"
              defaultValue="1.0 (Full-time)"
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      {isEditing && (
        <div className="pt-6 border-t border-gray-200">
          <div className="flex gap-3">
            <button 
              onClick={() => {
                // TODO: Save to API
                toast.success('Employment details updated successfully!');
                setIsEditing(false);
              }}
              className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Emergency Contacts Tab
function EmergencyContactsTab() {
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [contacts, setContacts] = useState([
    {
      id: '1',
      name: 'Jane Doe',
      relationship: 'SPOUSE',
      phoneNumber: '+44 7700 900001',
      email: 'jane@email.com',
      isPrimary: true,
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Emergency Contacts</h2>
        <button 
          onClick={() => setIsAddingContact(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      <div className="space-y-4">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium text-gray-900">{contact.name}</h3>
                  {contact.isPrimary && (
                    <span className="px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-full">
                      Primary
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Relationship:</span>
                    <span className="ml-2 text-gray-900">{contact.relationship}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <span className="ml-2 text-gray-900">{contact.phoneNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 text-gray-900">{contact.email}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => toast.info('Edit contact feature coming soon!')}
                className="text-gray-400 hover:text-gray-600"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Contact Modal/Form */}
      {isAddingContact && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Emergency Contact</h3>
              <button onClick={() => setIsAddingContact(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="SPOUSE">Spouse</option>
                  <option value="PARTNER">Partner</option>
                  <option value="PARENT">Parent</option>
                  <option value="SIBLING">Sibling</option>
                  <option value="FRIEND">Friend</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isPrimary" className="rounded border-gray-300" />
                <label htmlFor="isPrimary" className="text-sm text-gray-700">Set as primary contact</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => {
                  toast.success('Emergency contact added!');
                  setIsAddingContact(false);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Add Contact
              </button>
              <button 
                onClick={() => setIsAddingContact(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Next of Kin Tab
function NextOfKinTab() {
  const [isEditing, setIsEditing] = useState(false);
  const [nextOfKin, setNextOfKin] = useState([
    {
      id: '1',
      name: 'Jane Doe',
      relationship: 'SPOUSE',
      phoneNumber: '+44 7700 900001',
      email: 'jane@email.com',
      addressLine1: '123 Main Street',
      city: 'London',
      postcode: 'SW1A 1AA',
      country: 'GB',
      isPrimary: true,
    },
  ]);

  const [isAddingNextOfKin, setIsAddingNextOfKin] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Next of Kin</h2>
        <button 
          onClick={() => setIsAddingNextOfKin(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Next of Kin
        </button>
      </div>

      <div className="space-y-4">
        {nextOfKin.map((kin) => (
          <div
            key={kin.id}
            className="p-6 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900 text-lg">{kin.name}</h3>
                {kin.isPrimary && (
                  <span className="px-2 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 rounded-full">
                    Primary
                  </span>
                )}
              </div>
              <button 
                onClick={() => toast.info('Edit next of kin feature coming soon!')}
                className="text-gray-400 hover:text-gray-600"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Relationship:</span>
                    <span className="ml-2 text-gray-900">{NEXT_OF_KIN_RELATIONSHIPS.find(r => r.value === kin.relationship)?.label}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Phone:</span>
                    <span className="ml-2 text-gray-900">{kin.phoneNumber}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <span className="ml-2 text-gray-900">{kin.email}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Address</h4>
                <div className="space-y-1 text-sm text-gray-900">
                  <div>{kin.addressLine1}</div>
                  <div>{kin.city}, {kin.postcode}</div>
                  <div>{COUNTRIES.find(c => c.value === kin.country)?.label}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Next of Kin Modal/Form */}
      {isAddingNextOfKin && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Next of Kin</h3>
              <button onClick={() => setIsAddingNextOfKin(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Personal Details */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Personal Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Relationship *</label>
                    <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                      {NEXT_OF_KIN_RELATIONSHIPS.map((rel) => (
                        <option key={rel.value} value={rel.value}>{rel.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input type="tel" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Address</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1 *</label>
                    <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                    <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Postcode *</label>
                      <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                      <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        {COUNTRIES.map((country) => (
                          <option key={country.value} value={country.value}>{country.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="isPrimaryNOK" className="rounded border-gray-300" />
                <label htmlFor="isPrimaryNOK" className="text-sm text-gray-700">Set as primary next of kin</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
              <button 
                onClick={() => {
                  toast.success('Next of kin added!');
                  setIsAddingNextOfKin(false);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Add Next of Kin
              </button>
              <button 
                onClick={() => setIsAddingNextOfKin(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Dependants Tab
function DependantsTab() {
  const [isAddingDependant, setIsAddingDependant] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Dependants</h2>
        <button 
          onClick={() => setIsAddingDependant(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Dependant
        </button>
      </div>

      <div className="text-center py-12">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No dependants added
        </h3>
        <p className="text-gray-600 mb-4">
          Add your dependants for benefits enrollment and emergency purposes
        </p>
      </div>

      {/* Add Dependant Modal/Form */}
      {isAddingDependant && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add Dependant</h3>
              <button onClick={() => setIsAddingDependant(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="CHILD">Child</option>
                  <option value="SPOUSE">Spouse</option>
                  <option value="PARTNER">Partner</option>
                  <option value="PARENT">Parent</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isDependent" className="rounded border-gray-300" />
                <label htmlFor="isDependent" className="text-sm text-gray-700">Include in benefits</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => {
                  toast.success('Dependant added!');
                  setIsAddingDependant(false);
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Add Dependant
              </button>
              <button 
                onClick={() => setIsAddingDependant(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
