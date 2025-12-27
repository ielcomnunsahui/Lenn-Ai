/**
 * Supabase Edge Function: gemini-lecturer
 * 
 * PURPOSE: Secure proxy for Gemini API lecturer features
 * SECURITY: API key stored server-side, never exposed to browser
 * 
 * Deploy: supabase functions deploy gemini-lecturer
 * Set secret: supabase secrets set GEMINI_API_KEY=your-key-here
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { GoogleGenAI, Type } from 'npm:@google/genai@1.3.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get Gemini API key from environment (server-side only)
    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured in Edge Function secrets');
    }

    // Parse request body
    const { action, topic, depth } = await req.json();

    if (!action || !topic) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: action, topic' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Gemini AI
    const ai = new GoogleGenAI({ apiKey });

    // System instruction for lecturer hub
    const systemInstruction = `You are Lennia, a high-level AI Teaching Assistant for nursing and medical science lecturers.
    Your goal is to assist educators in curriculum preparation and material synthesis.

    CORE TASKS:
    1. Architect teaching-friendly notes (Summary or Deep-Dive).
    2. Generate NCLEX-style large question banks (MCQs, Short-Answer, Case Studies).
    3. Design structured lesson plans with timed activities.
    4. Provide logical slide deck outlines with visual descriptions.

    BEHAVIOR:
    - Maintain absolute medical accuracy and subject fidelity.
    - Format content to be classroom-ready.
    - Focus on student engagement and high-yield examination requirements.`;

    let response;
    let responseSchema;

    // Handle different lecturer actions
    switch (action) {
      case 'notes':
        responseSchema = {
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
        };

        response = await ai.models.generateContent({
          model: 'gemini-2.0-flash-exp',
          contents: `Generate ${depth || 'detailed'} teaching notes for the topic: ${topic}.`,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: responseSchema as any
          }
        });
        break;

      case 'lesson-plan':
        responseSchema = {
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
        };

        response = await ai.models.generateContent({
          model: 'gemini-2.0-flash-exp',
          contents: `Design a comprehensive lesson plan for: ${topic}.`,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: responseSchema as any
          }
        });
        break;

      case 'question-bank':
        responseSchema = {
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
        };

        response = await ai.models.generateContent({
          model: 'gemini-2.0-flash-exp',
          contents: `Generate a large, diverse question bank for: ${topic}. Include MCQs, Short Answers, and a Case Study.`,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: responseSchema as any
          }
        });
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action. Must be: notes, lesson-plan, or question-bank' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    const result = JSON.parse(response.text || '{}');

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge Function Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});