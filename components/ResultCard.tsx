
import React from 'react';

interface ResultCardProps {
  label: string;
  value: string;
  description: string;
}

const ResultCard: React.FC<ResultCardProps> = ({ label, value, description }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col items-center justify-center">
      <span className="text-sm text-gray-400 mb-1">{label}</span>
      <span className="text-2xl font-bold text-yellow-300">{value}</span>
      <p className="text-xs text-gray-500 mt-2">{description}</p>
    </div>
  );
};

export default ResultCard;
