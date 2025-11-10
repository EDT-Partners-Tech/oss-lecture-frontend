import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputFieldProps {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  classes?: string;
}

const Input: React.FC<InputFieldProps> = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  type = 'text',
  min,
  max,
  step,
  classes = '',
}) => {
  return (
    <input
      type={type}
      className={cn('w-full px-3 py-2 border rounded', classes)}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      min={type === 'number' ? min : undefined}
      max={type === 'number' ? max : undefined}
      step={type === 'number' ? step : undefined}
    />
  );
};

Input.displayName = 'Input';

export { Input };
