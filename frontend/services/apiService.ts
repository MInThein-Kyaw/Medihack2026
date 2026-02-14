import { Scenario, EvaluationResult, Language } from '../types';

const API_URL = 'http://localhost:3001/api';

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('authToken');

// Set auth token
export const setAuthToken = (token: string) => {
  localStorage.setItem('authToken', token);
};

// Remove auth token
export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
};

// Auth headers
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}`
});

/**
 * Register new user
 */
export async function registerUser(
  username: string, 
  password: string, 
  email: string, 
  experienceYears: number, 
  level: number, 
  standardScore: number,
  department?: string
) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email, experienceYears, level, standardScore, department })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }
  
  const data = await response.json();
  setAuthToken(data.token);
  return data.user;
}

/**
 * Login user
 */
export async function loginUser(username: string, password: string, experienceYears: number, level: number, standardScore: number) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, experienceYears, level, standardScore })
  });
  
  if (!response.ok) {
    let errorMessage = 'Login failed';
    try {
      const error = await response.json();
      errorMessage = error.error || errorMessage;
    } catch {
      // keep default message when response body is not JSON
    }
    throw new Error(errorMessage);
  }
  
  const data = await response.json();
  setAuthToken(data.token);
  return data.user;
}

/**
 * Start new assessment session
 */
export async function startSession(language: Language, totalCompetencies: number) {
  const response = await fetch(`${API_URL}/assessment/session/start`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ language, totalCompetencies })
  });
  
  if (!response.ok) throw new Error('Failed to start session');
  
  const data = await response.json();
  return data.sessionId;
}

/**
 * Generates multiple scenarios for a competency
 */
export async function generateMultipleScenarios(
  competencyName: string, 
  language: Language, 
  experienceYears: number,
  count: number = 3
): Promise<Scenario[]> {
  const response = await fetch(`${API_URL}/assessment/scenarios/generate`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ competencyName, language, experienceYears, count })
  });
  
  if (!response.ok) throw new Error('Failed to generate scenarios');
  
  return await response.json();
}

/**
 * Evaluates multiple responses at once
 */
export async function evaluateMultipleResponses(
  sessionId: string,
  competencyId: string,
  competencyName: string,
  scenarios: Scenario[],
  userResponses: string[],
  language: Language,
  standardScore: number
): Promise<EvaluationResult> {
  const response = await fetch(`${API_URL}/assessment/evaluate`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ 
      sessionId,
      competencyId,
      competencyName,
      scenarios, 
      responses: userResponses, 
      language, 
      standardScore 
    })
  });
  
  if (!response.ok) throw new Error('Evaluation failed');
  
  return await response.json();
}

/**
 * Generate short voice summary
 */
export async function generateShortSummary(
  score: number,
  standardScore: number,
  competencyName: string,
  language: Language
): Promise<string> {
  const gap = score - standardScore;
  const performance = gap > 0 ? 'exceeded' : gap < 0 ? 'below' : 'met';
  
  return language === 'th'
    ? `คะแนน ${score.toFixed(1)} จาก 4.0 ${performance === 'exceeded' ? 'สูงกว่า' : performance === 'below' ? 'ต่ำกว่า' : 'เท่ากับ'}มาตรฐาน`
    : `Score ${score.toFixed(1)} out of 4.0, ${performance} standard`;
}

/**
 * Get voice feedback audio
 */
export async function getVoiceFeedback(text: string, language: Language): Promise<string> {
  const response = await fetch(`${API_URL}/assessment/voice`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ text, language })
  });
  
  if (!response.ok) throw new Error('Voice generation failed');
  
  const data = await response.json();
  return data.audioData;
}

/**
 * Complete assessment session
 */
export async function completeSession(sessionId: string) {
  const response = await fetch(`${API_URL}/assessment/session/complete`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ sessionId })
  });
  
  if (!response.ok) throw new Error('Failed to complete session');
  
  return await response.json();
}

/**
 * Generate consolidated summary for all assessment results
 */
export async function generateConsolidatedSummary(
  experienceYears: number,
  results: any[],
  language: Language
): Promise<string> {
  const response = await fetch(`${API_URL}/assessment/summary/consolidated`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ experienceYears, results, language })
  });
  
  if (!response.ok) throw new Error('Failed to generate consolidated summary');
  
  const data = await response.json();
  return data.summary;
}

/**
 * Get session results
 */
export async function getSessionResults(sessionId: string) {
  const response = await fetch(`${API_URL}/assessment/session/${sessionId}/results`, {
    method: 'GET',
    headers: authHeaders()
  });
  
  if (!response.ok) throw new Error('Failed to get results');
  
  return await response.json();
}

/**
 * Get user progress
 */
export async function getUserProgress() {
  const response = await fetch(`${API_URL}/user/progress`, {
    method: 'GET',
    headers: authHeaders()
  });
  
  if (!response.ok) throw new Error('Failed to get progress');
  
  return await response.json();
}

/**
 * Get assessment history
 */
export async function getAssessmentHistory() {
  const response = await fetch(`${API_URL}/user/history`, {
    method: 'GET',
    headers: authHeaders()
  });
  
  if (!response.ok) throw new Error('Failed to get history');
  
  return await response.json();
}

// Keep legacy decode functions for audio playback
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
