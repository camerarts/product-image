import React from 'react';
import { Check } from 'lucide-react';

interface OptionCardProps {
  selected: boolean;
  onClick: () => void;
  icon: string;
  title: string;
  description?: string;
  compact?: boolean;
}

const OptionCard: React.FC<OptionCardProps> = ({ selected, onClick, icon, title, description, compact }) => {
  return (
    <div
      onClick={onClick}
      className={`
        cursor-pointer rounded-lg border-2 transition-all duration-200 relative
        ${selected ? 'border-indigo-600 bg-indigo-50 shadow-sm' : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm'}
        ${compact ? 'p-3 flex items-center justify-center text-center' : 'p-4'}
      `}
    >
      {selected && (
        <div className="absolute top-1 right-1 bg-indigo-600 rounded-full p-0.5">
          <Check size={12} className="text-white" />
        </div>
      )}
      
      <div className={`${compact ? 'flex flex-row items-center gap-2' : 'flex flex-col gap-2'}`}>
        <span className="text-xl">{icon}</span>
        <div className="text-left">
           <h3 className={`font-bold text-gray-900 ${compact ? 'text-xs' : 'text-sm'}`}>{title}</h3>
           {!compact && description && (
             <p className="text-xs text-gray-500 mt-1 leading-tight">{description}</p>
           )}
        </div>
      </div>
    </div>
  );
};

export default OptionCard;