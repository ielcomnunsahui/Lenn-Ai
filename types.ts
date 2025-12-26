
export enum SubjectArea {
  ANATOMY = 'Anatomy',
  PHYSIOLOGY = 'Physiology',
  EMBRYOLOGY = 'Embryology',
  MED_SURG = 'Medical-Surgical Nursing',
  PHARMACOLOGY = 'Pharmacology',
  PHC = 'Primary Health Care',
  OTHER = 'Other Nursing Science'
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  course?: string;
  school: string;
  role?: 'student' | 'lecturer';
  department?: string;
  state?: string;
  country?: string;
  passwordHash?: string;
  created_at: string;
}

export interface DB_User extends User {
  password_hash: string;
}

export interface StoredChat {
  chat_id: string;
  user_id: string;
  message: string;
  sender: 'user' | 'ai';
  timestamp: string;
  subject?: string;
  metadata?: any;
}

export interface Slide {
  title: string;
  bullets: string[];
  imageDescription: string;
  notes?: string;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface Topic {
  id: string;
  title: string;
  difficulty: string;
  plainExplanation: string;
  stepByStep: string[];
  keyPoints: string[];
  mnemonics: string[];
  examTips: string[];
  clinicalRelevance: string;
  nursingImplications: string[];
  visualTriggers: string[];
  slides?: Slide[];
  flashcards?: Flashcard[];
}

export interface LessonPlan {
  title: string;
  duration: string;
  objectives: string[];
  structure: {
    time: string;
    activity: string;
    method: string;
  }[];
  groupActivities: string[];
}

export interface LecturerNotes {
  title: string;
  content: string;
  depth: 'summary' | 'detailed';
  keyConcepts: string[];
  clinicalPearls: string[];
  diagramDescriptions: string[];
}

export interface QuestionBank {
  topic: string;
  mcqs: Question[];
  shortAnswers: { question: string; answer: string; rationale: string }[];
  caseStudies: { scenario: string; questions: string[]; answers: string[] }[];
}

export interface Material {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'image' | 'text';
  uploadDate: Date;
  summary?: string;
  topics: Topic[];
  subject: SubjectArea;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'tutor';
  content: string;
  subject?: SubjectArea;
  visualUrl?: string;
  practiceQuestions?: Question[];
  slides?: Slide[];
  flashcards?: Flashcard[];
  simpleExplanation?: string;
  keyPoints?: string[];
  topicName?: string;
  attachment?: {
    name: string;
    type: string;
    data?: string;
  };
}

export interface PathStep {
  id: string;
  text: string;
  order: number;
}

export interface LabeledPart {
  id: string;
  label: string;
  description: string;
}
