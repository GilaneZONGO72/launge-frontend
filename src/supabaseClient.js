import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nmmfwscjyctvkeiswhcs.supabase.co';
const supabaseKey = 'sb_publishable_xcvP0zVXeYCQJCPXOLQ5lw_xvbJRgmC';

export const supabase = createClient(supabaseUrl, supabaseKey);