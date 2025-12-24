import React from 'react';
import { AnalysisResult } from '../types';
import { Tag, Palette, Sparkles, FileText } from 'lucide-react';

interface Props {
  data: AnalysisResult | null;
}

const AnalysisReportView: React.FC<Props> = ({ data }) => {
  const isLoading = !data;

  // Helper to extract hex or return valid color string
  const getColor = (str: string) => {
    if (!str) return '#E5E7EB';
    const match = str.match(/#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/);
    if (match) return match[0];
    const cleanStr = str.trim();
    if (/^[a-zA-Z\s]+$/.test(cleanStr)) return cleanStr;
    return '#E5E7EB';
  };

  const getColorName = (str: string) => {
      if (!str) return 'Color';
      return str.replace(/\s*\(?#[A-Fa-f0-9]{6}\)?/, '')
                .replace(/\s*\(?#[A-Fa-f0-9]{3}\)?/, '')
                .replace(/[()]/g, '')
                .trim();
  }

  // Safe data access
  const brandNameMain = data?.brandName ? data.brandName.split(/[/\n]/)[0] : '';
  const brandNameSub = data?.brandName && data.brandName.split(/[/\n]/).length > 1 ? data.brandName.split(/[/\n]/)[1] : data?.brandName;
  const colors = data?.colors && data.colors.length > 0 ? data.colors.slice(0, 3) : ['#F3F4F6', '#F3F4F6', '#F3F4F6'];

  return (
    <div className="w-full animate-fade-in">
      {/* Title */}
      <div className="flex items-center gap-2 mb-4">
         <FileText className="text-gray-400" size={18} />
         <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">【产品报告】</h3>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Card 1: Brand Core */}
        <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col justify-between min-h-[240px]">
          <div>
            <div className="flex items-center gap-2 text-indigo-500 mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Tag size={16} />
              </div>
              <span className="font-semibold text-xs tracking-wide text-gray-500">品牌核心</span>
            </div>
            
            {isLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-8 bg-gray-100 rounded w-3/4"></div>
                <div className="h-5 bg-gray-50 rounded w-1/2"></div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-black text-gray-900 mb-1 tracking-tight truncate" title={brandNameMain}>{brandNameMain}</h1>
                <p className="text-base font-serif italic text-gray-400 mb-6 truncate" title={brandNameSub}>{brandNameSub}</p>
              </>
            )}
          </div>

          <div className="border-t border-gray-50 pt-4 grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-[10px] font-bold text-gray-400 mb-1 uppercase">品类定位</h4>
              {isLoading ? (
                <div className="h-4 bg-gray-100 rounded w-full mt-1 animate-pulse"></div>
              ) : (
                <p className="text-xs font-bold text-gray-800 leading-relaxed line-clamp-2">{data.productType}</p>
              )}
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-gray-400 mb-1 uppercase">驱动人群</h4>
              {isLoading ? (
                <div className="h-4 bg-gray-100 rounded w-full mt-1 animate-pulse"></div>
              ) : (
                <p className="text-xs font-bold text-gray-800 leading-relaxed line-clamp-2">{data.targetAudience}</p>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Color DNA */}
        <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col min-h-[240px]">
          <div className="flex items-center gap-2 text-purple-500 mb-6">
             <div className="p-2 bg-purple-50 rounded-lg">
                <Palette size={16} />
             </div>
             <span className="font-semibold text-xs tracking-wide text-gray-500">色彩基因</span>
          </div>

          <div className="flex-1 flex items-center justify-center gap-4">
            {colors.map((colorStr, idx) => (
              <div key={idx} className="flex flex-col items-center group">
                <div 
                  className={`w-14 h-14 rounded-full shadow-md mb-3 border-4 border-white ring-1 ring-gray-100 transition-transform ${isLoading ? 'bg-gray-100 animate-pulse' : 'group-hover:scale-110'}`}
                  style={{ backgroundColor: isLoading ? '#f3f4f6' : getColor(colorStr) }}
                />
                {isLoading ? (
                   <div className="h-3 w-10 bg-gray-100 rounded animate-pulse"></div>
                ) : (
                   <>
                    <span className="text-[10px] font-bold text-gray-800 text-center max-w-[70px] truncate" title={getColorName(colorStr)}>
                      {getColorName(colorStr)}
                    </span>
                    <span className="text-[9px] text-gray-400 uppercase mt-0.5">
                      {getColor(colorStr) !== '#E5E7EB' && getColor(colorStr).startsWith('#') ? getColor(colorStr) : ''}
                    </span>
                   </>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[9px] text-gray-400 mt-2 px-2">
             <span>主本色</span>
             <span>辅助色</span>
             <span>点缀色</span>
          </div>
        </div>

        {/* Card 3: Style Direction */}
        <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col min-h-[240px]">
           <div className="flex items-center gap-2 text-orange-500 mb-4">
             <div className="p-2 bg-orange-50 rounded-lg">
                <Sparkles size={16} />
             </div>
             <span className="font-semibold text-xs tracking-wide text-gray-500">风格导向</span>
          </div>

          <div className="flex-1">
            {isLoading ? (
               <div className="space-y-3 animate-pulse">
                  <div className="h-6 bg-gray-100 rounded w-1/2 mb-2"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-50 rounded w-full"></div>
                    <div className="h-3 bg-gray-50 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-50 rounded w-4/6"></div>
                  </div>
               </div>
            ) : (
              <>
                <h2 className="text-lg font-bold text-gray-900 mb-2 leading-snug line-clamp-2">{data.designStyle}</h2>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed line-clamp-4">
                  {data.sellingPoints?.[0] || data.specs || '基于产品特征的智能风格推荐'}
                </p>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-auto">
            {isLoading ? (
               [1, 2, 3].map(i => <div key={i} className="h-6 w-16 bg-gray-50 rounded-full animate-pulse"></div>)
            ) : (
              data?.sellingPoints?.slice(0, 3).map((tag, i) => (
                <span key={i} className="px-2 py-1 bg-gray-50 text-gray-600 text-[10px] font-semibold rounded-full border border-gray-100">
                   {tag.length > 8 ? tag.substring(0,8) + '...' : tag}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisReportView;