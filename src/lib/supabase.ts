import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

// Açarlar yoxdursa tətbiq çökməsin deyə müvəqqəti dəyərlər; AuthGate bu halda quraşdırma ekranını göstərir.
export const supabase = createClient(url || "http://localhost", anonKey || "missing-key");
