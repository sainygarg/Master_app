import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.SUPABASE_URL || 
  'https://cagibmportrxcvoerutv.supabase.co';

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.VITE_ANON_KEY || 
  import.meta.env.ANON_KEY || 
  'sb_publishable_1Tp9ddXydm2FEE-YNdqUcA_7Adibzrd';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;

