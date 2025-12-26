import { User, ChatMessage } from '../types.ts';
import { supabase } from './supabaseClient.ts';

class StorageService {
  // Authentication
  async register(userData: any): Promise<{ success: boolean; error?: string }> {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          fullName: userData.fullName,
          role: userData.role || 'student',
          school: userData.school,
          course: userData.course
        }
      }
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      console.error("Profile fetch error:", profileError);
      return { success: false, error: 'Your profile is being initialized. Please try logging in again in a moment.' };
    }

    return {
      success: true,
      user: {
        id: profile.id,
        fullName: profile.full_name,
        email: profile.email,
        role: profile.role as any,
        school: profile.school,
        course: profile.course,
        created_at: profile.created_at
      }
    };
  }

  async logout() { await supabase.auth.signOut(); }

  async getActiveUser(): Promise<User | null> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    const { data: p, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    if (error || !p) return null;
    
    return { 
      id: p.id, 
      fullName: p.full_name, 
      email: p.email, 
      role: p.role as any, 
      school: p.school, 
      course: p.course, 
      created_at: p.created_at 
    };
  }

  // Session Persistence
  async createSession(userId: string, title: string, subject?: string) {
    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ user_id: userId, title, subject })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async getSessions(userId: string) {
    const { data } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return data || [];
  }

  async saveMessage(sessionId: string, userId: string, msg: string, sender: 'user' | 'ai', metadata: any = {}) {
    await supabase.from('chat_messages').insert({
      session_id: sessionId,
      user_id: userId,
      message: msg,
      sender,
      metadata
    });
  }

  async getSessionHistory(sessionId: string): Promise<ChatMessage[]> {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('timestamp', { ascending: true });

    return (data || []).map(m => ({
      id: m.id,
      role: m.sender === 'user' ? 'user' : 'tutor',
      content: m.message,
      ...(m.metadata || {})
    }));
  }

  // Materials Storage
  async uploadMaterial(userId: string, file: File): Promise<string | null> {
    const filePath = `${userId}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from('materials')
      .upload(filePath, file);

    if (error) return null;
    const { data: urlData } = supabase.storage.from('materials').getPublicUrl(data.path);
    return urlData.publicUrl;
  }
}

export const storage = new StorageService();