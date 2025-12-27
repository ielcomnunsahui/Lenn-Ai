import { createClient } from '@supabase/supabase-js';

// Credentials provided by the architect
const supabaseUrl = 'https://nmbtdkeoqsxmlymmhron.supabase.co';
const supabaseAnonKey = 'sb_publishable_xzNhmRqNxFtlYiq89IzojQ__TetPPZP';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);