// =========================================================
// KILTIVE AI — Configuration Supabase
// Remplace les deux valeurs ci-dessous par celles de TON
// projet : Supabase > Project Settings > API
// =========================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const SUPABASE_URL = 'https://xoebdtbvcrotlvybhdka.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvZWJkdGJ2Y3JvdGx2eWJoZGthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NDI2MjksImV4cCI6MjEwMDExODYyOX0.YIaUyHwANL8zitCM_-95Jj9DbtP3U-Xyys-WKCxX-Vo';

export const sb = createClient("https://xoebdtbvcrotlvybhdka.supabase.co", 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvZWJkdGJ2Y3JvdGx2eWJoZGthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1NDI2MjksImV4cCI6MjEwMDExODYyOX0.YIaUyHwANL8zitCM_-95Jj9DbtP3U-Xyys-WKCxX-Vo');
