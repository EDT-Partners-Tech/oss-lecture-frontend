/*
 * Copyright 2025 EDT&Partners
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
