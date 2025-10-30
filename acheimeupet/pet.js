// ====================================================
// MÓDULO: pet.js — AcheiMeuPet (versão conectada ao Fiqon)
// ====================================================

// === Função para obter o ID do pet da URL ===
function obterIdPet() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// === Função para buscar os dados reais via Fiqon ===
async function buscarDadosPet(id_pet) {
  try {
    // Webhook real do fluxo Encontro_Pet_Fiqon
    const webhook = "https://webhook.fiqon.app/webhook/a02b8e45-cd21-44e0-a619-be0e64fd9a4b/b9ae07d8-e7af-4b1f-9b1c-a22cc15fb9cd";

    // Proxy para evitar bloqueio de CORS
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(webhook + "?id_pet=" + id_pet)}`;

    const resposta = await fetch(proxyUrl);
    const dados = await resposta.json();

    // Se não encontrou ou veio vazio
    if (!dados || !dados.nome_pet) {
      throw new Error("Pet não encontrado");
    }

    return dados;
  } catch (erro) {
    console.error("Erro ao buscar dados do pet:", erro);
    return null;
  }
}

// === Função para preencher os dados na página ===
function preencherDadosPet(dados) {
  document.getElementById("foto_pet").src = dados.foto_pet || "https://cdn-icons-png.flaticon.com/512/616/616408.png";
  document.getElementById("nome_pet").textContent = dados.nome_pet || "Pet não identificado";
  document.getElementById("raca_pet").textContent = dados.raca || "-";
  document.getElementById("sexo_pet").textContent = dados.sexo || "-";
  document.getElementById("especie_pet").textContent = dados.especie || "-";
  document.getElementById("cidade_pet").textContent = dados.cidade || "-";
  document.getElementById("nome_tutor").textContent = dados.nome_tutor || "-";
  document.getElementById("whatsapp_tutor").textContent = dados.whatsapp_tutor || "-";
  document.getElementById("data_cadastro").textContent = dados.data_cadastro || "-";

  // Atualiza o botão e o QR code
  const contatoLink = `https://wa.me/55${dados.whatsapp_tutor}?text=Olá! Encontrei o pet ${dados.nome_pet} através do AcheiMeuPet 🐾`;
  document.getElementById("btn_contato").href = contatoLink;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(contatoLink)}`;
  document.getElementById("qr_code").src = qrUrl;
}

// === Execução automática ao carregar a página ===
document.addEventListener("DOMContentLoaded", async () => {
  const id_pet = obterIdPet();

  if (!id_pet) {
    document.getElementById("conteudo-pet").innerHTML = `
      <p class="erro">❌ ID do pet não informado.</p>
    `;
    return;
  }

  // Mostra aviso de carregamento
  document.getElementById("nome_pet").textContent = "Carregando informações...";

  const dados = await buscarDadosPet(id_pet);

  if (!dados) {
    document.getElementById("conteudo-pet").innerHTML = `
      <p class="erro">⚠️ Pet não encontrado no sistema.</p>
    `;
    return;
  }

  preencherDadosPet(dados);
});
