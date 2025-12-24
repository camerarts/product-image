
import React from 'react';
import { ParsedPrompt } from '../types';
import { Loader2, Sparkles, Image as ImageIcon, Copy } from 'lucide-react';

interface PromptCardProps {
  prompt: ParsedPrompt;
  onGenerateImage: (id: number) => void;
}

const PromptCard: React.FC<PromptCardProps> = ({ prompt, onGenerateImage }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.chinesePrompt + "\n\n" + prompt.englishPrompt);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[320px]">
      {/* Left: Text Content */}
      <div className="flex-1 p-6 flex flex-col border-b md:border-b-0 md:border-r border-gray-100 relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-gray-800 line-clamp-1" title={prompt.title}>
            {prompt.title.replace(/^###\s*/, '')}
          </h3>
          <button 
            onClick={handleCopy}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="复制提示词"
          >
            <Copy size={16} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
           <div>
             <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-1 block">Chinese Prompt</span>
             <p className="text-sm text-gray-600 leading-relaxed font-medium">
               {prompt.chinesePrompt || "无法提取中文提示词，请参考下方完整内容。"}
             </p>
           </div>
           
           <div>
             <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider mb-1 block">English Prompt</span>
             <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 font-mono leading-relaxed">
               {prompt.englishPrompt || "Unable to extract English prompt."}
             </p>
           </div>

           {/* Fallback to show raw content if parsing seems empty but content exists */}
           {(!prompt.chinesePrompt && !prompt.englishPrompt) && (
             <div className="text-xs text-gray-400 whitespace-pre-wrap">
               {prompt.fullContent}
             </div>
           )}
        </div>
        
        {/* Action Button for Text - Could add 'Edit' here later */}
      </div>

      {/* Right: Image Preview & Action */}
      <div className="w-full md:w-[320px] bg-gray-50 flex flex-col flex-shrink-0">
        <div className="flex-1 relative flex items-center justify-center p-4 min-h-[250px]">
           {prompt.generatedImage ? (
             <img 
               src={`data:image/jpeg;base64,${prompt.generatedImage}`} 
               alt="Generated Result" 
               className="max-w-full max-h-full object-contain rounded-lg shadow-md"
             />
           ) : (
             <div className="text-center text-gray-300">
               {prompt.isGenerating ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-indigo-400" size={32} />
                    <span className="text-xs font-medium text-indigo-400 animate-pulse">正在绘制中...</span>
                  </div>
               ) : (
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon size={48} className="opacity-20" />
                    <span className="text-xs">暂无预览图</span>
                  </div>
               )}
             </div>
           )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-white">
          <button
            onClick={() => onGenerateImage(prompt.id)}
            disabled={prompt.isGenerating || !prompt.englishPrompt}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
             {prompt.isGenerating ? (
               <>
                 <Loader2 className="animate-spin" size={16} />
                 <span>生成中...</span>
               </>
             ) : (
               <>
                 <Sparkles size={16} />
                 <span>立刻生图</span>
               </>
             )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptCard;
