// ============================================================
// ENCONTRO PET - AcheiMeuPet
// Consulta os dados do pet e notifica o tutor via Fiqon
// ============================================================

// Lê o ID do pet a partir da URL
const urlParams = new URLSearchParams(window.location.search);
const id_pet = urlParams.get("id");

// Seleciona os elementos do HTML
const nomePet = document.getElementById("nomePet");
const especiePet = document.getElementById("especiePet");
const racaPet = document.getElementById("racaPet");
const sexoPet = document.getElementById("sexoPet");
const tutorPet = document.getElementById("tutorPet");
const cidadePet = document.getElementById("cidadePet");
const fotoPet = document.getElementById("fotoPet");

// Exibe mensagem de erro caso o ID não esteja na URL
if (!id_pet) {
  alert("ID do pet não informado.");
  throw new Error("ID do pet não informado.");
}

// ============================================================
// CONSULTA OS DADOS DO PET VIA API GOOGLE SCRIPT
// ============================================================

async function buscarDadosPet() {
  try {
    const resposta = await fetch(
      "https://script.google.com/macros/s/AKfycbwfJ1SgpgAvMhNyWlgqafnUzDNuxvV4DArdDo5gpBDXzVtMa0XRTKpSMyiPw/exec?id_pet=" + id_pet
    );

    if (!resposta.ok) throw new Error("Erro ao consultar API do pet.");

    const pet = await resposta.json();

    if (pet.status === "erro") {
      alert("Pet não encontrado no banco de dados.");
      return;
    }

    // Atualiza informações na página
    nomePet.innerText = pet.nome_pet || "-";
    especiePet.innerText = pet.especie || "-";
    racaPet.innerText = pet.raca || "-";
    sexoPet.innerText = pet.sexo || "-";
    tutorPet.innerText = pet.nome_tutor || "-";
    cidadePet.innerText = pet.cidade || "-";
    fotoPet.src = pet.foto_pet || "https://cdn-icons-png.flaticon.com/512/616/616408.png";

  } catch (erro) {
    console.error("Erro ao carregar dados:", erro);
    alert("Erro ao carregar informações do pet.");
  }
}

// ============================================================
// ENVIO DO ALERTA DE ENCONTRO VIA FIQON
// ============================================================

async function enviarNotificacao() {
  try {
    const nomeEncontrador = document.getElementById("nomeEncontrador").value.trim();
    const telefoneEncontrador = document.getElementById("telefoneEncontrador").value.trim();
    const mensagem = document.getElementById("mensagem").value.trim();

    if (!nomeEncontrador || !telefoneEncontrador) {
      alert("Por favor, preencha nome e telefone para contato.");
      return;
    }

    const payload = {
      id_pet: id_pet,
      nome_encontrador: nomeEncontrador,
      telefone_encontrador: telefoneEncontrador,
      mensagem: mensagem,
      data_envio: new Date().toISOString()
    };

    const webhook = "https://webhook.fiqon.app/webhook/a02b8e45-cd21-44e0-a619-be0e64fd9a4b/b9ae07d8-e7af-4b1f-9b1c-a22cc15fb9cd";

    const resposta = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!resposta.ok) throw new Error("Erro ao enviar notificação.");

    const retorno = await resposta.json();
    console.log("Retorno do Fiqon:", retorno);

    alert("Mensagem enviada com sucesso! O tutor será notificado.");

    // Limpa os campos após o envio
    document.getElementById("formEncontrador").reset();

  } catch (erro) {
    console.error("Erro ao enviar notificação:", erro);
    alert("Erro ao enviar mensagem. Tente novamente.");
  }
}

// ============================================================
// INICIALIZAÇÃO AUTOMÁTICA
// ============================================================

document.addEventListener("DOMContentLoaded", buscarDadosPet);
document.getElementById("btnEnviar").addEventListener("click", enviarNotificacao);
