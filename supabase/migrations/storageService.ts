import { User, StoredChat } from '../types';
import { supabase } from './supabaseClient';

class StorageService {
  // Auth Actions
  async register(userData: any): Promise<{ success: boolean; error?: string }> {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          fullName: userData.fullName,
          role: userData.role,
          school: userData.school,
          course: userData.course
        }
      }
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  }

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { success: false, error: error.message };

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) return { success: false, error: profileError.message };

    // Map DB profile to UI User type
    const mappedUser: User = {
      id: profile.id,
      fullName: profile.full_name,
      email: profile.email,
      role: profile.role,
      school: profile.school,
      course: profile.course,
      created_at: profile.created_at
    };

    return { success: true, user: mappedUser };
  }

  async logout() {
    await supabase.auth.signOut();
  }

  async getActiveUser(): Promise<User | null> {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (!session || sessionError) return null;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) return null;

    return {
      id: profile.id,
      fullName: profile.full_name,
      email: profile.email,
      role: profile.role,
      school: profile.school,
      course: profile.course,
      created_at: profile.created_at
    };
  }

  // Chat Actions
  async saveChatMessage(userId: string, message: string, sender: 'user' | 'ai', subject?: string, metadata?: any) {
    const { error } = await supabase
      .from('chats')
      .insert({
        user_id: userId,
        message,
        sender,
        subject,
        metadata,
        timestamp: new Date().toISOString()
      });
    
    if (error) console.error("Error saving chat:", error);
  }

  async getUserChatHistory(userId: string): Promise<StoredChat[]> {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error("Error fetching history:", error);
      return [];
    }

    return (data || []).map(row => ({
      chat_id: row.id,
      user_id: row.user_id,
      message: row.message,
      sender: row.sender as 'user' | 'ai',
      timestamp: row.timestamp,
      subject: row.subject,
      metadata: row.metadata
    }));
  }

  async deleteLastTurn(userId: string) {
    // Fetch last 2 messages (User + AI) and delete them
    const { data, error: fetchError } = await supabase
      .from('chats')
      .select('id')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(2);

    if (fetchError || !data) return;

    const ids = data.map(d => d.id);
    const { error: deleteError } = await supabase
      .from('chats')
      .delete()
      .in('id', ids);

    if (deleteError) console.error("Error deleting turn:", deleteError);
  }

  // Storage Actions (Example for file uploads)
  async uploadMaterial(userId: string, file: File): Promise<string | null> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('materials')
      .upload(filePath, file);

    if (uploadError) return null;

    const { data } = supabase.storage.from('materials').getPublicUrl(filePath);
    return data.publicUrl;
  }
}

export const storage = new StorageService();