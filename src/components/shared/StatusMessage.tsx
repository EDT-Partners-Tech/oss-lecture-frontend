// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React from 'react';

interface StatusMessageProps {
  type: 'success' | 'error';
  message: string;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ type, message }) => {
  const baseClasses = 'p-4 rounded-lg text-sm';
  const typeClasses = type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800';

  return <div className={`${baseClasses} ${typeClasses}`}>{message}</div>;
};

export default StatusMessage;
