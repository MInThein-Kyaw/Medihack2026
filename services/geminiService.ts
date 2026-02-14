
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Scenario, IDP, AssessmentResult, User, Language, EvaluationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Categorize experience into professional levels for AI prompting
 */
function getExperienceTier(years: number): string {
  if (years <= 2) return "Beginner (Novice)";
  if (years <= 5) return "Intermediate (Proficient)";
  if (years <= 10) return "Advanced (Highly Competent)";
  return "Expert (Senior Leader)";
}

/**
 * Generates a scenario with difficulty matched to nurse's experience
 */
export async function generateScenario(competencyName: string, language: Language, experienceYears: number): Promise<Scenario> {
  const langText = language === 'th' ? 'Thai' : 'English';
  const tier = getExperienceTier(experienceYears);
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate one realistic nursing scenario for: ${competencyName}.
               Target Difficulty: ${tier}.
               Language: ${langText}.
               
               Guidelines for Difficulty:
               - Beginner: Focus on fundamental safety, basic procedures, and direct patient care.
               - Intermediate: Include multi-tasking, complex family dynamics, or standard complications.
               - Advanced: Focus on critical decision-making, team coordination, and advanced clinical reasoning.
               - Expert: High-stakes ethical dilemmas, system-wide management, or rare/critical medical emergencies.
               
               Ask a clear open-ended question at the end.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          text: { type: Type.STRING },
          context: { type: Type.STRING }
        },
        required: ['id', 'text', 'context']
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    throw new Error("Failed to generate scenario");
  }
}

/**
 * Evaluates a response and generates a topic-specific IDP
 */
export async function evaluateResponse(
  scenario: Scenario, 
  userResponse: string, 
  language: Language,
  standardScore: number
): Promise<EvaluationResult> {
  const langText = language === 'th' ? 'Thai' : 'English';
  
  const prompt = `
    Scenario: ${scenario.text}
    Nurse's Response: "${userResponse}"
    Target Standard Score: ${standardScore}
    
    1. Evaluate the response on a scale of 0.0 to 4.0.
    2. Provide constructive feedback.
    3. Generate a Topic-Specific Individual Development Plan (IDP).
       Rule: If score > ${standardScore} (Positive Gap), prioritize Non-Training (Coaching, Mentoring).
       Rule: If score <= ${standardScore} (Negative Gap), prioritize Formal Training (Workshops, Courses).
    
    Output everything in ${langText}.
  `;

  const result = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          feedback: { type: Type.STRING },
          idp: {
            type: Type.OBJECT,
            properties: {
              trainingCourses: { type: Type.ARRAY, items: { type: Type.STRING } },
              nonTrainingCourses: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendation: { type: Type.STRING }
            },
            required: ['trainingCourses', 'nonTrainingCourses', 'recommendation']
          }
        },
        required: ['score', 'feedback', 'idp']
      }
    }
  });

  try {
    return JSON.parse(result.text);
  } catch (e) {
    throw new Error("Evaluation failed");
  }
}

/**
 * Aggregates all per-topic IDPs into one summary recommendation
 */
export async function generateConsolidatedSummary(
  user: User,
  results: AssessmentResult[],
  language: Language
): Promise<string> {
  const langText = language === 'th' ? 'Thai' : 'English';
  const summary = results.map(r => `Topic: ${r.competencyId}, Score: ${r.score}, Gap: ${r.gap}`).join('\n');

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Acting as a Nursing Director, write a 3-sentence high-level summary for this nurse's global performance based on 11 topic IDPs.
               Experience: ${user.experienceYears}y.
               Summary Data:
               ${summary}
               Language: ${langText}.`,
  });

  return response.text || "";
}

export async function getVoiceFeedback(text: string, language: Language): Promise<string> {
  const voiceName = language === 'th' ? 'Kore' : 'Zephyr';
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-preview-tts',
    contents: [{ parts: [{ text: `Nurse Supervisor: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
}

export function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
