// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React, { useState, forwardRef } from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = '', ...props }, ref) => {
    const [checked, setChecked] = useState(props.checked || false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setChecked(event.target.checked);
      if (props.onChange) {
        props.onChange(event);
      }
    };

    return (
      <label className={`flex items-center space-x-2 ${className}`}>
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={handleChange}
          className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
          {...props}
        />
        {label && <span className="text-sm text-gray-700">{label}</span>}
      </label>
    );
  }
);

export default Checkbox;
