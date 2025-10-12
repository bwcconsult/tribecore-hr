import { useState } from 'react';
import { Activity, AlertTriangle, TrendingDown, FileText, Calendar } from 'lucide-react';

export default function SicknessDashboard() {
  const stats = {
    totalEpisodes: 3,
    totalDays: 8,
    averageDuration: 2.7,
    lastEpisode: '2025-09-15',
  };

  const episodes = [
    { id: '1', startDate: '2025-09-15', endDate: '2025-09-17', days: 3, type: 'Flu', certified: true },
    { id: '2', startDate: '2025-07-22', endDate: '2025-07-24', days: 3, type: 'Migraine', certified: false },
    { id: '3', startDate: '2025-05-10', endDate: '2025-05-11', days: 2, type: 'Cold', certified: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sickness & Lateness</h1>
        <p className="text-gray-600 mt-1">Track health-related absences and manage sick leave</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Episodes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalEpisodes}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Days</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.totalDays}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Duration</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{stats.averageDuration}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Last Episode</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{new Date(stats.lastEpisode).toLocaleDateString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Bradford Factor */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Bradford Factor Score</h3>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Low Risk</span>
        </div>
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Current Score: 27</span>
            <span className="text-gray-600">Threshold: 200</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-green-500 h-3 rounded-full" style={{ width: '13.5%' }} />
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Bradford Factor = E² × D (E = Episodes, D = Days)<br />
          Your score: 3² × 8 = 27
        </p>
      </div>

      {/* Sickness Episodes */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Sickness History</h3>
        <div className="space-y-3">
          {episodes.map((episode) => (
            <div key={episode.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-medium text-gray-900">{episode.type}</p>
                    {episode.certified && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Certified</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {new Date(episode.startDate).toLocaleDateString()} - {new Date(episode.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{episode.days}</p>
                  <p className="text-xs text-gray-600">days</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
