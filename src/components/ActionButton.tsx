// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React from 'react';

interface ActionButtonProps {
  onClick: () => void;
  label: string;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  label,
  disabled = false,
  className = '',
  type = 'button',
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 ${className}`}
    >
      {label}
    </button>
  );
};

export default ActionButton;
