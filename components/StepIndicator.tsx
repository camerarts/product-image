import React from 'react';

interface StepIndicatorProps {
  number: string;
  title: string;
  isActive?: boolean;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ number, title, isActive = true }) => {
  return (
    <div className={`flex items-center mb-5 ${isActive ? 'opacity-100' : 'opacity-60 grayscale'}`}>
      <div className="mr-3 text-xl font-black bg-clip-text text-transparent bg-gradient-to-br from-indigo-600 to-violet-600 border-l-4 border-indigo-500 pl-3 leading-none shadow-sm">
        {number}
      </div>
      <h2 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-700 tracking-tight">{title}</h2>
    </div>
  );
};

export default StepIndicator;