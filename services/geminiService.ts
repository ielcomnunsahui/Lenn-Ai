/**
 * Gemini Service - Secure Edge Function Proxy
 * 
 * SECURITY ARCHITECTURE:
 * - NO direct Gemini API calls from browser
 * - All requests go through Supabase Edge Functions
 * - API key stored server-side only
 * - Edge Functions handle authentication and rate limiting
 * 
 * MIGRATION NOTES:
 * - Old: Direct GoogleGenAI client in browser (INSECURE)
 * - New: Fetch calls to Edge Functions (SECURE)
 */

import { supabase } from './supabaseClient';
import { SubjectArea, Question, LecturerNotes, LessonPlan, QuestionBank } from "../types";

export class GeminiService {
  private async callEdgeFunction(functionName: string, payload: any): Promise<any> {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload
    });

    if (error) {
      console.error(`Edge Function ${functionName} error:`, error);
      throw new Error(error.message || `Failed to call ${functionName}`);
    }

    return data;
  }

  // ============================================
  // LECTURER METHODS
  // ============================================

  async generateLecturerNotes(topic: string, depth: 'summary' | 'detailed'): Promise<LecturerNotes> {
    return this.callEdgeFunction('gemini-lecturer', {
      action: 'notes',
      topic,
      depth
    });
  }

  async generateLessonPlan(topic: string): Promise<LessonPlan> {
    return this.callEdgeFunction('gemini-lecturer', {
      action: 'lesson-plan',
      topic
    });
  }

  async generateLecturerQuestionBank(topic: string): Promise<QuestionBank> {
    return this.callEdgeFunction('gemini-lecturer', {
      action: 'question-bank',
      topic
    });
  }

  // ============================================
  // MATERIAL LAB METHODS
  // ============================================

  async analyzeMaterial(fileData: { mimeType: string, data: string }): Promise<any> {
    return this.callEdgeFunction('gemini-material', {
      mimeType: fileData.mimeType,
      data: fileData.data
    });
  }

  // ============================================
  // CHAT METHODS
  // ============================================

  async chatQuery(text: string, history: any[] = []): Promise<any> {
    return this.callEdgeFunction('gemini-chat', {
      text,
      history
    });
  }

  async processUnifiedQuery(text: string, fileData?: { mimeType: string, data: string }): Promise<any> {
    if (fileData) return this.analyzeMaterial(fileData);
    return this.chatQuery(text);
  }

  // ============================================
  // PRACTICE QUIZ METHODS
  // ============================================

  async generateQuestions(topic: string, level: string, subject: string): Promise<Question[]> {
    // Use chat endpoint for question generation
    const result = await this.callEdgeFunction('gemini-chat', {
      text: `Generate 5 ${level} NCLEX-style questions about ${topic} (${subject}).`,
      history: []
    });

    // Extract practice questions from response
    return result.practiceQuestions || [];
  }

  async generateExamOutline(topic: string): Promise<any> {
    const result = await this.callEdgeFunction('gemini-chat', {
      text: `High-yield nursing exam outline for: ${topic}.`,
      history: []
    });

    return {
      topic: result.topicTitle || topic,
      subject: result.subject || 'Nursing',
      outlinePoints: result.keyConcepts || []
    };
  }

  // ============================================
  // GAME METHODS
  // ============================================

  async generatePathGame(subject: SubjectArea): Promise<any> {
    const result = await this.callEdgeFunction('gemini-chat', {
      text: `Generate a sequence game for ${subject}. Provide a title and 5-8 steps that need to be ordered correctly.`,
      history: []
    });

    // Transform response into game format
    return {
      title: result.topicTitle || `${subject} Sequence Challenge`,
      steps: result.keyConcepts?.map((concept: string, index: number) => ({
        id: `step-${index}`,
        text: concept,
        order: index
      })) || []
    };
  }

  async generateLabelGame(subject: SubjectArea): Promise<any> {
    const result = await this.callEdgeFunction('gemini-chat', {
      text: `Generate a labeling game for ${subject}. Provide 4 key anatomical or clinical parts with descriptions.`,
      history: []
    });

    return {
      title: result.topicTitle || `${subject} Labeling Challenge`,
      imageUrl: '', // Visual generation would need separate endpoint
      parts: result.keyConcepts?.slice(0, 4).map((concept: string, index: number) => ({
        id: `part-${index}`,
        label: concept,
        description: result.practiceQuestions?.[index]?.explanation || concept
      })) || []
    };
  }

  async generateVisual(prompt: string): Promise<string | null> {
    // Note: Image generation requires Gemini 2.5 Flash Image model
    // This would need a separate Edge Function endpoint
    // For now, return null to avoid breaking existing code
    console.warn('Visual generation not yet implemented via Edge Functions');
    return null;
  }
}

export const gemini = new GeminiService();