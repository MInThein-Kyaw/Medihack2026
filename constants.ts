
import { CompetencyCategory, CompetencyItem, Language } from './types';

export const COMPETENCIES: CompetencyItem[] = [
  // Functional (2)
  { id: 'f1', category: CompetencyCategory.FUNCTIONAL, name: { th: 'จิตสำนึกการให้บริการ (Service Mind)', en: 'Service Mind' } },
  { id: 'f2', category: CompetencyCategory.FUNCTIONAL, name: { th: 'การแก้ไขปัญหาและการตัดสินใจ (Problem Solving)', en: 'Problem Solving & Decision Making' } },
  // Specific (2)
  { id: 's1', category: CompetencyCategory.SPECIFIC, name: { th: 'การจัดการความเสี่ยงทางคลินิก', en: 'Clinical Risk Management' } },
  { id: 's2', category: CompetencyCategory.SPECIFIC, name: { th: 'การพยาบาลผู้ป่วยวิกฤต', en: 'Critical Care Nursing' } },
  // Managerial (2)
  { id: 'm1', category: CompetencyCategory.MANAGERIAL, name: { th: 'ความเป็นผู้นำ (Leadership)', en: 'Leadership' } },
  { id: 'm2', category: CompetencyCategory.MANAGERIAL, name: { th: 'ศักยภาพเพื่อนำการเปลี่ยนแปลง (Change Management)', en: 'Change Management' } },
];

export const getLevelData = (years: number) => {
  if (years <= 1) return { level: 1, standardScore: 1 };
  if (years <= 2) return { level: 2, standardScore: 1 };
  if (years <= 3) return { level: 3, standardScore: 2 };
  if (years <= 5) return { level: 4, standardScore: 3 };
  return { level: 5, standardScore: 4 };
};

export const TRANSLATIONS: Record<Language, any> = {
  th: {
    title: 'ระบบประเมินสมรรถนะพยาบาล',
    subtitle: 'ประเมินด้วย AI Avatar พร้อมระบบโต้ตอบด้วยเสียง',
    username: 'ชื่อผู้ใช้งาน',
    password: 'รหัสผ่าน',
    experience: 'อายุงาน (ปี)',
    startBtn: 'เริ่มการประเมิน',
    nurseProfile: 'โปรไฟล์พยาบาล',
    expLevel: 'ระดับประสบการณ์',
    stdScore: 'คะแนนมาตรฐาน',
    topics: 'หัวข้อการประเมิน',
    comparison: 'เปรียบเทียบสมรรถนะ',
    reportBtn: 'สร้างรายงานแผนพัฒนา (IDP)',
    score: 'คะแนน',
    gap: 'ส่วนต่าง',
    dashboardHint: 'ทำแบบประเมินให้ครบถ้วนเพื่อวิเคราะห์ผลและรับแผนพัฒนาส่วนบุคคล',
    preparing: 'กำลังเตรียมชุดคำถาม...',
    questionCount: 'คำถามที่',
    of: 'จาก',
    progress: 'ความคืบหน้า',
    idpTitle: 'แผนการพัฒนาบุคลากรรายบุคคล',
    idpSubtitle: 'รายงานผลการประเมินและแผนพัฒนา',
    trainingTitle: 'หลักสูตรฝึกอบรม (Formal Training)',
    nonTrainingTitle: 'การเรียนรู้เชิงปฏิบัติ (On-the-job Learning)',
    recommendationTitle: 'ข้อเสนอแนะจากหัวหน้างาน AI',
    printBtn: 'ดาวน์โหลดรายงาน PDF',
    speaking: 'พยาบาล AI กำลังพูด...',
    listening: 'กำลังรอฟังคำตอบของคุณ...',
    correct: 'ถูกต้องค่ะ',
    thankYou: 'ขอบคุณสำหรับคำตอบค่ะ',
    finished: 'การประเมินเสร็จสิ้นแล้วค่ะ ผลคะแนนของคุณคือ',
    greet: (name: string, topic: string) => `สวัสดีคุณ ${name}, เรามาเริ่มการประเมินหัวข้อ ${topic} กันนะคะ ข้อที่ 1 ค่ะ`,
    voiceMode: 'โหมดเสียง',
    textMode: 'โหมดพิมพ์',
    typePlaceholder: 'พิมพ์คำตอบของคุณที่นี่...',
    submitBtn: 'ส่งคำตอบ',
    introGreeting: (name: string) => `สวัสดีค่ะคุณ ${name} ยินดีต้อนรับเข้าสู่ระบบประเมินสมรรถนะอัจฉริยะ ดิฉันคือหัวหน้างาน AI ที่จะพาคุณไปสำรวจทักษะและความสามารถระดับมืออาชีพของคุณในวันนี้ คุณพร้อมที่จะเริ่มต้นหรือยังคะ?`,
    enterDashboard: 'เข้าสู่หน้าหลัก'
  },
  en: {
    title: 'Nurse Competency Assessment',
    subtitle: 'AI Avatar Voice Chat Assessment System',
    username: 'Username',
    password: 'Password',
    experience: 'Experience (Years)',
    startBtn: 'Start Assessment',
    nurseProfile: 'Nurse Profile',
    expLevel: 'Experience Level',
    stdScore: 'Standard Score',
    topics: 'Assessment Topics',
    comparison: 'Competency Comparison',
    reportBtn: 'Generate IDP Report',
    score: 'Score',
    gap: 'Gap',
    dashboardHint: 'Complete all assessments to see gap analysis and get your development plan.',
    preparing: 'Preparing assessment questions...',
    questionCount: 'Question',
    of: 'of',
    progress: 'Progress',
    idpTitle: 'Individual Development Plan',
    idpSubtitle: 'Assessment Results & Development Report',
    trainingTitle: 'Formal Training Courses',
    nonTrainingTitle: 'Non-Training / On-the-job Learning',
    recommendationTitle: 'AI Supervisor Recommendations',
    printBtn: 'Download PDF Report',
    speaking: 'Nurse AI is speaking...',
    listening: 'Waiting for your answer...',
    correct: 'Correct!',
    thankYou: 'Thank you for your answer.',
    finished: 'The assessment is complete. Your score is',
    greet: (name: string, topic: string) => `Hello ${name}, let's start the assessment on ${topic}. Question number 1:`,
    voiceMode: 'Voice Mode',
    textMode: 'Text Mode',
    typePlaceholder: 'Type your response here...',
    submitBtn: 'Submit Response',
    introGreeting: (name: string) => `Hello ${name}. Welcome to your professional audit session. I am your AI Supervisor. Today, we will evaluate your clinical and managerial competencies to build your personalized development plan. Are you ready to begin?`,
    enterDashboard: 'Enter Dashboard'
  }
};
