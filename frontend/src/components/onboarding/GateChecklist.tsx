import React from 'react';
import { CheckCircle, XCircle, Circle } from 'lucide-react';

interface GateChecklistProps {
  gates: {
    securityApproved?: boolean;
    legalApproved?: boolean;
    billingApproved?: boolean;
    uatApproved?: boolean;
    runbookApproved?: boolean;
  };
  onToggle?: (gateName: string, value: boolean) => void;
  readOnly?: boolean;
}

export function GateChecklist({ gates, onToggle, readOnly = false }: GateChecklistProps) {
  const gateList = [
    { key: 'securityApproved', label: 'Security Approval', description: 'Security review and pen test complete' },
    { key: 'legalApproved', label: 'Legal Approval', description: 'DPA, MSA, and contracts signed' },
    { key: 'billingApproved', label: 'Billing Setup', description: 'Payment and invoicing configured' },
    { key: 'uatApproved', label: 'UAT Signoff', description: 'User acceptance testing complete' },
    { key: 'runbookApproved', label: 'Runbook Approval', description: 'Operations runbook reviewed' },
  ];

  const completedCount = gateList.filter((gate) => gates[gate.key as keyof typeof gates]).length;
  const totalCount = gateList.length;
  const allComplete = completedCount === totalCount;

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Go-Live Gate</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {completedCount}/{totalCount} Complete
          </span>
          {allComplete && (
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
              Ready for Go-Live
            </span>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {gateList.map((gate) => {
          const isApproved = gates[gate.key as keyof typeof gates];

          return (
            <div
              key={gate.key}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                isApproved ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              {readOnly ? (
                isApproved ? (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                )
              ) : (
                <button
                  onClick={() => onToggle?.(gate.key, !isApproved)}
                  className="flex-shrink-0 mt-0.5"
                >
                  {isApproved ? (
                    <CheckCircle className="h-5 w-5 text-green-600 hover:text-green-700" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              )}

              <div className="flex-1">
                <div className="font-medium text-gray-900">{gate.label}</div>
                <div className="text-sm text-gray-600">{gate.description}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span>{Math.round((completedCount / totalCount) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              allComplete ? 'bg-green-600' : 'bg-blue-600'
            }`}
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
