import React, { useState, useCallback } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { expenseService } from '../../services/expense.service';

interface OcrResult {
  vendor?: string;
  amount?: number;
  currency?: string;
  date?: string;
  taxAmount?: number;
  confidence: number;
}

interface Receipt {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  ocrData?: OcrResult;
  ocrConfidence?: number;
}

interface ReceiptUploaderProps {
  expenseItemId?: string;
  onUploadComplete?: (receipt: Receipt, ocrData?: OcrResult) => void;
  maxSize?: number; // in MB
  allowedTypes?: string[];
}

export const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({
  expenseItemId,
  onUploadComplete,
  maxSize = 5,
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/tiff', 'application/pdf'],
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedReceipt, setUploadedReceipt] = useState<Receipt | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
    }

    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxSize}MB limit`;
    }

    return null;
  };

  const handleFileUpload = async (file: File) => {
    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setIsUploading(false);
      return;
    }

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload file
      const formData = new FormData();
      formData.append('file', file);
      if (expenseItemId) {
        formData.append('expenseItemId', expenseItemId);
      }
      formData.append('processOcr', 'true');

      const response = await expenseService.uploadReceipt(expenseItemId || '', file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Extract data from response
      const receipt: Receipt = {
        id: response.receipt.id,
        fileName: response.receipt.fileName,
        fileUrl: response.receipt.fileUrl,
        fileSize: response.receipt.fileSize,
        ocrData: response.ocrResult,
        ocrConfidence: response.ocrResult?.confidence,
      };

      setUploadedReceipt(receipt);
      setOcrResult(response.ocrResult);

      // Call callback
      if (onUploadComplete) {
        onUploadComplete(receipt, response.ocrResult);
      }

      // Success message
      setTimeout(() => {
        setIsUploading(false);
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Failed to upload receipt');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleRemove = () => {
    setUploadedReceipt(null);
    setOcrResult(null);
    setUploadProgress(0);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatCurrency = (amount: number, currency: string = 'GBP'): string => {
    const symbols: { [key: string]: string } = {
      GBP: '£',
      USD: '$',
      EUR: '€',
    };
    return `${symbols[currency] || currency} ${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {!uploadedReceipt && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {isUploading ? (
            <div className="space-y-4">
              <Loader className="w-12 h-12 mx-auto text-blue-500 animate-spin" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Uploading and processing receipt...
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {uploadProgress < 90 ? 'Uploading file...' : 'Running OCR analysis...'}
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 max-w-xs mx-auto">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">{uploadProgress}%</p>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Upload Receipt
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Drag and drop your receipt here, or click to browse
              </p>
              <input
                type="file"
                id="receipt-upload"
                className="hidden"
                accept={allowedTypes.join(',')}
                onChange={handleFileInput}
              />
              <label
                htmlFor="receipt-upload"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors"
              >
                Choose File
              </label>
              <p className="text-xs text-gray-400 mt-4">
                Supported formats: JPG, PNG, TIFF, PDF (max {maxSize}MB)
              </p>
            </>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-red-800">Upload Failed</h4>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Uploaded Receipt Preview */}
      {uploadedReceipt && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Receipt Info */}
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {uploadedReceipt.fileName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(uploadedReceipt.fileSize)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemove}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Remove receipt"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* OCR Results */}
          {ocrResult && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-700">
                  Extracted Information
                </h4>
                <div className="flex items-center space-x-2">
                  {ocrResult.confidence >= 80 ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : ocrResult.confidence >= 50 ? (
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-xs text-gray-500">
                    {ocrResult.confidence}% confidence
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {ocrResult.vendor && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">
                      Vendor
                    </label>
                    <p className="text-sm text-gray-900 mt-1">{ocrResult.vendor}</p>
                  </div>
                )}

                {ocrResult.amount !== undefined && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </label>
                    <p className="text-sm text-gray-900 mt-1 font-semibold">
                      {formatCurrency(ocrResult.amount, ocrResult.currency)}
                    </p>
                  </div>
                )}

                {ocrResult.date && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">
                      Date
                    </label>
                    <p className="text-sm text-gray-900 mt-1">{ocrResult.date}</p>
                  </div>
                )}

                {ocrResult.taxAmount !== undefined && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase">
                      Tax
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {formatCurrency(ocrResult.taxAmount, ocrResult.currency)}
                    </p>
                  </div>
                )}
              </div>

              {ocrResult.confidence < 80 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-xs text-yellow-800">
                    <strong>Note:</strong> Low confidence score. Please verify the extracted
                    information manually.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Image Preview */}
          {uploadedReceipt.fileUrl && (
            <div className="p-4 border-t border-gray-200">
              <a
                href={uploadedReceipt.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View Full Receipt →
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReceiptUploader;
