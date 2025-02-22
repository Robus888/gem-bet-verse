
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zfvnjdtajjdlqbjjzavh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpmdm5qZHRhampkbHFiamp6YXZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxNzI1NzYsImV4cCI6MjA1Mjc0ODU3Nn0.6I8-2yiILPzgfBcJ2vEKlxApf22Ckom21kZFwABT7s8';

export const supabase = createClient(supabaseUrl, supabaseKey);
