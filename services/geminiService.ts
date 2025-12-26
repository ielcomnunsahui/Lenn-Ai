
import { GoogleGenAI, Type } from "@google/genai";
import { SubjectArea, Question, LecturerNotes, LessonPlan, QuestionBank } from "../types";

export class GeminiService {
  private get ai(): GoogleGenAI {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private getLecturerHubSystemInstruction() {
    return `You are Lennia, a high-level AI Teaching Assistant for nursing and medical science lecturers.
    Your goal is to assist educators in curriculum preparation and material synthesis.

    CORE TASKS:
    1. ARchitect teaching-friendly notes (Summary or Deep-Dive).
    2. Generate NCLEX-style large question banks (MCQs, Short-Answer, Case Studies).
    3. Design structured lesson plans with timed activities.
    4. Provide logical slide deck outlines with visual descriptions.

    BEHAVIOR:
    - Maintain absolute medical accuracy and subject fidelity.
    - Format content to be classroom-ready.
    - Focus on student engagement and high-yield examination requirements.`;
  }

  // Lecturer Methods
  async generateLecturerNotes(topic: string, depth: 'summary' | 'detailed'): Promise<LecturerNotes> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate ${depth} teaching notes for the topic: ${topic}.`,
      config: {
        systemInstruction: this.getLecturerHubSystemInstruction(),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            depth: { type: Type.STRING },
            keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
            clinicalPearls: { type: Type.ARRAY, items: { type: Type.STRING } },
            diagramDescriptions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['title', 'content', 'depth', 'keyConcepts', 'clinicalPearls', 'diagramDescriptions']
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }

  async generateLessonPlan(topic: string): Promise<LessonPlan> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Design a comprehensive lesson plan for: ${topic}.`,
      config: {
        systemInstruction: this.getLecturerHubSystemInstruction(),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            duration: { type: Type.STRING },
            objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
            structure: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  activity: { type: Type.STRING },
                  method: { type: Type.STRING }
                }
              }
            },
            groupActivities: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['title', 'duration', 'objectives', 'structure', 'groupActivities']
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }

  async generateLecturerQuestionBank(topic: string): Promise<QuestionBank> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a large, diverse question bank for: ${topic}. Include MCQs, Short Answers, and a Case Study.`,
      config: {
        systemInstruction: this.getLecturerHubSystemInstruction(),
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            mcqs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                  difficulty: { type: Type.STRING }
                }
              }
            },
            shortAnswers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING },
                  rationale: { type: Type.STRING }
                }
              }
            },
            caseStudies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  scenario: { type: Type.STRING },
                  questions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  answers: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }

  // Existing methods ...
  private getMaterialLabSystemInstruction() {
    return `You are Lennai, an AI Learning Assistant for nursing and health science students.
    SECTION: MATERIAL UPLOAD (DOCUMENT ANALYSIS)

    PURPOSE:
    Strictly for analyzing educational materials (PDFs, Images, Documents) and generating study aids.

    BEHAVIOR RULES:
    1. Treat the uploaded file as the ONLY source of context. Analyze content thoroughly.
    2. Identify the subject and stay strictly within it.
    3. NO chat-style interaction in this section.
    4. MULTIMODAL CAPABILITY: Analyze images (diagrams, scans, labels) and documents fully.

    STUDY AID GENERATION:
    - Automatically generate educational SLIDES (3-6 bullets each, title, image description).
    - Automatically generate FLASHCARDS (Q/A format for exam prep).

    OUTPUT STRUCTURE (MANDATORY ORDER):
    - Topic Title
    - Simple Explanation
    - Key Points
    - Visual Guide Description
    - Exam Focus
    - Practice Questions (NCLEX-style)
    - Slides Section
    - Flashcards Section`;
  }

  private getChatbotSystemInstruction() {
    return `You are Lennai, an AI Learning Assistant for nursing and health science students.
    SECTION: CHATBOT (QUESTION-BASED LEARNING)

    PURPOSE:
    Strictly for typed questions and follow-ups.

    BEHAVIOR RULES:
    1. Treat the user's question as the learning topic.
    2. Automatically identify the subject and explain in simple language.
    3. Generate visual guide descriptions and practice questions.
    4. STUDY AIDS: Automatically generate concise SLIDES and Q/A FLASHCARDS based on the topic.

    OUTPUT STRUCTURE (MANDATORY ORDER):
    - Topic Title
    - Simple Explanation
    - Key Points
    - Visual Guide Description
    - Exam Focus
    - Practice Questions (NCLEX-style)
    - Slides Section
    - Flashcards Section`;
  }

  private enhanceImagePrompt(rawInput: string): string {
    return `
      [TASK]: Generate a medically accurate, professional-grade educational illustration.
      [CONTEXT]: Nursing students for clinical learning and NCLEX preparation.
      [REFERENCES]: High-fidelity anatomical accuracy (Gray's Anatomy/Netter's).
      [EVALUATION CRITERIA]: Clean, clinical style, white background, no artistic distortion.
      [CONTENT]: ${rawInput}
    `.trim();
  }

  private getCommonResponseSchema() {
    return {
      type: Type.OBJECT,
      properties: {
        topicTitle: { type: Type.STRING },
        simpleExplanation: { type: Type.STRING },
        keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
        visualGuide: { type: Type.STRING },
        examFocus: { type: Type.STRING },
        practiceQuestions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ['id', 'text', 'options', 'correctAnswer', 'explanation']
          }
        },
        slides: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
              imageDescription: { type: Type.STRING },
              notes: { type: Type.STRING }
            },
            required: ['title', 'bullets', 'imageDescription']
          }
        },
        flashcards: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING },
              back: { type: Type.STRING }
            },
            required: ['front', 'back']
          }
        },
        subject: { type: Type.STRING }
      },
      required: ['topicTitle', 'simpleExplanation', 'keyConcepts', 'visualGuide', 'examFocus', 'practiceQuestions', 'subject', 'slides', 'flashcards']
    };
  }

  async analyzeMaterial(fileData: { mimeType: string, data: string }): Promise<any> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{
        parts: [
          { text: this.getMaterialLabSystemInstruction() },
          { text: "Analyze the uploaded clinical material thoroughly and generate study aids." },
          {
            inlineData: {
              mimeType: fileData.mimeType,
              data: fileData.data
            }
          }
        ]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: this.getCommonResponseSchema() as any
      }
    });

    return JSON.parse(response.text || '{}');
  }

  async chatQuery(text: string, history: any[] = []): Promise<any> {
    const historyParts = history.map(h => ({
      text: `${h.role === 'user' ? 'Student' : 'Lennai'}: ${h.content}`
    }));

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{
        parts: [
          { text: this.getChatbotSystemInstruction() },
          ...historyParts,
          { text: `Question: ${text}` }
        ]
      }],
      config: {
        responseMimeType: "application/json",
        responseSchema: this.getCommonResponseSchema() as any
      }
    });

    return JSON.parse(response.text || '{}');
  }

  async processUnifiedQuery(text: string, fileData?: { mimeType: string, data: string }): Promise<any> {
    if (fileData) return this.analyzeMaterial(fileData);
    return this.chatQuery(text);
  }

  async generateQuestions(topic: string, level: string, subject: string): Promise<Question[]> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 5 ${level} NCLEX-style questions about ${topic} (${subject}).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              text: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              difficulty: { type: Type.STRING }
            },
            required: ['id', 'text', 'options', 'correctAnswer', 'explanation', 'difficulty']
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  }

  async generateExamOutline(topic: string): Promise<any> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `High-yield nursing exam outline for: ${topic}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            subject: { type: Type.STRING },
            outlinePoints: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['topic', 'subject', 'outlinePoints']
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }

  async generatePathGame(subject: SubjectArea): Promise<any> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Sequence game for ${subject}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  text: { type: Type.STRING },
                  order: { type: Type.INTEGER }
                },
                required: ['id', 'text', 'order']
              }
            }
          },
          required: ['title', 'steps']
        }
      }
    });
    return JSON.parse(response.text || '{}');
  }

  async generateLabelGame(subject: SubjectArea): Promise<any> {
    const metadataResponse = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Labeling game for ${subject}. Provide 4 key parts and image prompt.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            imagePrompt: { type: Type.STRING },
            parts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ['id', 'label', 'description']
              }
            }
          },
          required: ['title', 'imagePrompt', 'parts']
        }
      }
    });

    const metadata = JSON.parse(metadataResponse.text || '{}');
    const imageUrl = await this.generateVisual(metadata.imagePrompt || metadata.title);

    return {
      title: metadata.title || 'Anatomical Labeling Challenge',
      imageUrl: imageUrl || '',
      parts: metadata.parts || []
    };
  }

  async generateVisual(prompt: string): Promise<string | null> {
    const enhancedPrompt = this.enhanceImagePrompt(prompt);

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: enhancedPrompt }]
      },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  }
}

export const gemini = new GeminiService();
