
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, GenerationOptions, TypoStyle, VisualStyle } from "../types";
import { SYSTEM_PROMPT_TEMPLATE } from "../constants";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to clean JSON string from markdown formatting
const cleanJsonString = (text: string): string => {
  if (!text) return "{}";
  let clean = text.trim();
  // Remove markdown code blocks if present
  if (clean.startsWith("```json")) {
    clean = clean.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
  } else if (clean.startsWith("```")) {
    clean = clean.replace(/^```\s*/i, "").replace(/\s*```$/, "");
  }
  return clean;
};

export const analyzeImage = async (base64Images: string[], productDesc: string): Promise<AnalysisResult> => {
  // Updated model to a valid preview model from the documentation
  const model = "gemini-3-flash-preview";

  const prompt = `
  请仔细分析上传的产品图片和描述。如果有多张图片，请综合参考所有图片。提取以下信息并以JSON格式返回：
  1. brandName: 品牌名称 (中英文)
  2. productType: 产品类型
  3. specs: 产品规格
  4. sellingPoints: 核心卖点列表 (数组，精简至5-8个关键点)
  5. colors: 主色调和辅助色 (数组，最多5个)。**重要：必须包含HEX颜色代码** (例如: "海蓝色 #4A90E2", "白色 #FFFFFF")。如果无法确定精确HEX，请根据图片估算。
  6. designStyle: 设计风格 (简短描述)
  7. targetAudience: 目标受众 (简短描述)

  用户补充描述: ${productDesc}
  `;

  try {
    // Create image parts for all uploaded images
    const imageParts = base64Images.map(imgData => ({
      inlineData: {
        mimeType: "image/jpeg", // Assuming JPEG for simplicity, though detecting from source would be better. Gemini is often tolerant.
        data: imgData
      }
    }));

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          ...imageParts,
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            brandName: { type: Type.STRING },
            productType: { type: Type.STRING },
            specs: { type: Type.STRING },
            sellingPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            colors: { type: Type.ARRAY, items: { type: Type.STRING } },
            designStyle: { type: Type.STRING },
            targetAudience: { type: Type.STRING },
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI");
    }

    try {
      const cleanText = cleanJsonString(text);
      return JSON.parse(cleanText) as AnalysisResult;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Raw Text:", text.slice(0, 500) + "..."); // Log first 500 chars for debug
      throw new Error("Failed to parse analysis results. Please try again.");
    }

  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const analyzeText = async (productDesc: string): Promise<AnalysisResult> => {
    // Updated model to a valid preview model
    const model = "gemini-3-flash-preview";
  
    const prompt = `
    请仔细分析这段产品描述。提取以下信息并以JSON格式返回：
    1. brandName: 品牌名称 (中英文)
    2. productType: 产品类型
    3. specs: 产品规格
    4. sellingPoints: 核心卖点列表 (数组，精简至5-8个)
    5. colors: 颜色信息 (数组)。**重要：必须包含HEX颜色代码** (例如: "Red #FF0000")。
    6. designStyle: 设计风格推断
    7. targetAudience: 目标受众推断
  
    产品描述: ${productDesc}
    `;
  
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                brandName: { type: Type.STRING },
                productType: { type: Type.STRING },
                specs: { type: Type.STRING },
                sellingPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                colors: { type: Type.ARRAY, items: { type: Type.STRING } },
                designStyle: { type: Type.STRING },
                targetAudience: { type: Type.STRING },
              }
            }
          }
      });
  
      const text = response.text;
      if (!text) {
        throw new Error("Empty response from AI");
      }

      try {
        const cleanText = cleanJsonString(text);
        return JSON.parse(cleanText) as AnalysisResult;
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        throw new Error("Failed to parse text analysis results.");
      }

    } catch (error) {
      console.error("Text Analysis failed:", error);
      throw error;
    }
  };

export const generatePrompts = async (
  analysis: AnalysisResult,
  style: VisualStyle,
  typo: TypoStyle,
  options: GenerationOptions
): Promise<string> => {
  // Updated model to a valid preview model
  const model = "gemini-3-flash-preview";

  // Construct the Analysis Report string
  const analysisReport = `
  品牌名称: ${analysis.brandName}
  产品类型: ${analysis.productType}
  产品规格: ${analysis.specs}
  核心卖点: ${analysis.sellingPoints.join(', ')}
  配色方案: ${analysis.colors.join(', ')}
  设计风格: ${analysis.designStyle}
  目标受众: ${analysis.targetAudience}
  `;

  // Construct Extra Requirements string
  const extraReqs = `
  模特需求: ${options.modelNeeded ? '是 - ' + options.modelDesc : '否'}
  场景需求: ${options.sceneNeeded ? '是 - ' + options.sceneDesc : '否'}
  数据可视化: ${options.dataVizNeeded ? '是' : '否'}
  其他要求: ${options.otherReqs || '无'}
  `;

  // Replace placeholders in template
  let finalPrompt = SYSTEM_PROMPT_TEMPLATE
    .replace('{{ANALYSIS_REPORT}}', analysisReport)
    .replace('{{VISUAL_STYLE}}', `${style.name} (${style.description})`)
    .replace('{{TYPO_STYLE}}', `${typo.name} (${typo.description})`)
    .replace('{{EXTRA_REQUIREMENTS}}', extraReqs)
    .replace('{{ASPECT_RATIO}}', options.aspectRatio);

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: finalPrompt,
    });
    
    return response.text || "Generating failed.";
  } catch (error) {
    console.error("Prompt generation failed:", error);
    throw error;
  }
};

export const generateImageFromPrompt = async (
  prompt: string,
  referenceImages: string[],
  aspectRatio: string
): Promise<string> => {
  // Use gemini-2.5-flash-image for generation/editing as per instructions
  const model = "gemini-2.5-flash-image";

  // Map user aspect ratio to supported API values if necessary
  // API supports: "1:1", "3:4", "4:3", "9:16", "16:9"
  // App supports: '1:1', '16:9', '9:16', '3:4', '4:3', '2:3', '3:2'
  let validRatio = "1:1";
  if (["1:1", "3:4", "4:3", "9:16", "16:9"].includes(aspectRatio)) {
    validRatio = aspectRatio;
  } else if (aspectRatio === '2:3') {
    validRatio = '3:4'; // Approximation
  } else if (aspectRatio === '3:2') {
    validRatio = '4:3'; // Approximation
  }

  // Create image parts from reference images
  const imageParts = referenceImages.map(img => ({
    inlineData: {
      mimeType: 'image/jpeg',
      data: img,
    },
  }));

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          ...imageParts,
          { text: "Generate a high quality e-commerce poster image based on this product and the following description. The product in the image must look exactly like the reference image provided. \n\nDescription: " + prompt },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: validRatio,
        }
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    
    throw new Error("No image generated");
  } catch (error) {
    console.error("Image generation failed:", error);
    throw error;
  }
};
