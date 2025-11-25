// =============================================
//  AcheiMeuPet — pet.js (versão corrigida 19/11)
//  Consulta dados direto no Apps Script
//  Envia aviso completo ao Fiqon (Encontro_Pet_fluxo)
// =============================================

// ===== ENDPOINTS =====
const API_PET =
  "https://script.google.com/macros/s/AKfycbz5pxePvVWe6zYI6hqIAXT1mMO0-0NNViyA2PfkFWvdsmD55bFBNT5tlwqxQdsOyEnq7w/exec";

const WEBHOOK_AVISO =
  "https://webhook.fiqon.app/webhook/a02b8e45-cd21-44e0-a619-be0e64fd9a4b/b9ae07d8-e7af-4b1f-9b1c-a22cc15fb9cd";


// === Obter ID do pet da URL ===
function obterIdPet() {
  const params = new URLSearchParams(window.location.search);
  // O ID é passado na URL como '?id=PXXXX', então buscamos por 'id'
  return params.get("id");
}

// === Buscar dados do pet ===
async function buscarDadosPet(id_pet) {
  try {
    // CORREÇÃO: O Apps Script (codigo.gs) espera o parâmetro 'id' ou 'id_pet'.
    // O código original estava enviando 'id_pet', mas o Apps Script estava buscando 'id'.
    // Para garantir a compatibilidade com o codigo.gs corrigido, que aceita 'id_pet',
    // vamos manter o envio de 'id_pet' aqui.
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

  // O campo no Apps Script é 'foto_pet', mas o campo no HTML é 'foto_pet'
  // O Apps Script está retornando 'foto_pet' (linha 69 do codigo.gs)
  document.getElementById("foto_pet").src =
    d.foto_pet || "https://cdn-icons-png.flaticon.com/512/616/616408.png";

  document.getElementById("nome_pet").textContent = nomePet;
  document.getElementById("nome_pet_label").textContent = nomePet;
  document.getElementById("especie_pet").textContent = d.especie || "-";
  document.getElementById("raca_pet").textContent = d.raca || "-";
  document.getElementById("sexo_pet").textContent = d.sexo || "-";
  document.getElementById("cidade_pet").textContent = d.cidade || "-";
  document.getElementById("nome_tutor").textContent = nomeTutor;
  document.getElementById("whatsapp_tutor").textContent = d.whatsapp_tutor || "-";

  const numeroWhats = String(d.whatsapp_tutor || "").replace(/\D/g, "");
  const btn = document.getElementById("btn_contato");

  if (!numeroWhats || numeroWhats.length < 10) {
    btn.style.display = "none";
  } else {
    const texto = `Olá! Encontrei o pet ${nomePet} através do AcheiMeuPet 🐾`;
    btn.href = `https://wa.me/55${numeroWhats}?text=${encodeURIComponent(texto)}`;
  }
}

// === Enviar aviso ao tutor via Fiqon (VERSÃO ROBUSTA) ===
async function enviarAviso(formData) {
  try {
    const r = await fetch(WEBHOOK_AVISO, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (r.ok && r.status === 200) {
      return { enviado_whatsapp: true };
    } else {
      console.error("Resposta do Fiqon não foi OK:", r.status, r.statusText);
      return null;
    }

  } catch (err) {
    console.error("❌ Erro de rede ao enviar aviso:", err);
    return null;
  }
}

// === Execução ===
document.addEventListener("DOMContentLoaded", async () => {
  const id_pet = obterIdPet();

  if (!id_pet) {
    // A mensagem de erro no HTML já existe, mas vamos garantir que o conteúdo seja substituído
    document.getElementById("conteudo-pet").innerHTML =
      `<p class="erro" style="font-size:1.2em; color:red; margin-top:20px;">❌ ID do pet não informado na URL.</p>`;
    return;
  }

  const dados = await buscarDadosPet(id_pet);

  if (!dados) {
    // O HTML original já tem uma estrutura para "Pet não encontrado", mas vamos garantir a mensagem de erro
    document.getElementById("conteudo-pet").innerHTML =
      `<p class="erro" style="font-size:1.2em; color:orange; margin-top:20px;">⚠️ Pet não encontrado. Verifique o ID.</p>`;
    return;
  }

  preencherDadosPet(dados);

// =====================================================
// CAPTURAR LOCALIZAÇÃO — VERSÃO ROBUSTA E CONSISTENTE
// =====================================================
let latitude = null;
let longitude = null;

/**
 * Tenta capturar a localização do usuário.
 * @returns {Promise<boolean>} True se a localização foi obtida, false caso contrário.
 */
async function capturarLocalizacao() {
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) {
      console.warn("❌ Geolocalização não suportada.");
      return resolve(false);
    }

    const opcoes = {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
        console.log("📍 Localização obtida:", latitude, longitude);
        resolve(true);
      },
      (err) => {
        // Se o usuário negar, não é um erro fatal, apenas não teremos a localização.
        console.warn("⚠️ Falha ao obter localização:", err.code, err.message);
        resolve(false);
      },
      opcoes
    );
  });
}

// Tenta capturar a localização assim que a página carrega.
// O usuário verá o pedido de permissão imediatamente.
// Adicionamos um pequeno delay para garantir que o DOM esteja totalmente pronto
// e que o usuário tenha tempo de ver o pedido de permissão.
await new Promise(resolve => setTimeout(resolve, 500)); // Pequeno delay
await capturarLocalizacao();
// =====================================================

  const form = document.getElementById("formAviso");
  const msgOk = document.getElementById("mensagem_sucesso");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Se a localização ainda não foi obtida (usuário pode ter negado ou o timeout expirou),
    // fazemos uma última tentativa, mas sem bloquear o envio do formulário.
    if (latitude === null || longitude === null) {
      await capturarLocalizacao();
    }
    
    // Se a localização for nula, alertamos o usuário, mas permitimos o envio
    // para não impedir o contato com o tutor.
    if (latitude === null || longitude === null) {
        alert("⚠️ Não foi possível obter sua localização exata. O aviso será enviado, mas o tutor receberá apenas a localização aproximada.");
    }

    const payload = {
      id_pet,

      nome_encontrador: document.getElementById("nome_encontrador").value.trim(),
      telefone_encontrador: document.getElementById("telefone_encontrador").value.trim(),
      observacoes: document.getElementById("observacoes").value.trim(),

      nome_pet: dados.nome_pet,
      nome_tutor: dados.nome_tutor,
      whatsapp_tutor: dados.whatsapp_tutor,
      email_tutor: dados.email_tutor,

      latitude: latitude,
      longitude: longitude,
      // Adiciona o link do Google Maps para facilitar o uso no Fiqon
      localizacao_url: (latitude && longitude) ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}` : 'Localização não disponível',
    };

    const resp = await enviarAviso(payload);

    console.log("Resposta processada pelo JS:", resp);

    if (resp && resp.enviado_whatsapp === true) {
      msgOk.style.display = "block";
      setTimeout(() => (msgOk.style.display = "none"), 4000);
      form.reset();
    } else {
      alert("Não foi possível enviar o aviso ao tutor.");
    }
  });
});
