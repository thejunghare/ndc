import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xyryzktizassrpdgicnh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cnl6a3RpemFzc3JwZGdpY25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0ODQzNDcsImV4cCI6MjA1OTA2MDM0N30.DTR4CxDafmkF6G8oLNJNvMRkHgBY8WI4p8RYgbxgvFQ';
export const supabase = createClient(supabaseUrl, supabaseKey);