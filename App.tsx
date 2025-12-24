
import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import StepIndicator from './components/StepIndicator';
import AnalysisReportView from './components/AnalysisReportView';
import PromptCard from './components/PromptCard';
import { VISUAL_STYLES, TYPO_STYLES } from './constants';
import { AnalysisResult, AppStep, GenerationOptions, TypoStyle, VisualStyle, ParsedPrompt } from './types';
import { analyzeImage, analyzeText, generatePrompts, generateImageFromPrompt } from './services/geminiService';
import { Upload, Loader2, Wand2, ArrowRight, FileText, Image as ImageIcon, Key, CheckCircle2, X, ChevronDown, Lock, LogIn, LogOut, User, Settings } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [productDesc, setProductDesc] = useState('');
  const [brandName, setBrandName] = useState('');
  // Changed to array to store up to 2 images
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  // Set default Visual Style to "Minimalist Nordic" (id: minimalist)
  const [selectedStyle, setSelectedStyle] = useState<VisualStyle | null>(
    VISUAL_STYLES.find(s => s.id === 'minimalist') || null
  );
  // Set default Typo Style to "F" (id: minimal_line)
  const [selectedTypo, setSelectedTypo] = useState<TypoStyle | null>(
    TYPO_STYLES.find(s => s.id === 'minimal_line') || null
  );

  const [options, setOptions] = useState<GenerationOptions>({
    modelNeeded: false,
    modelDesc: '',
    sceneNeeded: false,
    sceneDesc: '',
    dataVizNeeded: false,
    otherReqs: '',
    aspectRatio: '9:16'
  });

  const [isGenerating, setIsGenerating] = useState(false);
  // Replaced simple string output with parsed prompts state
  const [parsedPrompts, setParsedPrompts] = useState<ParsedPrompt[]>([]);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Constants
  const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '3:4', '4:3', '2:3', '3:2'];
  const OTHER_REQ_PRESETS = ['必须包含产品实物', '需要对比图', '需要用户评价'];

  // Paste Event Listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          e.preventDefault();
          
          if (selectedImages.length >= 2) {
            alert("最多只能上传2张参考图");
            return;
          }

          const file = items[i].getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const result = event.target?.result as string;
              if (result) {
                // Determine if we need to append or create new (though setState does that)
                // We use functional update to get latest state inside listener if needed, 
                // but since selectedImages is a dependency, the effect re-runs on change.
                setSelectedImages(prev => {
                    if (prev.length >= 2) return prev;
                    return [...prev, result];
                });
              }
            };
            reader.readAsDataURL(file);
          }
          return; // Stop after finding one image to prevent spamming if multiple exist
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [selectedImages]); // Re-bind when selectedImages changes to check length correctly

  // Handlers
  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (passwordInput === '123') {
      setIsLoggedIn(true);
      setShowLoginModal(false);
      setPasswordInput('');
    } else {
      alert("密码错误");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (selectedImages.length >= 2) {
        alert("最多只能上传2张参考图");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSelectedImages(prev => [...prev, result]);
      };
      reader.readAsDataURL(file);
    }
    // Reset value to allow selecting the same file again if needed
    e.target.value = '';
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setSelectedImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleAnalyze = async () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    // Require at least 1 image
    if (selectedImages.length === 0) {
      alert("请至少上传1张参考图片");
      return;
    }

    setIsAnalyzing(true);
    try {
      let result;
      // Pass all images to the analysis service
      const base64Images = selectedImages.map(img => img.split(',')[1]);
      
      // Combine brand name into description for context
      const combinedDesc = brandName ? `品牌名称: ${brandName}. ${productDesc}` : productDesc;
      
      result = await analyzeImage(base64Images, combinedDesc);
      
      // Override brand name if user input exists
      if (brandName.trim()) {
        result.brandName = brandName;
      }
      
      setAnalysisResult(result);
    } catch (e) {
      console.error(e);
      alert('分析失败，请检查 API Key 或重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const parsePrompts = (text: string): ParsedPrompt[] => {
    // Simple regex parser based on the expected markdown structure "### Header"
    // and inner markers like "**提示词 (中文)**:"
    
    // Split by level 3 headers
    const sections = text.split(/(?=###\s+)/);
    const prompts: ParsedPrompt[] = [];

    sections.forEach((section, index) => {
      const titleMatch = section.match(/###\s+(.*)/);
      if (!titleMatch) return;

      const title = titleMatch[1].trim();
      if (!title.includes('海报') && !title.includes('LOGO')) return; // Filter out unrelated sections

      // Extract Chinese Prompt
      const zhMatch = section.match(/\*\*提示词\s*\(中文\)\*\*:\s*([\s\S]*?)(?=\*\*|$)/);
      const chinesePrompt = zhMatch ? zhMatch[1].trim() : '';

      // Extract English Prompt
      const enMatch = section.match(/\*\*Prompt\s*\(English\)\*\*:\s*([\s\S]*?)(?=\*\*|$)/);
      const englishPrompt = enMatch ? enMatch[1].trim() : '';

      prompts.push({
        id: index,
        title,
        fullContent: section,
        chinesePrompt,
        englishPrompt,
        generatedImage: null,
        isGenerating: false,
      });
    });

    return prompts;
  };

  const handleGenerate = async () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    if (!analysisResult || !selectedStyle || !selectedTypo) return;

    setIsGenerating(true);
    setParsedPrompts([]); // Clear previous
    try {
      const result = await generatePrompts(analysisResult, selectedStyle, selectedTypo, options);
      const prompts = parsePrompts(result);
      if (prompts.length === 0) {
        // Fallback if parsing fails or text is unstructured, create one "Raw" prompt
        setParsedPrompts([{
          id: 0,
          title: "Raw Output",
          fullContent: result,
          chinesePrompt: result,
          englishPrompt: "", // No clean separation
          generatedImage: null,
          isGenerating: false
        }]);
      } else {
        setParsedPrompts(prompts);
      }
    } catch (e) {
      console.error(e);
      alert('生成失败');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateImage = async (promptId: number) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    const prompt = parsedPrompts.find(p => p.id === promptId);
    if (!prompt || !prompt.englishPrompt || selectedImages.length === 0) {
      alert("无法生成图片：缺少英文提示词或参考图");
      return;
    }

    // Set generating state
    setParsedPrompts(prev => prev.map(p => p.id === promptId ? { ...p, isGenerating: true } : p));

    try {
      const base64Images = selectedImages.map(img => img.split(',')[1]);
      // Use the english prompt + styling info
      const fullPrompt = `${prompt.englishPrompt} -- Style: ${selectedStyle?.name}`;
      
      const imageBase64 = await generateImageFromPrompt(fullPrompt, base64Images, options.aspectRatio);
      
      setParsedPrompts(prev => prev.map(p => p.id === promptId ? { ...p, generatedImage: imageBase64 } : p));
    } catch (e) {
      console.error(e);
      alert("图片生成失败，请重试");
    } finally {
      setParsedPrompts(prev => prev.map(p => p.id === promptId ? { ...p, isGenerating: false } : p));
    }
  };

  // Helper to get initials or placeholder
  const getInitials = (name: string) => name ? name.substring(0, 2).toUpperCase() : 'NA';

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans text-slate-800">
      
      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm transform transition-all scale-100">
            <div className="flex flex-col items-center mb-6">
              <div className="bg-indigo-50 p-3 rounded-full mb-4">
                <Lock className="text-indigo-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">访问控制</h2>
              <p className="text-xs text-gray-500 mt-2 text-center">请输入访问密码以解锁 API 功能</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="请输入密码..."
                  className="w-full pl-4 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-sm transition-all text-center"
                  autoFocus
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98] transition-all text-sm"
              >
                解锁并连接
              </button>
            </form>
            
            <button 
              onClick={() => setShowLoginModal(false)}
              className="mt-6 text-xs text-gray-400 hover:text-gray-600 w-full text-center"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* --- Left Sidebar / Control Panel --- */}
      <Sidebar currentStep={AppStep.ANALYSIS}>
        
        {/* Section 1: Product Analysis */}
        <section>
          <StepIndicator number="01" title="产品智能分析" />
          
          <div className="bg-white p-4 rounded-xl border border-dashed border-gray-300 space-y-4 shadow-sm">
            {/* Image Upload Area - Grid for 2 Images */}
            <div className="grid grid-cols-2 gap-3">
              {[0, 1].map((index) => (
                <div 
                  key={index}
                  className={`relative rounded-lg flex flex-col items-center justify-center transition-colors border overflow-hidden
                    ${selectedImages[index] 
                      ? 'bg-black border-transparent' 
                      : `h-32 ${(index === 0 || selectedImages.length > 0) 
                        ? 'bg-gray-50 hover:bg-gray-100 border-gray-200 cursor-pointer' 
                        : 'bg-gray-50 border-gray-100 opacity-50 cursor-not-allowed'}`
                    }
                  `}
                  onClick={() => {
                    if (!selectedImages[index]) {
                      // Only trigger upload if slot is empty and allowed
                      if (index === 0 || selectedImages.length > 0) {
                        fileInputRef.current?.click();
                      }
                    }
                  }}
                >
                  {selectedImages[index] ? (
                    <>
                      <img 
                        src={selectedImages[index]} 
                        alt={`Uploaded ${index + 1}`} 
                        className="w-full max-h-48 object-contain" // Added max-h constraint
                      />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage(index);
                        }}
                        className="absolute top-1 right-1 bg-white/20 hover:bg-white/40 text-white rounded-full p-1 backdrop-blur-sm transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <div className="text-center text-gray-400">
                      {index === 0 || selectedImages.length > 0 ? (
                         <>
                           <Upload className="mx-auto mb-2" size={18} />
                           <span className="text-[10px]">{index === 0 ? '上传主图 (支持粘贴)' : '上传辅图 (可选)'}</span>
                         </>
                      ) : (
                         <span className="text-[10px]">添加第二张</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Hidden Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageUpload}
            />

            {/* Product Desc (Single Line) */}
            <input
              type="text"
              className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-gray-50"
              placeholder="粘贴或输入产品说明..."
              value={productDesc}
              onChange={(e) => setProductDesc(e.target.value)}
            />

            {/* Brand Input Row */}
            <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
               <div className="bg-gray-100 px-3 py-3 border-r border-gray-200 text-sm font-bold text-gray-600 min-w-[60px] text-center whitespace-nowrap">
                 品牌
               </div>
               <input 
                 type="text"
                 className="flex-1 text-sm p-3 bg-transparent outline-none text-gray-800 placeholder-gray-400"
                 placeholder="输入品牌名称 (优先使用)"
                 value={brandName}
                 onChange={(e) => setBrandName(e.target.value)}
               />
            </div>

            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || selectedImages.length === 0}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-lg hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm transform active:scale-[0.98]"
            >
              {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
              {isAnalyzing ? '分析中...' : '解析产品报告'}
            </button>
          </div>
        </section>

        {/* Section 2: Visual Definition */}
        <section className="transition-all mt-6">
          <StepIndicator number="02" title="视觉风格定义" />
          
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500 uppercase tracking-wide mb-3">2.1 基础视觉风格</h3>
              <div className="relative group">
                <select
                  className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer text-sm font-medium"
                  value={selectedStyle?.id || ''}
                  onChange={(e) => {
                    const style = VISUAL_STYLES.find(s => s.id === e.target.value) || null;
                    setSelectedStyle(style);
                  }}
                >
                  <option value="" disabled>请选择视觉风格</option>
                  {VISUAL_STYLES.map(style => (
                    <option key={style.id} value={style.id}>
                       {style.icon} {style.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 group-hover:text-indigo-600 transition-colors">
                  <ChevronDown size={16} />
                </div>
              </div>
              {selectedStyle && (
                <div className="mt-3 text-xs text-indigo-900 bg-indigo-50 p-3 rounded-lg border border-indigo-100 leading-relaxed shadow-sm">
                  <span className="font-bold text-indigo-700 block mb-1">风格特征</span> 
                  {selectedStyle.description}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-sm font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500 uppercase tracking-wide mb-3">2.2 页面排版逻辑</h3>
              <div className="relative group">
                <select
                  className="w-full appearance-none bg-white border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer text-sm font-medium"
                  value={selectedTypo?.id || ''}
                  onChange={(e) => {
                    const style = TYPO_STYLES.find(s => s.id === e.target.value) || null;
                    setSelectedTypo(style);
                  }}
                >
                  <option value="" disabled>请选择排版效果</option>
                  {TYPO_STYLES.map(typo => (
                    <option key={typo.id} value={typo.id}>
                      {typo.icon} {typo.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 group-hover:text-indigo-600 transition-colors">
                  <ChevronDown size={16} />
                </div>
              </div>
              {selectedTypo && (
                <div className="mt-3 text-xs text-indigo-900 bg-indigo-50 p-3 rounded-lg border border-indigo-100 leading-relaxed shadow-sm">
                   <span className="font-bold text-indigo-700 block mb-1">排版特征</span> 
                   {selectedTypo.description}
                </div>
              )}
            </div>

            <div>
               <h3 className="text-sm font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-500 uppercase tracking-wide mb-3">2.3 个性化需求</h3>
               
               <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
                 {/* Row of Toggles */}
                 <div className="grid grid-cols-3 gap-2">
                    {/* Model Button */}
                    <button
                      onClick={() => setOptions({...options, modelNeeded: !options.modelNeeded})}
                      className={`py-2 px-1 rounded-lg border text-xs font-bold transition-all ${options.modelNeeded ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                    >
                      真人模特 {options.modelNeeded && '✓'}
                    </button>
                    {/* Scene Button */}
                    <button
                      onClick={() => setOptions({...options, sceneNeeded: !options.sceneNeeded})}
                      className={`py-2 px-1 rounded-lg border text-xs font-bold transition-all ${options.sceneNeeded ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                    >
                      定制场景 {options.sceneNeeded && '✓'}
                    </button>
                    {/* Data Viz Button */}
                    <button
                      onClick={() => setOptions({...options, dataVizNeeded: !options.dataVizNeeded})}
                      className={`py-2 px-1 rounded-lg border text-xs font-bold transition-all ${options.dataVizNeeded ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                    >
                      数据可视化 {options.dataVizNeeded && '✓'}
                    </button>
                 </div>

                 {/* Inputs appear below if active */}
                 {(options.modelNeeded || options.sceneNeeded) && (
                   <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-100 animate-fade-in">
                      {options.modelNeeded && (
                         <div>
                           <label className="text-[10px] font-bold text-gray-500 mb-1 block">模特描述</label>
                           <input 
                            type="text" 
                            placeholder="如: 亚洲年轻女性, 职业装..." 
                            className="w-full text-xs p-2 border border-gray-200 rounded focus:border-indigo-500 outline-none bg-white"
                            value={options.modelDesc}
                            onChange={(e) => setOptions({...options, modelDesc: e.target.value})}
                           />
                         </div>
                      )}
                      {options.sceneNeeded && (
                         <div>
                           <label className="text-[10px] font-bold text-gray-500 mb-1 block">场景描述</label>
                           <input 
                            type="text" 
                            placeholder="如: 阳光厨房, 简约客厅..." 
                            className="w-full text-xs p-2 border border-gray-200 rounded focus:border-indigo-500 outline-none bg-white"
                            value={options.sceneDesc}
                            onChange={(e) => setOptions({...options, sceneDesc: e.target.value})}
                           />
                         </div>
                      )}
                   </div>
                 )}

                 {/* Other Input & Presets */}
                 <div className="pt-2 border-t border-gray-100 mt-2">
                    <div className="relative mb-2">
                        <input 
                          type="text" 
                          placeholder="其他具体要求..."
                          className="w-full text-xs p-2.5 pr-8 border border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-gray-50"
                          value={options.otherReqs}
                          onChange={(e) => setOptions({...options, otherReqs: e.target.value})}
                        />
                        {options.otherReqs && (
                          <button
                            onClick={() => setOptions({...options, otherReqs: ''})}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200 transition-colors"
                            title="清空"
                          >
                            <X size={14} />
                          </button>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {OTHER_REQ_PRESETS.map(req => (
                        <button 
                          key={req}
                          onClick={() => {
                            // Avoid duplicates or simple append
                            const current = options.otherReqs;
                            if (!current.includes(req)) {
                              setOptions({
                                ...options, 
                                otherReqs: current ? `${current}，${req}` : req
                              });
                            }
                          }}
                          className="text-[10px] px-2.5 py-1.5 bg-gray-50 text-gray-600 font-medium rounded-full hover:bg-indigo-50 hover:text-indigo-600 border border-gray-200 transition-all"
                        >
                          + {req}
                        </button>
                      ))}
                    </div>
                 </div>

               </div>
            </div>
          </div>
        </section>

        {/* Section 3: Action */}
        <section className="pt-6 pb-8">
           <StepIndicator number="03" title="方案画面比例" />
           {/* Grid layout for single line display */}
           <div className="grid grid-cols-7 gap-1.5 mb-6">
              {ASPECT_RATIOS.map(ratio => (
                <div 
                  key={ratio}
                  onClick={() => setOptions({...options, aspectRatio: ratio})}
                  className={`
                    py-2 rounded-md text-center text-[10px] font-bold cursor-pointer transition-all
                    ${options.aspectRatio === ratio 
                      ? 'bg-gray-900 text-white shadow-md transform scale-105 z-10' 
                      : 'border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'
                    }
                  `}
                >
                  {ratio}
                </div>
              ))}
           </div>

           <button 
             onClick={handleGenerate}
             disabled={isGenerating || !selectedStyle || !selectedTypo || selectedImages.length === 0}
             className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg rounded-xl hover:shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none disabled:transform-none"
           >
             {isGenerating ? <Loader2 className="animate-spin" /> : <Wand2 />}
             {isGenerating ? '正在构建视觉系统...' : '生成视觉方案提示词'}
           </button>
        </section>
      </Sidebar>

      {/* --- Right Preview Panel --- */}
      <div className="flex-1 h-screen overflow-hidden flex flex-col bg-white">
        
        {/* Header - Fixed */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-8 bg-white flex-shrink-0 z-20">
          <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isLoggedIn ? 'bg-green-500' : 'bg-gray-300'}`}></span>
            生成效果方案预览
          </h2>
          <div className="flex gap-3">
             <button className="flex items-center gap-2 px-4 py-2 text-xs font-medium border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
               <Settings size={14} />
               配置
             </button>
             
             {!isLoggedIn ? (
               <button 
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-black rounded-full hover:bg-gray-800 transition-all shadow-sm"
               >
                 <LogIn size={14} />
                 登录
               </button>
             ) : (
                <div className="flex items-center gap-3 bg-gray-50 rounded-full px-2 py-1 pr-4 border border-gray-100">
                   <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                     <User size={14} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-gray-900 leading-tight">Admin</span>
                      <span className="text-[9px] text-green-600 font-medium leading-tight flex items-center gap-1">
                        已连接云端
                      </span>
                   </div>
                   <button 
                    onClick={() => setIsLoggedIn(false)}
                    className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="退出登录"
                   >
                     <LogOut size={14} />
                   </button>
                </div>
             )}
          </div>
        </div>

        {/* Combined Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 custom-scrollbar">
            <div className="max-w-[1600px] mx-auto p-8 space-y-8">
                {/* 1. Analysis Report (Part of scrollable content) */}
                <div className="w-full">
                    <AnalysisReportView data={analysisResult} />
                </div>

                {/* 2. Generated Output Cards or Empty State */}
                <div className="w-full space-y-6">
                    {parsedPrompts.length > 0 ? (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <Wand2 className="text-gray-400" size={18} />
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">视觉方案详情</h3>
                          </div>
                          
                          {parsedPrompts.map((prompt) => (
                             <PromptCard 
                               key={prompt.id} 
                               prompt={prompt} 
                               onGenerateImage={handleGenerateImage}
                             />
                          ))}
                        </>
                    ) : (
                        <div className={`flex flex-col items-center justify-center text-gray-300 select-none py-16 border-2 border-dashed border-gray-200 rounded-3xl h-[400px]`}>
                            <div className="text-6xl font-black opacity-10 tracking-widest">
                                {analysisResult ? '待生成' : '预览区'}
                            </div>
                            <p className="mt-4 text-gray-400 font-light tracking-widest text-sm">
                                {analysisResult ? '请配置风格并生成提示词' : '请在左侧上传图片并解析'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>

    </div>
  );
};

export default App;
