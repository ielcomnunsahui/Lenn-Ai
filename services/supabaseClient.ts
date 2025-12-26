import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Credentials provided by the architect
const supabaseUrl = 'https://nmbtdkeoqsxmlymmhron.supabase.co';
const supabaseAnonKey = 'sb_publishable_xzNhmRqNxFtlYiq89IzojQ__TetPPZP';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);