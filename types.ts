
export enum CompetencyCategory {
  FUNCTIONAL = 'Functional',
  SPECIFIC = 'Specific',
  MANAGERIAL = 'Managerial Competency'
}

export type Language = 'th' | 'en';

export interface User {
  username: string;
  experienceYears: number;
  level: number;
  standardScore: number;
}

export interface CompetencyItem {
  id: string;
  category: CompetencyCategory;
  name: {
    th: string;
    en: string;
  };
}

export interface Scenario {
  id: string;
  text: string;
  context: string;
}

export interface EvaluationResult {
  score: number;
  feedback: string;
  idp: IDP;
}

export interface AssessmentResult {
  competencyId: string;
  score: number;
  gap: number;
  userResponse: string;
  feedback: string;
  idp: IDP;
}

export interface IDP {
  trainingCourses: string[];
  nonTrainingCourses: string[];
  recommendation: string;
}
