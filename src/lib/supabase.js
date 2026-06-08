// src/lib/supabase.js
// Inisialisasi Supabase client untuk ARLearn

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error('❌ VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY wajib diisi di file .env');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
