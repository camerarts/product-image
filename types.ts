
export interface AnalysisResult {
  brandName: string;
  productType: string;
  specs: string;
  sellingPoints: string[];
  colors: string[];
  designStyle: string;
  targetAudience: string;
}

export interface VisualStyle {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface TypoStyle {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface GenerationOptions {
  modelNeeded: boolean;
  modelDesc: string;
  sceneNeeded: boolean;
  sceneDesc: string;
  dataVizNeeded: boolean;
  otherReqs: string;
  aspectRatio: string;
}

export interface ParsedPrompt {
  id: number;
  title: string;
  fullContent: string;
  chinesePrompt: string;
  englishPrompt: string;
  generatedImage: string | null;
  isGenerating: boolean;
}

export const AppStep = {
  ANALYSIS: 1,
  VISUAL_STYLE: 2,
  TYPOGRAPHY: 3,
  GENERATION: 4
} as const;

export type AppStep = typeof AppStep[keyof typeof AppStep];

// --- Auth & Admin Types ---

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  status: 'active' | 'disabled';
  registeredAt: string;
}

export interface ActivationKey {
  id: string;
  key: string;
  status: 'unused' | 'used';
  generatedBy: string; // admin username
  generatedAt: string;
  usedBy?: string; // username who used it
  usedAt?: string;
}
