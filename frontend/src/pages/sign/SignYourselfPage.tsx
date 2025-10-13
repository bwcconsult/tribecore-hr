import React, { useState } from 'react';
import { Upload, HardDrive, Cloud, FileText, X } from 'lucide-react';

export default function SignYourselfPage() {
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileUploaded(true);
      setShowUploadMenu(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Sign yourself</h1>

        {/* Add Documents Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add documents</h2>

          {!fileUploaded ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-16">
              <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Upload className="w-10 h-10 text-gray-400" />
                </div>

                <p className="text-xl text-gray-600">Drag files here</p>

                <span className="text-gray-500">or</span>

                <div className="relative">
                  <button
                    onClick={() => setShowUploadMenu(!showUploadMenu)}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
                  >
                    Add document
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showUploadMenu && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10">
                      <div className="px-4 py-2 text-sm text-gray-500 font-medium">From</div>
                      
                      <label className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer">
                        <HardDrive className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">Desktop</span>
                        <input
                          type="file"
                          onChange={handleFileUpload}
                          className="hidden"
                          accept=".pdf,.doc,.docx"
                        />
                      </label>

                      <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left">
                        <Cloud className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">Cloud</span>
                      </button>

                      <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-700">Create</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Document uploaded</p>
                    <p className="text-sm text-gray-500">Ready to sign</p>
                  </div>
                </div>
                <button
                  onClick={() => setFileUploaded(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium">
            Continue
          </button>
          <button className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
