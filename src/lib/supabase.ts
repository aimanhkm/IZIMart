import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://supabasekong-ekco8scw0kw8400gw88os4c4.119.28.100.35.sslip.io';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3MjQ0MDUwMCwiZXhwIjo0OTI4MTE0MTAwLCJyb2xlIjoiYW5vbiJ9.HbhNjeSP-t_zjo3vU6h3VmwtaHnAiX1T3yGJYFLswLw';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
