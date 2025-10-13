import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Edit } from 'lucide-react';

export default function SignHomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search"
              className="w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              <span className="font-medium">TribeCore</span>
            </div>
            <div className="text-sm">
              <span className="text-orange-600">Enterprise Trial</span>
              <br />
              <span className="text-xs text-gray-500">MODIFY | UPGRADE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-8">
        <div className="flex gap-6 max-w-2xl">
          {/* Send for signatures */}
          <button
            onClick={() => navigate('/sign/send-for-signatures')}
            className="flex-1 bg-white border-2 border-gray-300 rounded-lg p-12 hover:border-blue-500 hover:shadow-lg transition-all group"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-teal-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Send className="w-8 h-8 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">
                Send for signatures
              </span>
            </div>
          </button>

          {/* Sign yourself */}
          <button
            onClick={() => navigate('/sign/sign-yourself')}
            className="flex-1 bg-white border-2 border-gray-300 rounded-lg p-12 hover:border-blue-500 hover:shadow-lg transition-all group"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-teal-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Edit className="w-8 h-8 text-white" />
              </div>
              <span className="text-lg font-semibold text-gray-900">
                Sign yourself
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
