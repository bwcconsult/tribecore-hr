import React, { useState } from 'react';
import { Upload, X, Plus, Settings as SettingsIcon, ChevronDown } from 'lucide-react';
import axios from 'axios';

interface Recipient {
  id: string;
  email: string;
  name: string;
  role: string;
  deliveryMethod: string;
  order: number;
}

export default function SendForSignaturesPage() {
  const [documentName, setDocumentName] = useState('');
  const [recipients, setRecipients] = useState<Recipient[]>([
    {
      id: '1',
      email: '',
      name: '',
      role: 'needs_to_sign',
      deliveryMethod: 'email',
      order: 1,
    },
  ]);
  const [sendInOrder, setSendInOrder] = useState(false);
  const [noteToRecipients, setNoteToRecipients] = useState('');
  const [showMoreSettings, setShowMoreSettings] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);

  const handleAddRecipient = () => {
    const newRecipient: Recipient = {
      id: Date.now().toString(),
      email: '',
      name: '',
      role: 'needs_to_sign',
      deliveryMethod: 'email',
      order: recipients.length + 1,
    };
    setRecipients([...recipients, newRecipient]);
  };

  const handleRemoveRecipient = (id: string) => {
    setRecipients(recipients.filter((r) => r.id !== id));
  };

  const handleRecipientChange = (id: string, field: keyof Recipient, value: string) => {
    setRecipients(
      recipients.map((r) =>
        r.id === id ? { ...r, [field]: value } : r
      )
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileUploaded(true);
      // Handle file upload logic here
    }
  };

  const handleContinue = async () => {
    try {
      const documentData = {
        name: documentName,
        fileName: 'document.pdf',
        fileUrl: '/path/to/document.pdf',
        type: 'send_for_signatures',
        sendInOrder,
        noteToRecipients,
        recipients: recipients.map((r) => ({
          email: r.email,
          name: r.name,
          role: r.role,
          deliveryMethod: r.deliveryMethod,
          order: r.order,
        })),
      };

      await axios.post('/api/sign/documents', documentData);
      // Navigate to documents list or show success message
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Send for signatures</h1>

        {/* Add Document Button */}
        <div className="mb-6">
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2">
            Add document
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/* Add Documents Section */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Add documents</h2>
          
          {!fileUploaded ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <Upload className="w-16 h-16 text-gray-400" />
                <p className="text-gray-600">Drag files here</p>
                <span className="text-gray-500">or</span>
                <label className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer">
                  Add document
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Document uploaded</span>
                <button
                  onClick={() => setFileUploaded(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Document Name */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document name
          </label>
          <input
            type="text"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            placeholder="Enter name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Add Recipients */}
        <div className="mb-8">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Add recipients</h2>
          
          <div className="flex items-center gap-4 mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={sendInOrder}
                onChange={(e) => setSendInOrder(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Send in order</span>
            </label>
            <button className="text-sm text-blue-600 hover:underline">
              Add me
            </button>
            <button className="text-sm text-blue-600 hover:underline">
              Add bulk recipients
            </button>
          </div>

          {/* Recipients List */}
          <div className="space-y-4">
            {recipients.map((recipient, index) => (
              <div key={recipient.id} className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">=</span>
                    <span className="font-medium">{index + 1}</span>
                  </div>

                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <input
                      type="email"
                      value={recipient.email}
                      onChange={(e) =>
                        handleRecipientChange(recipient.id, 'email', e.target.value)
                      }
                      placeholder="Email"
                      className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={recipient.name}
                      onChange={(e) =>
                        handleRecipientChange(recipient.id, 'name', e.target.value)
                      }
                      placeholder="Name"
                      className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex gap-2">
                      <select
                        value={recipient.role}
                        onChange={(e) =>
                          handleRecipientChange(recipient.id, 'role', e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="needs_to_sign">Needs to sign</option>
                        <option value="in_person_signer">In-person signer</option>
                        <option value="signs_with_witness">Signs with witness</option>
                        <option value="manages_recipients">Manages recipients</option>
                        <option value="approver">Approver</option>
                        <option value="receives_copy">Receives a copy</option>
                      </select>
                      <select
                        value={recipient.deliveryMethod}
                        onChange={(e) =>
                          handleRecipientChange(recipient.id, 'deliveryMethod', e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="email">Email</option>
                        <option value="email_sms">Email + SMS</option>
                        <option value="link">Deliver link via</option>
                      </select>
                      <button
                        className="px-3 py-2 border border-gray-300 rounded hover:bg-gray-50"
                      >
                        <SettingsIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {recipients.length > 1 && (
                    <button
                      onClick={() => handleRemoveRecipient(recipient.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleAddRecipient}
            className="mt-4 text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add recipient
          </button>
        </div>

        {/* More Settings */}
        <div className="mb-8">
          <button
            onClick={() => setShowMoreSettings(!showMoreSettings)}
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            More settings
            <ChevronDown className={`w-4 h-4 transition-transform ${showMoreSettings ? 'rotate-180' : ''}`} />
          </button>

          {showMoreSettings && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note to all recipients
                </label>
                <textarea
                  value={noteToRecipients}
                  onChange={(e) => setNoteToRecipients(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a message for recipients..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleContinue}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Continue
          </button>
          <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
            Close
          </button>
        </div>

        {/* Help */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help?<br />
            Get your questions answered by Zia
          </p>
        </div>
      </div>
    </div>
  );
}
