import { useState } from 'react';
import { User, Briefcase, Calendar, Clock, MapPin, Phone, Mail, Edit, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  preferredPronouns?: string;
  employeeId: string;
  jobTitle: string;
  department: string;
  location: string;
  email: string;
  phoneNumber?: string;
  avatarUrl?: string;
  bio?: string;
  hireDate: string;
  managerId?: string;
  manager?: {
    firstName: string;
    lastName: string;
  };
}

interface AbsenceBalance {
  planType: string;
  entitlementDays: number;
  takenDays: number;
  remainingDays: number;
  episodes?: number;
}

export default function PersonalSummaryPage() {
  const [isEditingBio, setIsEditingBio] = useState(false);

  // Mock data - replace with API
  const employee: Employee = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    employeeId: 'EMP001',
    jobTitle: 'Senior Software Engineer',
    department: 'Engineering',
    location: 'London, UK',
    email: 'john.doe@company.com',
    phoneNumber: '+44 20 1234 5678',
    bio: 'Passionate software engineer with 8+ years of experience in building scalable web applications. Expertise in React, TypeScript, and Node.js.',
    hireDate: '2020-03-15',
  };

  const absenceBalances: AbsenceBalance[] = [
    { planType: 'Holiday', entitlementDays: 25, takenDays: 10, remainingDays: 15 },
    { planType: 'Birthday', entitlementDays: 1, takenDays: 0, remainingDays: 1 },
    { planType: 'Level Up Days', entitlementDays: 3, takenDays: 1, remainingDays: 2, episodes: 1 },
    { planType: 'Sickness', entitlementDays: 0, takenDays: 2, remainingDays: 0, episodes: 1 },
  ];

  const employmentSummary = {
    lengthOfService: '4 years 7 months',
    continuousService: '4 years 7 months',
    hireDate: '2020-03-15',
    originalHireDate: '2020-03-15',
    currentDeployment: '4 years 7 months',
    fteRatio: 1.0,
  };

  const getAbsenceColor = (planType: string) => {
    const colors: Record<string, string> = {
      Holiday: 'bg-green-500',
      Birthday: 'bg-red-500',
      'Level Up Days': 'bg-teal-500',
      Sickness: 'bg-red-600',
    };
    return colors[planType] || 'bg-gray-500';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <User className="w-6 h-6" />
          Personal Summary
        </h1>
        <p className="text-gray-600">Your profile overview and quick stats</p>
      </div>

      {/* Profile Header Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {employee.avatarUrl ? (
              <img
                src={employee.avatarUrl}
                alt={`${employee.firstName} ${employee.lastName}`}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                {employee.firstName[0]}{employee.lastName[0]}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {employee.firstName} {employee.lastName}
                  {employee.preferredName && (
                    <span className="text-lg text-gray-600 ml-2">
                      ({employee.preferredName})
                    </span>
                  )}
                </h2>
                {employee.preferredPronouns && (
                  <p className="text-sm text-gray-500 mt-1">{employee.preferredPronouns}</p>
                )}
              </div>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Briefcase className="w-4 h-4" />
                <span className="font-medium">{employee.jobTitle}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>ID: {employee.employeeId}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{employee.department}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>{employee.location}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{employee.email}</span>
              </div>
              {employee.phoneNumber && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{employee.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">About Me</h3>
            <button
              onClick={() => setIsEditingBio(!isEditingBio)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              <Edit className="w-3 h-3" />
              {isEditingBio ? 'Cancel' : 'Edit Bio'}
            </button>
          </div>
          {isEditingBio ? (
            <div>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
                defaultValue={employee.bio}
              />
              <div className="flex gap-2 mt-2">
                <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                  Save
                </button>
                <button
                  onClick={() => setIsEditingBio(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">{employee.bio || 'No bio added yet.'}</p>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex gap-3">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
              <FileText className="w-4 h-4" />
              View Profile Summary
            </button>
            {employee.manager && (
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                <User className="w-4 h-4" />
                My Manager
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Absences Cards */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Absences Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {absenceBalances.map((balance) => (
            <div
              key={balance.planType}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-3 h-3 rounded-full ${getAbsenceColor(balance.planType)}`} />
                <h3 className="font-medium text-gray-900">{balance.planType}</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taken:</span>
                  <span className="font-medium text-gray-900">{balance.takenDays} days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Remaining:</span>
                  <span className="font-medium text-gray-900">{balance.remainingDays} days</span>
                </div>
                {balance.episodes !== undefined && (
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                    <span className="text-gray-600">Episodes:</span>
                    <span className="font-medium text-gray-900">{balance.episodes}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <a
            href="/leave"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
          >
            View all absence plans →
          </a>
        </div>
      </div>

      {/* Employment Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Employment Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Length of Service</p>
            <p className="text-lg font-semibold text-gray-900">
              {employmentSummary.lengthOfService}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Continuous Service</p>
            <p className="text-lg font-semibold text-gray-900">
              {employmentSummary.continuousService}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Hire Date</p>
            <p className="text-lg font-semibold text-gray-900">
              {format(new Date(employmentSummary.hireDate), 'dd MMM yyyy')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Current Deployment</p>
            <p className="text-lg font-semibold text-gray-900">
              {employmentSummary.currentDeployment}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">FTE Ratio</p>
            <p className="text-lg font-semibold text-gray-900">
              {employmentSummary.fteRatio}
            </p>
          </div>
        </div>

        {/* Working Time */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Working & Scheduled Time</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Start</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">End</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => (
                  <tr key={day}>
                    <td className="px-3 py-2 text-sm text-gray-900">{day}</td>
                    <td className="px-3 py-2 text-sm text-gray-900">7.5</td>
                    <td className="px-3 py-2 text-sm text-gray-600">09:00</td>
                    <td className="px-3 py-2 text-sm text-gray-600">17:30</td>
                  </tr>
                ))}
                {['Saturday', 'Sunday'].map((day) => (
                  <tr key={day} className="bg-gray-50">
                    <td className="px-3 py-2 text-sm text-gray-500">{day}</td>
                    <td className="px-3 py-2 text-sm text-gray-500">0</td>
                    <td className="px-3 py-2 text-sm text-gray-500">-</td>
                    <td className="px-3 py-2 text-sm text-gray-500">-</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
