import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fdpvynrowliusyvrehwr.supabase.co';
const supabaseKey = 'sb_publishable_ZRcqvLcvvPshDyL8bZcKeQ_A9iukhM2';

export const supabase = createClient(supabaseUrl, supabaseKey);
