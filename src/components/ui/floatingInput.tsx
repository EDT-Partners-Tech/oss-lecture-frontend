// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

interface FloatingInputProps {
  id: string;
  label: string;
  type: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  background?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
  id,
  label,
  type = 'text',
  value,
  required,
  className = '',
  onChange,
  background = 'background',
  disabled = false,
}) => {
  const [inputType, setInputType] = useState(type);

  const togglePasswordVisibility = () => {
    setInputType(prevType => (prevType === 'password' ? 'text' : 'password'));
  };

  return (
    <div className="relative">
      <input
        type={type === 'password' ? inputType : type}
        id={id}
        className={`block px-3 pb-2.5 pt-4 w-full text-base text-gray-900 rounded-lg border-2 border-gray-300 appearance-none dark:text-background dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer ${className}
        ${disabled ? 'opacity-70 bg-gray-100 cursor-not-allowed' : 'bg-transparent'}`}
        placeholder=""
        value={value}
        required={required}
        onChange={onChange}
        disabled={disabled}
      />
      <label
        htmlFor={id}
        className={`bg-${background} absolute text-base text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] dark:bg-gray-900 px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto start-1`}
      >
        {label}
      </label>
      {type === 'password' && (
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
        >
          {inputType === 'password' ? <FaEyeSlash /> : <FaEye />}
        </button>
      )}
    </div>
  );
};

export default FloatingInput;
