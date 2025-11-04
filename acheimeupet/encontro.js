// =============================
// AcheiMeuPet — Encontro (Front)
// =============================

// ✅ URL oficial da API (App da Web - VINCULADA E CORRIGIDA)
const API_URL = "https://script.google.com/macros/s/AKfycbz5pxePvVWe6zYI6hqIAXT1mMO0-0NNViyA2PfkFWvdsmD55bFBNT5tlwqxQdsOyEnq7w/exec";

// 🔧 Função auxiliar para chamadas JSONP (resolve bloqueio de CORS)
function jsonp(url) {
  return new Promise((resolve, reject) => {
    const cb = "__jsonp_cb_" + Date.now() + "_" + Math.floor(Math.random() * 1e6);
    const script = document.createElement("script");
    window[cb] = (data) => {
      try {
        resolve(data);
      } finally {
        delete window[cb];
        script.remove();
      }
    };
    script.onerror = () => {
      delete window[cb];
      script.remove();
      reject(new Error("Falha ao carregar JSONP"));
    };
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
  document.getElementById("nomePet").textContent = pet.nome_pet || "Pet encontrado!";
  document.getElementById("especiePet").textContent = pet.especie || "-";
  document.getElementById("racaPet").textContent = pet.raca || "-";
  document.getElementById("sexoPet").textContent = pet.sexo || "-";
  document.getElementById("tutorPet").textContent = pet.nome_tutor || "-";
  document.getElementById("cidadePet").textContent = pet.cidade || "-";

  // Atualiza a foto se houver
  if (pet.foto_pet && pet.foto_pet.startsWith("http")) {
    document.getElementById("fotoPet").src = pet.foto_pet;
  }
}

// 🚀 Executa automaticamente ao abrir a página
document.addEventListener("DOMContentLoaded", buscarDadosPet);
