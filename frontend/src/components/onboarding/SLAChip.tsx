import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow, isPast, differenceInHours } from 'date-fns';

interface SLAChipProps {
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'BLOCKED' | 'DONE';
  slaHours?: number;
}

export function SLAChip({ dueDate, status, slaHours }: SLAChipProps) {
  const due = new Date(dueDate);
  const now = new Date();
  const isOverdue = isPast(due) && status !== 'DONE';
  const hoursUntilDue = differenceInHours(due, now);

  // Determine urgency
  let urgency: 'normal' | 'warning' | 'critical' | 'done' = 'normal';
  
  if (status === 'DONE') {
    urgency = 'done';
  } else if (isOverdue) {
    urgency = 'critical';
  } else if (hoursUntilDue <= 24) {
    urgency = 'critical';
  } else if (hoursUntilDue <= 72) {
    urgency = 'warning';
  }

  const styles = {
    normal: 'bg-blue-50 text-blue-700 border-blue-200',
    warning: 'bg-yellow-50 text-yellow-700 border-yellow-300',
    critical: 'bg-red-50 text-red-700 border-red-300 animate-pulse',
    done: 'bg-green-50 text-green-700 border-green-200',
  };

  const Icon = urgency === 'critical' || urgency === 'warning' ? AlertCircle : Clock;

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium ${styles[urgency]}`}
      title={slaHours ? `SLA: ${slaHours} hours` : undefined}
    >
      <Icon className="h-3 w-3" />
      {isOverdue ? (
        <span>Overdue {formatDistanceToNow(due)}</span>
      ) : status === 'DONE' ? (
        <span>Completed</span>
      ) : (
        <span>Due {formatDistanceToNow(due, { addSuffix: true })}</span>
      )}
    </div>
  );
}
