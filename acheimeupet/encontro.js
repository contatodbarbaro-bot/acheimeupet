// =============================
// AcheiMeuPet — Encontro (Front)
// =============================

// ✅ URL oficial da API (App da Web - CORRIGIDA)
// A URL correta para execução do App da Web é a que termina em /exec ou /echo.
const API_URL = "https://script.google.com/macros/s/AKfycbxsZs-E-vKCELEQShvFR6GEewmUM8S__GmwztyuVFA81tczCw8TQizgA77gwFtvTzFg/exec";

// 🔧 Função auxiliar para chamadas JSONP (resolve bloqueio de CORS  )
function jsonp(url) {
  return new Promise((resolve, reject) => {
    const cb = "__jsonp_cb_" + Date.now() + "_" + Math.floor(Math.random() * 1e6);
    const script = document.createElement("script");
    window[cb] = (data) => {
      try { resolve(data); } finally {
        delete window[cb];
        script.remove();
      }
    };
    script.onerror = () => {
      delete window[cb];
      script.remove();
      reject(new Error("Falha ao carregar JSONP"));
    };
    // Note que a chamada agora usa '?' para o primeiro parâmetro se não houver nenhum,
    // ou '&' se já houver. Como a URL do Apps Script não tem '?',
    // vamos garantir que o primeiro parâmetro seja '?'
    const sep = url.includes("?") ? "&" : "?";
    script.src = `${url}${sep}callback=${cb}`;
    document.body.appendChild(script);
  });
}

// 🧩 Captura o parâmetro "id" da URL
function getParam(name) {
  const u = new URL(window.location.href);
  return u.searchParams.get(name);
}

// 🔍 Busca os dados do pet na API
async function buscarDadosPet() {
  const id = getParam("id");
  if (!id) {
    alert("ID do pet não informado.");
    return;
  }

  try {
    // Chamada corrigida para usar '?' para o primeiro parâmetro de busca
    // e enviando o 'id' como parâmetro 'id' (que o Apps Script corrigido aceita).
    const data = await jsonp(`${API_URL}?id=${encodeURIComponent(id)}`);
    console.log("📡 Resposta da API:", data);

    if (!data || data.status !== "sucesso") {
      throw new Error(data && data.mensagem ? data.mensagem : "Erro desconhecido");
    }

    preencherFicha(data.pet);
  } catch (e) {
    console.error("❌ Erro ao carregar informações:", e);
    alert("Erro ao carregar informações do pet.");
  }
}

// 🐾 Preenche as informações na ficha
function preencherFicha(pet) {
  const el = (id) => document.getElementById(id);
  if (el("sp_especie")) el("sp_especie").textContent = pet.especie || "-";
  if (el("sp_raca"))    el("sp_raca").textContent    = pet.raca || "-";
  if (el("sp_sexo"))    el("sp_sexo").textContent    = pet.sexo || "-";
  if (el("sp_tutor"))   el("sp_tutor").textContent   = pet.nome_tutor || "-";
  if (el("sp_cidade"))  el("sp_cidade").textContent  = pet.cidade || "-";
}

// 🚀 Executa automaticamente ao abrir a página
document.addEventListener("DOMContentLoaded", buscarDadosPet);
