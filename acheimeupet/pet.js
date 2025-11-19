// =============================================
//  AcheiMeuPet — pet.js (versão corrigida 18/11)
//  Consulta dados direto no Apps Script
//  Envia aviso completo ao Fiqon
// =============================================

// ===== ENDPOINTS =====
const API_PET =
  "https://script.google.com/macros/s/AKfycbz5pxePvVWe6zYI6hqIAXT1mMO0-0NNViyA2PfkFWvdsmD55bFBNT5tlwqxQdsOyEnq7w/exec";

const WEBHOOK_AVISO =
  "https://webhook.fiqon.app/webhook/a02b8e45-cd21-44e0-a619-be0e64fd9a4b/b9ae07d8-e7af-4b1f-9b1c-a22cc15fb9cd";


// === Obter ID do pet da URL ===
function obterIdPet() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// === Buscar dados do pet ===
async function buscarDadosPet(id_pet) {
  try {
    const url = `${API_PET}?id_pet=${encodeURIComponent(id_pet)}`;
    const resposta = await fetch(url);
    const json = await resposta.json();

    if (!json || json.status !== "sucesso" || !json.pet) {
      throw new Error(json?.mensagem || "Pet não encontrado");
    }

    return json.pet;

  } catch (e) {
    console.error("❌ Erro buscarDadosPet:", e);
    return null;
  }
}

// === Preencher interface ===
function preencherDadosPet(d) {
  const nomePet = d.nome_pet || "Pet não identificado";
  const nomeTutor = d.nome_tutor || "Tutor não identificado";

  document.getElementById("foto_pet").src =
    d.foto_pet || "https://cdn-icons-png.flaticon.com/512/616/616408.png";

  document.getElementById("nome_pet").textContent = nomePet;
  document.getElementById("nome_pet_label").textContent = nomePet;
  document.getElementById("especie_pet").textContent = d.especie || "-";
  document.getElementById("raca_pet").textContent = d.raca || "-";
  document.getElementById("sexo_pet").textContent = d.sexo || "-";
  document.getElementById("cidade_pet").textContent = d.cidade || "-";
  document.getElementById("nome_tutor").textContent = nomeTutor;

  // Forçar string no número do WhatsApp
  let numeroWhats = (d.whatsapp_tutor || "").toString().replace(/\D/g, "");

  document.getElementById("whatsapp_tutor").textContent =
    numeroWhats || "-";

  const btn = document.getElementById("btn_contato");

  if (!numeroWhats || numeroWhats.length < 10) {
    btn.style.display = "none";
  } else {
    const texto = `Olá! Encontrei o pet ${nomePet} através do AcheiMeuPet 🐾`;
    btn.href = `https://wa.me/55${numeroWhats}?text=${encodeURIComponent(texto)}`;
  }
}


// === Enviar aviso ao tutor via Fiqon ===
async function enviarAviso(formData) {
  try {
    const r = await fetch(WEBHOOK_AVISO, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const json = await r.json();
    return json;

  } catch (err) {
    console.error("❌ Erro ao enviar aviso:", err);
    return null;
  }
}



// === Execução ===
document.addEventListener("DOMContentLoaded", async () => {

  const id_pet = obterIdPet();

  if (!id_pet) {
    document.getElementById("conteudo-pet").innerHTML =
      `<p class="erro">❌ ID do pet não informado.</p>`;
    return;
  }

  const dados = await buscarDadosPet(id_pet);

  if (!dados) {
    document.getElementById("conteudo-pet").innerHTML =
      `<p class="erro">⚠️ Pet não encontrado.</p>`;
    return;
  }

  preencherDadosPet(dados);


  // CAPTURAR LOCALIZAÇÃO
  let latitude = null;
  let longitude = null;

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      },
      () => console.warn("Geolocalização negada.")
    );
  }

  // === Formulário “Avisar que encontrei” ===
  const form = document.getElementById("formAviso");
  const msgOk = document.getElementById("mensagem_sucesso");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      id_pet,

      nome_encontrador: document.getElementById("nome_encontrador").value.trim(),
      telefone_encontrador: document.getElementById("telefone_encontrador").value.trim(),
      observacoes: document.getElementById("observacoes").value.trim(),

      nome_pet: dados.nome_pet,
      nome_tutor: dados.nome_tutor,
      whatsapp_tutor: dados.whatsapp_tutor,
      email_tutor: dados.email_tutor,

      latitude,
      longitude,
    };

    const resp = await enviarAviso(payload);

    if (resp && (resp.ok || resp.success)) {
      msgOk.style.display = "block";
      setTimeout(() => (msgOk.style.display = "none"), 4000);
      form.reset();
    } else {
      alert("Não foi possível enviar o aviso ao tutor.");
    }
  });

});
