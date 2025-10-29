
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}

const Select: React.FC<SelectProps> = ({ label, options, ...props }) => {
  return (
    <div className="flex flex-col">
      <label htmlFor={props.id || props.name} className="mb-2 text-sm font-medium text-gray-300">
        {label}
      </label>
      <select
        {...props}
        className="bg-gray-700 border border-gray-600 text-white text-md rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block w-full p-3 transition duration-300 ease-in-out"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
