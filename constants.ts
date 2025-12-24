import { VisualStyle, TypoStyle } from './types';

export const VISUAL_STYLES: VisualStyle[] = [
  { id: 'magazine', name: '杂志编辑风格', description: '高级、专业、大片感、粗衬线标题、极简留白', icon: '📰' },
  { id: 'watercolor', name: '水彩艺术风格', description: '温暖、柔和、晕染效果、手绘质感', icon: '🎨' },
  { id: 'tech', name: '科技未来风格', description: '冷色调、几何图形、数据可视化、蓝光效果', icon: '🔮' },
  { id: 'retro', name: '复古胶片风格', description: '颗粒质感、暖色调、怀旧氛围、宝丽来边框', icon: '🎞️' },
  { id: 'minimalist', name: '极简北欧风格', description: '性冷淡、大留白、几何线条、黑白灰', icon: '❄️' },
  { id: 'cyberpunk', name: '霓虹赛博风格', description: '荧光色、描边发光、未来都市、暗色背景', icon: '🌃' },
  { id: 'organic', name: '自然有机风格', description: '植物元素、大地色系、手工质感、环保理念', icon: '🌿' },
];

export const TYPO_STYLES: TypoStyle[] = [
  { id: 'serif_magazine', name: '杂志风', description: '粗衬线大标题 + 细线装饰 + 网格对齐', icon: 'A' },
  { id: 'glassmorphism', name: '现代风', description: '玻璃拟态卡片 + 半透明背景 + 柔和圆角', icon: 'B' },
  { id: '3d_luxury', name: '奢华风', description: '3D浮雕文字 + 金属质感 + 光影效果', icon: 'C' },
  { id: 'handwritten', name: '艺术风', description: '手写体标注 + 水彩笔触 + 不规则布局', icon: 'D' },
  { id: 'neon', name: '赛博风', description: '无衬线粗体 + 霓虹描边 + 发光效果', icon: 'E' },
  { id: 'minimal_line', name: '极简风', description: '极细线条字 + 大量留白 + 精确对齐', icon: 'F' },
];

export const SYSTEM_PROMPT_TEMPLATE = `
# 任务说明
我需要为我的产品生成一套完整的电商KV视觉系统提示词（10张海报，{{ASPECT_RATIO}}格式）。

请严格按照以下要求生成：

## 1. 核心输入信息
【识别报告】
{{ANALYSIS_REPORT}}

## 2. 风格选择
视觉风格：{{VISUAL_STYLE}}
文字排版效果：{{TYPO_STYLE}}

## 3. 特殊需求
{{EXTRA_REQUIREMENTS}}

## 4. 生成核心要求（重中之重）
1. **产品图还原要求**：必须在提示词中明确说明："严格还原上传的产品图，包括包装设计、颜色、LOGO位置、文字内容、图案元素等所有细节"。
2. **文案排版要求**：每张海报的所有文字内容都必须采用中英文双语排版。
3. **海报结构**：
   - 海报01: 主KV视觉 (Hero Shot)
   - 海报02: 生活场景 (Lifestyle)
   - 海报03: 工艺/卖点可视化 (Concept)
   - 海报04-07: 细节特写 (Details)
   - 海报08: 品牌故事 (Brand Story)
   - 海报09: 规格表 (Specs)
   - 海报10: 使用指南 (Guide)

## 5. 输出格式
请严格按照以下Markdown结构输出，不要输出任何多余的开场白：

### 海报XX | [标题]
**提示词 (中文)**: [详细描述]
**Product Display**: [严格还原描述]
**Layout**: [排版布局描述]
**Negative**: [负面词]
**Prompt (English)**: [英文翻译]
`;