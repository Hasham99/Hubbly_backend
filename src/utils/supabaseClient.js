// utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,   // The URL of your Supabase project
  process.env.SUPABASE_KEY    // The public anon key of your Supabase project
);

export { supabase };
