import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeMaintenanceIssue = async (issueDescription: string, deviceModel: string): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Cannot perform AI analysis.";
  }

  try {
    const prompt = `
      Você é um técnico de TI especialista nível sênior.
      Analise o seguinte problema relatado em um computador escolar:
      Modelo: ${deviceModel}
      Problema: "${issueDescription}"

      Por favor, forneça uma resposta curta e estruturada com:
      1. Diagnóstico provável (1 frase).
      2. Três passos recomendados para solução.
      3. Peças que podem precisar de substituição (se houver).
      
      Mantenha o tom profissional e direto.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Não foi possível gerar uma análise.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Erro ao conectar com o serviço de IA.";
  }
};
