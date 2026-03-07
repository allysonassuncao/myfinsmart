import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://numlrugovibpdnetmago.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51bWxydWdvdmlicGRuZXRtYWdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzODQ3ODcsImV4cCI6MjA1NDk2MDc4N30.DxXmNdw7u2_zPzahZp4KocJpJ0Qm54HsUysKQLnrk-M';

export const supabase = createClient(supabaseUrl, supabaseKey);