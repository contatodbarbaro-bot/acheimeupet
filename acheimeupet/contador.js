import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseUrl = "https://rhazoefykocooyjtcqen.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoYXpvZWZ5a29jb295anRjcWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0OTcyNDAsImV4cCI6MjA4MjA3MzI0MH0.FyEo7rsk65NExmGCJPZ-PGSJmtD2vwxwtZKILBDWH4M";

const supabase = createClient(supabaseUrl, supabaseKey);

async function atualizarContadores() {
  const { count: adocao, error: erroAdocao } = await supabase
    .from("pets_ong_cadastro")
    .select("id", { count: "exact", head: true });

  const { count: adotados, error: erroAdotados } = await supabase
    .from("pets_ong_adotados")
    .select("id", { count: "exact", head: true });

  if (erroAdocao || erroAdotados) {
    console.error("Erro ao buscar contadores:", erroAdocao || erroAdotados);
    return;
  }

  const adocaoEl = document.getElementById("qtd-adocao");
  const adotadosEl = document.getElementById("qtd-adotados");

  if (adocaoEl) adocaoEl.innerText = adocao || 0;
  if (adotadosEl) adotadosEl.innerText = adotados || 0;
}

// Busca inicial
atualizarContadores();

// Atualização em tempo real
supabase
  .channel("realtime-pets")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "pets_ong_cadastro" },
    atualizarContadores
  )
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "pets_ong_adotados" },
    atualizarContadores
  )
  .subscribe();
