// supabase-config.js - Versão Corrigida e Padronizada
const SUPABASE_URL = "https://rhazoefykocooyjtcqen.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoYXpvZWZ5a29jb295anRjcWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0OTcyNDAsImV4cCI6MjA4MjA3MzI0MH0.FyEo7rsk65NExmGCJPZ-PGSJmtD2vwxwtZKILBDWH4M"; // Certifique-se de que esta chave está correta

// Verifica se a instância já existe no objeto window para evitar erro de redeclaração
if (typeof window.supabaseClient === 'undefined') {
    // Usamos window.supabaseClient para evitar conflito com o nome da biblioteca 'supabase' da CDN
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log("✅ Cliente Supabase inicializado com sucesso.");
}

// Mantemos um alias 'supabase' apenas se ele não existir, para compatibilidade com scripts antigos
if (typeof window.supabase === 'object' && typeof window.supabase.from !== 'function') {
    window.supabase = window.supabaseClient;
} else if (typeof window.supabase === 'undefined') {
    window.supabase = window.supabaseClient;
}

