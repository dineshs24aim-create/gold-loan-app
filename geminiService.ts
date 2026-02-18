
import { GoogleGenAI } from "@google/genai";
import { Loan, Bank } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getAppraisalInsights(loans: Loan[], banks: Bank[]) {
  const summary = loans.reduce((acc: any, loan) => {
    const b = banks.find(bank => bank.id === loan.bankId)?.name || 'Other';
    acc[b] = (acc[b] || 0) + 1;
    return acc;
  }, {});

  const prompt = `As a professional banking consultant, analyze this gold loan appraiser's workload and provide a brief, professional 2-3 sentence summary/insight. 
  Total Loans: ${loans.length}
  Distribution per bank: ${JSON.stringify(summary)}
  Current Date: ${new Date().toLocaleDateString()}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "Keep up the consistent appraisal work to maintain a balanced workload across your partner banks.";
  }
}
