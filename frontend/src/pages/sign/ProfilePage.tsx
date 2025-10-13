import React, { useState, useEffect } from 'react';
import { Edit, Search } from 'lucide-react';
import axios from 'axios';

interface UserProfile {
  id: string;
  userId: string;
  signatureData: string | null;
  initialData: string | null;
  stampData: string | null;
  company: string;
  jobTitle: string;
  dateFormat: string;
  timeZone: string;
  delegateEnabled: boolean;
  delegateUserId: string | null;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'my_profile' | 'delegate'>('my_profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'Bill',
    lastName: 'Essien',
    company: '',
    jobTitle: '',
    dateFormat: 'MMM dd yyyy HH:mm:ss',
    timeZone: 'Europe/London',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/sign/profile');
      setProfile(response.data);
      setFormData({
        ...formData,
        company: response.data.company || '',
        jobTitle: response.data.jobTitle || '',
        dateFormat: response.data.dateFormat,
        timeZone: response.data.timeZone,
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      await axios.patch('/api/sign/profile', formData);
      setIsEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="w-96 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 min-h-screen bg-gray-50">
          <div className="p-4">
            <div className="space-y-1">
              <button
                onClick={() => setActiveTab('my_profile')}
                className={`w-full text-left px-4 py-2 rounded text-sm ${
                  activeTab === 'my_profile'
                    ? 'bg-gray-200 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                My profile
              </button>
              <button
                onClick={() => setActiveTab('delegate')}
                className={`w-full text-left px-4 py-2 rounded text-sm ${
                  activeTab === 'delegate'
                    ? 'bg-gray-200 text-gray-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Delegate
              </button>
            </div>
          </div>

          {/* Settings Section */}
          <div className="border-t border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-900 mb-2">General</div>
            <div className="space-y-1">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">
                My profile
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">
                Integrations
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">
                My notifications
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">
                Contacts
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">
                Trash
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 p-4">
            <div className="text-sm font-medium text-gray-900 mb-2">Admin</div>
            <div className="space-y-1">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">
                Users and control
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">
                Account settings
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">
                Subscription details
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">
                Branding
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded">
                Developer settings
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === 'my_profile' ? (
            <div className="max-w-3xl">
              {/* Profile Header */}
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center">
                  <span className="text-3xl text-white font-bold">B</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Bill</h2>
                  <p className="text-gray-600">bill.essien@bwcconsult.com</p>
                </div>
              </div>

              {/* Signature and Initial */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Signature and initial</h3>
                  <button className="text-blue-600 hover:underline flex items-center gap-1">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <p className="text-sm text-gray-500">No signature configured</p>
                </div>
              </div>

              {/* Stamp */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Stamp</h3>
                  <button className="text-blue-600 hover:underline flex items-center gap-1">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                </div>
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <p className="text-sm text-gray-500">No stamp configured</p>
                </div>
              </div>

              {/* Profile Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      disabled={!isEditing}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job title
                  </label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date format
                  </label>
                  <select
                    value={formData.dateFormat}
                    onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="MMM dd yyyy HH:mm:ss">MMM dd yyyy HH:mm:z</option>
                    <option value="dd/MM/yyyy HH:mm:ss">dd/MM/yyyy HH:mm:ss</option>
                    <option value="MM/dd/yyyy HH:mm:ss">MM/dd/yyyy HH:mm:ss</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time zone
                  </label>
                  <input
                    type="text"
                    value={formData.timeZone}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                {isEditing ? (
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdateProfile}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Delegate</h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-gray-900 mb-4">
                  Delegate signing is currently disabled.
                </p>
                <p className="text-gray-700 mb-4">
                  To use this feature, please enable it in your account settings.{' '}
                  <a href="#" className="text-blue-600 hover:underline">Configure now.</a>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
