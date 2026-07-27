// =========================================================
// KILTIVE AI — Configuration Supabase
// Remplace les deux valeurs ci-dessous par celles de TON
// projet : Supabase > Project Settings > API
// =========================================================
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export const SUPABASE_URL = 'https://TON-PROJET.supabase.co';
export const SUPABASE_ANON_KEY = 'TA_CLE_ANON_PUBLIC';

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
