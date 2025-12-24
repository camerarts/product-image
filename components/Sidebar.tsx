import React from 'react';
import { AppStep } from '../types';

interface SidebarProps {
  currentStep: AppStep;
  children: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ currentStep, children }) => {
  return (
    <div className="w-full lg:w-[450px] flex-shrink-0 bg-white border-r border-gray-200 h-screen overflow-y-auto flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 tracking-tight">
          电商详情图视觉全案系统
        </h1>
        <div className="flex items-center mt-2 text-xs font-bold text-gray-500">
          <span className="w-1.5 h-4 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full mr-2"></span>
          核心配置
        </div>
      </div>

      <div className="flex-1 p-6 space-y-8">
        <div className="space-y-6">
             {children}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;