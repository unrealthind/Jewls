
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: React.FC<InputProps> = ({ label, ...props }) => {
  return (
    <div className="flex flex-col">
      <label htmlFor={props.id || props.name} className="mb-2 text-sm font-medium text-gray-300">
        {label}
      </label>
      <input
        {...props}
        className="bg-gray-700 border border-gray-600 text-white text-md rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-3 transition duration-300 ease-in-out placeholder-gray-500"
      />
    </div>
  );
};

export default Input;
