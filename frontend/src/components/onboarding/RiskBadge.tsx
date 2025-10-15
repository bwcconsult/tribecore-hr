import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface RiskBadgeProps {
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'Low' | 'Medium' | 'High' | 'Critical';
  className?: string;
}

export function RiskBadge({ level, className = '' }: RiskBadgeProps) {
  const normalizedLevel = level.toUpperCase();

  const styles = {
    LOW: 'bg-green-100 text-green-800 border-green-300',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
    CRITICAL: 'bg-red-100 text-red-800 border-red-300',
  };

  const style = styles[normalizedLevel as keyof typeof styles] || styles.LOW;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium ${style} ${className}`}
    >
      {(normalizedLevel === 'HIGH' || normalizedLevel === 'CRITICAL') && (
        <AlertTriangle className="h-3 w-3" />
      )}
      {level}
    </span>
  );
}
