// ====== ENDPOINTS ======
const WEBHOOK_FIQON = "https://webhook.fiqon.app/webhook/a02b8e45-cd21-44e0-a619-be0e64fd9a4b/b9ae07d8-e7af-4b1f-9b1c-a22cc15fb9cd";
const APPS_SCRIPT_URL = "https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLhSNe6DjuNyNHkfQyJjaUxdVRqkA9q6zFHGQ7KgqlQysWMc8AlZTdIaLKQcfBKRS1duL0xKcxSJHjkaA0A679uJAialDfJ7ONX4oy0aRVASqXEo5NDt3wzVZFYilSXnEo3yZ9IPPrcmfXEA_cwv0DoCaQr-4efwi6lXrb2eeyhD1pklDvsxr4Pui59ZUXHRnnzHZeZtXWJXdyjpCBjRDYUEv_VWKKzmRg4s2ewwVBHmRgHAYBwnr5japl-BKBwBwaQmYBJeiqpzEFuimUJ7Lq5y9aZUQBTza1kjV05MG1KDaM7YLi5fr4F2NNnaUg&lib=MQiqCA17Ib0wi-00uGNEuiSEBzuG_wEVr";

// === Função para obter ID do pet da URL ===
function obterIdPet() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// === Busca dados do pet na planilha (Apps Script) ===
async function buscarDadosPet(id_pet) {
  const url = `${APPS_SCRIPT_URL}&id_pet=${id_pet}`;
  try {
    const resposta = await fetch(url);
    const json = await resposta.json();
    if (!json || json.status !== "sucesso") throw new Error("Pet não encontrado");
    return json.pet;
  } catch (e) {
    console.error("Erro buscarDadosPet:", e);
    return null;
  }
}

// === Preenche a UI ===
function preencherDadosPet(d) {
  document.getElementById("foto_pet").src = d.foto_pet || "https://cdn-icons-png.flaticon.com/512/616/616408.png";
  document.getElementById("nome_pet").textContent = d.nome_pet || "Pet não identificado";
  document.getElementById("raca_pet").textContent = d.raca || "-";
  document.getElementById("sexo_pet").textContent = d.sexo || "-";
  document.getElementById("especie_pet").textContent = d.especie || "-";
  document.getElementById("cidade_pet").textContent = d.cidade || "-";
  document.getElementById("nome_tutor").textContent = d.nome_tutor || "-";
  document.getElementById("whatsapp_tutor").textContent = d.whatsapp_tutor || "-";
  document.getElementById("data_cadastro").textContent = d.data_cadastro || "-";

  const contatoLink = `https://wa.me/55${(d.whatsapp_tutor || "").replace(/\D/g,'')}?text=${encodeURIComponent(
    `Olá! Encontrei o pet ${d.nome_pet} através do AcheiMeuPet 🐾`
  )}`;
  document.getElementById("btn_contato").href = contatoLink;
}

// === Envia formulário "Avisar que encontrei" para Fiqon ===
async function enviarAviso(formData) {
  const r = await fetch(WEBHOOK_FIQON, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });
  return r.json();
}

// === On load ===
document.addEventListener("DOMContentLoaded", async () => {
  const id_pet = obterIdPet();
  if (!id_pet) {
    document.getElementById("conteudo-pet").innerHTML = `<p class="erro">❌ ID do pet não informado.</p>`;
    return;
  }

  document.getElementById("nome_pet").textContent = "Carregando...";

  const dados = await buscarDadosPet(id_pet);
  if (!dados) {
    document.getElementById("conteudo-pet").innerHTML = `<p class="erro">⚠️ Pet não encontrado no sistema.</p>`;
    return;
  }

  preencherDadosPet(dados);

  // Submit do formulário
  const form = document.getElementById("formAviso");
  const msgOk = document.getElementById("mensagem_sucesso");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = {
      id_pet,
      nome_encontrador: document.getElementById("nome_encontrador").value.trim(),
      telefone_encontrador: document.getElementById("telefone_encontrador").value.trim(),
      observacoes: document.getElementById("observacoes").value.trim(),
      nome_pet: dados.nome_pet || "",
      nome_tutor: dados.nome_tutor || "",
      whatsapp_tutor: dados.whatsapp_tutor || "",
      email_tutor: dados.email_tutor || "",
    };

    try {
      const resp = await enviarAviso(payload);
      if (resp && resp.ok) {
        msgOk.style.display = "block";
        setTimeout(() => (msgOk.style.display = "none"), 4000);
        form.reset();
      } else {
        alert("Não foi possível enviar o aviso ao tutor.");
      }
    } catch (err) {
      console.error(err);
      alert("Falha ao enviar o aviso. Tente novamente.");
    }
  });
});
