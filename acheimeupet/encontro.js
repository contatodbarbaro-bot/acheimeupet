// =============================
// AcheiMeuPet — Encontro (Front completo)
// =============================

// ✅ Apps Script (API pública)
const API_URL = "https://script.google.com/macros/s/AKfycbz5pxePvVWe6zYI6hqIAXT1mMO0-0NNViyA2PfkFWvdsmD55bFBNT5tlwqxQdsOyEnq7w/exec";

// ✅ Webhook do Fiqon — Fluxo Encontro_Pet_Fiqon
const WEBHOOK_FIQON = "https://SEU_WEBHOOK_DO_FIQON_AQUI"; // 👈 cole aqui

// 🔍 Pega ID do pet na URL
function getParam(name) {
  const u = new URL(window.location.href);
  return u.searchParams.get(name);
}

// 🟢 Busca dados do pet
async function buscarDadosPet() {
  const id = getParam("id");
  if (!id) return mostrarErro("ID do pet não informado.");

  try {
    const response = await fetch(`${API_URL}?id=${encodeURIComponent(id)}`);
    const data = await response.json();

    if (!data || data.status !== "sucesso") throw new Error("Pet não encontrado.");
    preencherFicha(data.pet);
  } catch (e) {
    console.error("❌ Erro:", e);
    mostrarErro("⚠️ Não foi possível carregar as informações deste pet.");
  }
}

// 🐾 Preenche ficha
function preencherFicha(pet) {
  document.getElementById("nomePet").textContent = pet.nome_pet || "-";
  document.getElementById("especiePet").textContent = pet.especie || "-";
  document.getElementById("racaPet").textContent = pet.raca || "-";
  document.getElementById("sexoPet").textContent = pet.sexo || "-";
  document.getElementById("tutorPet").textContent = pet.nome_tutor || "-";
  document.getElementById("cidadePet").textContent = pet.cidade || "-";

  if (pet.foto_pet && pet.foto_pet.startsWith("http"))
    document.getElementById("fotoPet").src = pet.foto_pet;

  // 🔗 WhatsApp do tutor
  const telTutor = (pet.whatsapp_tutor || pet.telefone_tutor || "").replace(/\D/g, "");
  if (telTutor.length >= 10) {
    const msg = `Olá ${pet.nome_tutor}, encontrei seu pet ${pet.nome_pet}!`;
    const link = `https://wa.me/55${telTutor}?text=${encodeURIComponent(msg)}`;
    const btn = document.getElementById("btnWhatsTutor");
    btn.href = link;
    btn.style.display = "block";
  }
}

// ⚠️ Exibe erro visual
function mostrarErro(msg) {
  const container = document.querySelector(".container");
  container.innerHTML = `<div style="
    background:#fff3cd; border:1px solid #ffe69c; color:#664d03;
    padding:20px; border-radius:10px; line-height:1.6em;">
    <strong>Oops!</strong> ${msg}<br><br>
    <small>Sistema AcheiMeuPet 🐾 — em memória do Picolé ❤️</small>
  </div>`;
}

// 🚀 Envia formulário ao Fiqon
async function enviarAoTutor() {
  const nome = document.getElementById("nomeEncontrador").value.trim();
  const telefone = document.getElementById("telefoneEncontrador").value.replace(/\D/g, "");
  const mensagem = document.getElementById("mensagem").value.trim();
  const id = getParam("id");

  if (!nome || telefone.length < 10) {
    alert("Por favor, preencha seu nome e telefone corretamente.");
    return;
  }

  const payload = {
    id_pet: id,
    nome_encontrador: nome,
    telefone_encontrador: telefone,
    mensagem: mensagem,
    origem: "pagina_encontro",
    timestamp: new Date().toISOString()
  };

  const btn = document.getElementById("btnEnviar");
  btn.disabled = true;
  btn.textContent = "Enviando...";

  try {
    const res = await fetch(WEBHOOK_FIQON, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert("Mensagem enviada! O tutor será avisado automaticamente.");
      document.getElementById("formEncontrador").reset();
    } else {
      alert("Erro ao enviar. Tente novamente mais tarde.");
    }
  } catch (err) {
    console.error(err);
    alert("Falha de conexão ao enviar mensagem.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Enviar Mensagem ao Tutor";
  }
}

// 🧩 Inicialização
document.addEventListener("DOMContentLoaded", () => {
  buscarDadosPet();
  document.getElementById("btnEnviar").addEventListener("click", enviarAoTutor);
});
