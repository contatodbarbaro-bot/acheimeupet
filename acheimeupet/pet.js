// =============================================
//  AcheiMeuPet — pet.js (versão estável)
//  Consulta dados do pet direto no Apps Script
//  e usa o Fiqon apenas para avisar o tutor.
// =============================================

// ====== ENDPOINTS ======

// Apps Script que busca o PET na planilha Banco_de_dados_clientes
const API_PET =
  "https://script.google.com/macros/s/AKfycbz5pxePvVWe6zYI6hqIAXT1mMO0-0NNViyA2PfkFWvdsmD55bFBNT5tlwqxQdsOyEnq7w/exec";

// Webhook Fiqon para avisar o tutor (Encontro_Pet_fluxo)
const WEBHOOK_AVISO =
  "https://webhook.fiqon.app/webhook/a02b8e45-cd21-44e0-a619-be0e64fd9a4b/b9ae07d8-e7af-4b1f-9b1c-a22cc15fb9cd";


// === Obter ID do pet da URL ===
function obterIdPet() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// === Buscar dados do pet (direto no Apps Script) ===
async function buscarDadosPet(id_pet) {
  try {
    console.log("📡 Buscando dados do pet no Apps Script...", id_pet);

    const url = `${API_PET}?id_pet=${encodeURIComponent(id_pet)}`;
    const resposta = await fetch(url);

    const json = await resposta.json();
    console.log("🔍 Retorno completo da API PET:", json);

    // Valida retorno
    if (!json || json.status !== "sucesso" || !json.pet) {
      const msg = json && json.mensagem
        ? json.mensagem
        : "Pet não encontrado ou resposta inválida";
      throw new Error(msg);
    }

    return json.pet;
  } catch (e) {
    console.error("❌ Erro buscarDadosPet:", e);
    return null;
  }
}

// === Preencher dados na interface ===
function preencherDadosPet(d) {
  const nomePet = d.nome_pet || "Pet não identificado";
  const nomeTutor = d.nome_tutor || "Tutor não identificado";

  // Foto
  document.getElementById("foto_pet").src =
    d.foto_pet || "https://cdn-icons-png.flaticon.com/512/616/616408.png";

  // Textos
  document.getElementById("nome_pet").textContent = nomePet;
  document.getElementById("nome_pet_label").textContent = nomePet;
  document.getElementById("especie_pet").textContent = d.especie || "-";
  document.getElementById("raca_pet").textContent = d.raca || "-";
  document.getElementById("sexo_pet").textContent = d.sexo || "-";
  document.getElementById("cidade_pet").textContent = d.cidade || "-";
  document.getElementById("nome_tutor").textContent = nomeTutor;
  document.getElementById("whatsapp_tutor").textContent =
    d.whatsapp_tutor || "-";

  // Botão WhatsApp
  const numeroWhats = (d.whatsapp_tutor || "").replace(/\D/g, "");
  const texto = `Olá! Encontrei o pet ${nomePet} através do AcheiMeuPet 🐾`;
  const contatoLink = `https://wa.me/55${numeroWhats}?text=${encodeURIComponent(
    texto
  )}`;
  document.getElementById("btn_contato").href = contatoLink;

  console.log("✅ Dados preenchidos na interface com sucesso.");
}

// === Enviar aviso para o tutor (via Fiqon) ===
async function enviarAviso(formData) {
  try {
    const r = await fetch(WEBHOOK_AVISO, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const json = await r.json();
    console.log("📤 Retorno do aviso:", json);
    return json;
  } catch (err) {
    console.error("❌ Erro ao enviar aviso:", err);
    return null;
  }
}

// === Execução ao carregar página ===
document.addEventListener("DOMContentLoaded", async () => {
  const id_pet = obterIdPet();

  if (!id_pet) {
    document.getElementById("conteudo-pet").innerHTML =
      `<p class="erro">❌ ID do pet não informado.</p>`;
    return;
  }

  document.getElementById("nome_pet").textContent = "Carregando...";

  const dados = await buscarDadosPet(id_pet);
  if (!dados) {
    document.getElementById("conteudo-pet").innerHTML =
      `<p class="erro">⚠️ Pet não encontrado no sistema.</p>`;
    return;
  }

  // Preenche tela
  preencherDadosPet(dados);

  // === Formulário “Avisar que encontrei” ===
  const form = document.getElementById("formAviso");
  const msgOk = document.getElementById("mensagem_sucesso");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      id_pet,
      nome_encontrador:
        document.getElementById("nome_encontrador").value.trim(),
      telefone_encontrador:
        document.getElementById("telefone_encontrador").value.trim(),
      observacoes: document.getElementById("observacoes").value.trim(),
      // dados do pet/tutor para o Fiqon montar a mensagem
      nome_pet: dados.nome_pet || "",
      nome_tutor: dados.nome_tutor || "",
      whatsapp_tutor: dados.whatsapp_tutor || "",
      email_tutor: dados.email_tutor || "",
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
