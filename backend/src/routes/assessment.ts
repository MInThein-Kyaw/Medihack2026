import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { GoogleGenAI, Type, Modality } from '@google/genai';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

function isQuotaError(error: any) {
  return error?.status === 429 ||
    String(error?.message || '').includes('RESOURCE_EXHAUSTED') ||
    String(error?.message || '').includes('quota');
}

function getFallbackScenarios(competencyName: string, language: string, count: number) {
  const isThai = language === 'th';
  const base = isThai
    ? [
        'ผู้ป่วยมีอาการแย่ลงหลังได้รับยาใหม่ คุณจะประเมินและจัดการอย่างไร?',
        'ระหว่างเวรมีผู้ป่วยหลายรายต้องการการดูแลพร้อมกัน คุณจะจัดลำดับความสำคัญอย่างไร?',
        'ญาติผู้ป่วยกังวลและตั้งคำถามต่อแผนการรักษา คุณจะสื่อสารอย่างไร?',
        'เกิดความคลาดเคลื่อนในการสื่อสารระหว่างทีม คุณจะป้องกันและแก้ไขอย่างไร?',
        'ผู้ป่วยปฏิเสธการรักษาบางอย่าง คุณจะดูแลอย่างไรโดยเคารพสิทธิผู้ป่วย?'
      ]
    : [
        'A patient deteriorates shortly after receiving a new medication. How would you assess and manage the situation?',
        'During a busy shift, multiple patients need urgent attention at the same time. How would you prioritize care?',
        'A family member is anxious and challenges the treatment plan. How would you communicate and respond?',
        'A communication gap occurs during handoff between team members. How would you prevent and address this?',
        'A patient refuses part of the recommended treatment. How would you provide safe care while respecting autonomy?'
      ];

  return Array.from({ length: count }).map((_, index) => ({
    id: `fallback-${index + 1}`,
    text: `${isThai ? 'หัวข้อ' : 'Topic'}: ${competencyName}. ${base[index % base.length]}`,
    context: isThai ? 'คำถามสำรองจากระบบเมื่อโควตา AI เต็ม' : 'System fallback question when AI quota is exceeded'
  }));
}

function getFallbackEvaluation(
  responses: string[],
  standardScore: number,
  competencyName: string,
  language: string
) {
  const isThai = language === 'th';
  const totalWords = responses
    .filter(Boolean)
    .map((text) => text.trim().split(/\s+/).filter(Boolean).length)
    .reduce((acc, value) => acc + value, 0);

  let score = 1.2;
  if (totalWords >= 40) score = 2.0;
  if (totalWords >= 90) score = 2.8;
  if (totalWords >= 150) score = 3.4;
  if (totalWords >= 220) score = 3.8;

  const safeScore = Math.max(0, Math.min(4, Number(score.toFixed(1))));
  const isPositiveGap = safeScore > standardScore;

  const feedback = isThai
    ? `ระบบประเมินแบบสำรองถูกใช้งานสำหรับหัวข้อ ${competencyName} เนื่องจากโควตา AI เต็ม ผลลัพธ์ประเมินจากความครบถ้วนและความชัดเจนของคำตอบ กรุณาทบทวนคำตอบให้มีเหตุผลเชิงคลินิกชัดเจนยิ่งขึ้นในรอบถัดไป`
    : `Fallback evaluation was used for ${competencyName} because AI quota is currently exhausted. The score is estimated from response completeness and clarity. Add clearer clinical reasoning and prioritization in your next attempt.`;

  const trainingCourses = isThai
    ? [
        `เวิร์กช็อป: การตัดสินใจเชิงคลินิกในหัวข้อ ${competencyName}`,
        'หลักสูตร: การสื่อสารทางการพยาบาลและการประเมินอาการอย่างเป็นระบบ'
      ]
    : [
        `Workshop: Clinical decision-making for ${competencyName}`,
        'Course: Structured nursing assessment and communication'
      ];

  const nonTrainingCourses = isThai
    ? [
        'โค้ชชิ่งรายสัปดาห์กับหัวหน้าหอผู้ป่วย',
        'ทบทวนเคสย้อนหลังและรับ feedback จากพี่เลี้ยง'
      ]
    : [
        'Weekly coaching with charge nurse',
        'Case reflection with mentor feedback'
      ];

  return {
    score: safeScore,
    feedback,
    idp: {
      trainingCourses: isPositiveGap ? trainingCourses.slice(0, 1) : trainingCourses,
      nonTrainingCourses: isPositiveGap ? nonTrainingCourses : nonTrainingCourses.slice(0, 1),
      recommendation: isThai
        ? (isPositiveGap
            ? 'ผลลัพธ์สูงกว่ามาตรฐาน: เน้นโค้ชชิ่งและมอบหมายบทบาทผู้นำในสถานการณ์จริง'
            : 'ผลลัพธ์ยังไม่ถึงมาตรฐาน: เน้นการอบรมแบบเป็นทางการร่วมกับการโค้ชชิ่งต่อเนื่อง')
        : (isPositiveGap
            ? 'Score is above standard: prioritize coaching and stretch leadership assignments.'
            : 'Score is below standard: prioritize formal training with ongoing coaching support.')
    }
  };
}

function getFallbackConsolidatedSummary(experienceYears: number, results: any[], language: string) {
  const isThai = language === 'th';
  const count = results?.length || 0;
  const total = results?.reduce((acc: number, item: any) => acc + (item?.score || 0), 0) || 0;
  const avg = count > 0 ? (total / count) : 0;

  if (isThai) {
    return `สรุปแบบสำรอง: จาก ${count} หัวข้อ คะแนนเฉลี่ยอยู่ที่ ${avg.toFixed(1)} จาก 4.0 สำหรับประสบการณ์ ${experienceYears} ปี แนะนำให้พัฒนาอย่างต่อเนื่องโดยเน้นหัวข้อที่มีคะแนนต่ำและติดตามผลทุกเดือน`;
  }

  return `Fallback summary: Across ${count} competencies, the average score is ${avg.toFixed(1)} out of 4.0 for a nurse with ${experienceYears} years of experience. Continue targeted development on lower-scoring competencies and review progress monthly.`;
}

// Start new assessment session
router.post('/session/start', authenticate, async (req: AuthRequest, res) => {
  try {
    const { language, totalCompetencies } = req.body;
    
    const session = await prisma.assessmentSession.create({
      data: {
        userId: req.userId!,
        status: 'in_progress',
        language,
        totalCompetencies,
        completedCount: 0
      }
    });
    
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Session start error:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

// Generate multiple scenarios
router.post('/scenarios/generate', authenticate, async (req: AuthRequest, res) => {
  try {
    const { competencyName, language, experienceYears, count = 3 } = req.body;
    
    const tier = experienceYears <= 2 ? "Beginner (Novice)" : 
                 experienceYears <= 5 ? "Intermediate (Proficient)" :
                 experienceYears <= 10 ? "Advanced (Highly Competent)" : "Expert (Senior Leader)";
    
    const questionLength = experienceYears <= 2 ? "short and simple (2-3 sentences)" :
                          experienceYears <= 5 ? "moderate length (3-4 sentences)" :
                          experienceYears <= 10 ? "detailed (4-5 sentences)" : "comprehensive and complex (5-6 sentences)";
    
    const langText = language === 'th' ? 'Thai' : 'English';
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate ${count} different realistic nursing scenarios for: ${competencyName}.
                 Target Difficulty: ${tier}.
                 Question Length: ${questionLength}.
                 Language: ${langText}.
                 
                 Each scenario should end with a clear open-ended question. Make scenarios diverse and varied.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenarios: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                  context: { type: Type.STRING }
                },
                required: ['id', 'text', 'context']
              }
            }
          },
          required: ['scenarios']
        }
      }
    });
    
    const responseText = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      throw new Error('Invalid response from AI model');
    }
    const result = JSON.parse(responseText);
    res.json(result.scenarios || []);
  } catch (error) {
    console.error('Scenario generation error:', error);
    const status = (error as any)?.status;
    if (status === 429) {
      const { competencyName, language, count = 3 } = req.body;
      const fallbackScenarios = getFallbackScenarios(competencyName, language, count);
      return res.status(200).json(fallbackScenarios);
    }
    res.status(500).json({ error: 'Failed to generate scenarios' });
  }
});

// Evaluate multiple responses and save results
router.post('/evaluate', authenticate, async (req: AuthRequest, res) => {
  try {
    const { sessionId, competencyId, competencyName, scenarios, responses, language, standardScore } = req.body;
    
    // Validate sessionId exists
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    // Check if session exists in database
    const session = await prisma.assessmentSession.findUnique({
      where: { id: sessionId }
    });
    
    if (!session) {
      console.error(`Session not found: ${sessionId}`);
      return res.status(404).json({ 
        error: 'Session not found. Please start a new assessment session.' 
      });
    }
    
    // Verify session belongs to the user
    if (session.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized access to session' });
    }
    
    const langText = language === 'th' ? 'Thai' : 'English';
    const scenarioResponses = scenarios.map((scenario: any, idx: number) => `
      Q${idx + 1}: ${scenario.text}
      A${idx + 1}: "${responses[idx] || 'No response'}"
    `).join('\n');
    
    // Call Gemini for evaluation
    const prompt = `
      Competency: ${competencyName}
      Target Standard Score: ${standardScore}
      
      Evaluate all responses for this competency:
      ${scenarioResponses}
      
      1. Calculate an average score (0.0 to 4.0) based on all responses.
      2. Provide brief constructive feedback (2-3 sentences max).
      3. Generate a Topic-Specific Individual Development Plan (IDP).
         Rule: If score > ${standardScore} (Positive Gap), prioritize Non-Training (Coaching, Mentoring).
         Rule: If score <= ${standardScore} (Negative Gap), prioritize Formal Training (Workshops, Courses).
      
      Output everything in ${langText}. Keep feedback concise.
    `;
    
    let evaluation: any;
    try {
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
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
                }
              }
            }
          }
        }
      });

      const evaluationText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!evaluationText) {
        throw new Error('Invalid response from AI model');
      }
      evaluation = JSON.parse(evaluationText);
    } catch (error) {
      if (isQuotaError(error)) {
        console.warn('Gemini quota exceeded during evaluation, using fallback evaluation');
        evaluation = getFallbackEvaluation(responses, standardScore, competencyName, language);
      } else {
        throw error;
      }
    }
    const gap = evaluation.score - standardScore;
    
    // Save assessment result
    const assessmentResult = await prisma.assessmentResult.create({
      data: {
        sessionId,
        userId: req.userId!,
        competencyId,
        competencyName,
        score: evaluation.score,
        gap,
        feedback: evaluation.feedback
      }
    });
    
    // Save question responses
    for (let i = 0; i < scenarios.length; i++) {
      await prisma.questionResponse.create({
        data: {
          assessmentResultId: assessmentResult.id,
          questionNumber: i + 1,
          scenarioText: scenarios[i].text,
          userResponse: responses[i] || 'No response'
        }
      });
    }
    
    // Save IDP plan
    await prisma.iDPPlan.create({
      data: {
        assessmentResultId: assessmentResult.id,
        userId: req.userId!,
        trainingCourses: evaluation.idp.trainingCourses,
        nonTrainingCourses: evaluation.idp.nonTrainingCourses,
        recommendation: evaluation.idp.recommendation
      }
    });
    
    // Update progress tracking
    const existing = await prisma.progressTracking.findUnique({
      where: {
        userId_competencyId: {
          userId: req.userId!,
          competencyId
        }
      }
    });
    
    if (existing) {
      await prisma.progressTracking.update({
        where: { id: existing.id },
        data: {
          assessmentCount: existing.assessmentCount + 1,
          latestScore: evaluation.score,
          improvementTrend: evaluation.score - existing.firstScore,
          lastAssessedAt: new Date()
        }
      });
    } else {
      await prisma.progressTracking.create({
        data: {
          userId: req.userId!,
          competencyId,
          firstScore: evaluation.score,
          latestScore: evaluation.score
        }
      });
    }
    
    // Update session
    await prisma.assessmentSession.update({
      where: { id: sessionId },
      data: {
        completedCount: { increment: 1 }
      }
    });
    
    res.json(evaluation);
  } catch (error) {
    console.error('Evaluation error:', error);
    res.status(500).json({ error: 'Evaluation failed' });
  }
});

// Generate voice feedback
router.post('/voice', authenticate, async (req: AuthRequest, res) => {
  try {
    const { text, language } = req.body;
    const voiceName = language === 'th' ? 'Kore' : 'Zephyr';
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });
    
    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
    res.json({ audioData });
  } catch (error) {
    console.error('Voice generation error:', error);
    if (isQuotaError(error)) {
      return res.status(200).json({ audioData: '' });
    }
    res.status(500).json({ error: 'Voice generation failed' });
  }
});

// Generate consolidated summary
router.post('/summary/consolidated', authenticate, async (req: AuthRequest, res) => {
  try {
    const { experienceYears, results, language } = req.body;
    
    const langText = language === 'th' ? 'Thai' : 'English';
    const summary = results.map((r: any) => 
      `Topic: ${r.competencyId}, Score: ${r.score}, Gap: ${r.gap}`
    ).join('\n');

    let summaryText = '';
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Acting as a Nursing Director, write a 3-sentence high-level summary for this nurse's global performance based on 11 topic IDPs.
                   Experience: ${experienceYears}y.
                   Summary Data:
                   ${summary}
                   Language: ${langText}.`,
      });

      summaryText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!summaryText) {
        throw new Error('Invalid response from AI model');
      }
    } catch (error) {
      if (isQuotaError(error)) {
        console.warn('Gemini quota exceeded during consolidated summary, using fallback summary');
        summaryText = getFallbackConsolidatedSummary(experienceYears, results, language);
      } else {
        throw error;
      }
    }
    
    res.json({ summary: summaryText });
  } catch (error) {
    console.error('Consolidated summary error:', error);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// Complete session
router.post('/session/complete', authenticate, async (req: AuthRequest, res) => {
  try {
    const { sessionId } = req.body;
    
    await prisma.assessmentSession.update({
      where: { id: sessionId },
      data: {
        status: 'completed',
        completedAt: new Date()
      }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Session complete error:', error);
    res.status(500).json({ error: 'Failed to complete session' });
  }
});

// Get session results
router.get('/session/:sessionId/results', authenticate, async (req: AuthRequest, res) => {
  try {
    const results = await prisma.assessmentResult.findMany({
      where: {
        sessionId: req.params.sessionId,
        userId: req.userId!
      },
      include: {
        responses: true,
        idpPlan: true
      }
    });
    
    res.json(results);
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ error: 'Failed to get results' });
  }
});

export default router;
