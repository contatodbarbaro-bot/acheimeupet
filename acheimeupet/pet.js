// =============================================
// AcheiMeuPet — pet.js (versão corrigida 19/11)
// Consulta dados direto no Apps Script
// Envia aviso completo ao FiQon (Encontro_Pet_fluxo)
// =============================================

// ===== ENDPOINTS =====
const API_PET = "https://script.google.com/macros/s/AKfycbzFiM604SBy2ICG8l1It_q1lkum6V3Qy5OKA3gGnO1tcJeGmR4nIOk-wtznsw2i42kgiw/exec";
const WEBHOOK_AVISO = "https://webhook.fiqon.app/webhook/a02b8e45-cd21-44e0-a619-be0e64fd9a4b/b9ae07d8-e7af-4b1f-9467-331580918731";

// ===== Obter ID do pet da URL =====
function obterIdPet() {
    const params = new URLSearchParams(window.location.search);
    // O ID é passado na URL como '?id=PXXXXX', então buscamos por 'id'
    return params.get("id");
}

// ===== Buscar dados do pet =====
async function buscarDadosPet(id_pet) {
    try {
        // CORREÇÃO: O Apps Script (codigo.gs) espera o parâmetro 'id' ou 'id_pet'.
        // O código original estava enviando 'id_pet', mas o Apps Script estava buscando 'id'.
        // Para garantir a compatibilidade com o codigo.gs corrigido, que aceita 'id_pet',
        // vamos manter o envio de 'id_pet' aqui.
        const url = `${API_PET}?id_pet=${id_pet}`;
        // CORREÇÃO DE CORS: não usar credentials "include" com Apps Script
        // Fazendo fetch simples para evitar bloqueio de CORS
        const response = await fetch(url);

        // Verifica se a resposta é JSON antes de tentar o parse
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.error("Erro: Resposta do Apps Script não é JSON. Conteúdo:", await response.text());
            exibirErro("Erro de comunicação com o servidor. Resposta inesperada.");
            return null;
        }

        const data = await response.json();

        console.log("Resposta do Apps Script:", data);

        if (data.status === "sucesso") {
            return data.pet;
        } else {
            // O Apps Script retorna status: "erro" e mensagem: "Pet não encontrado"
            exibirErro(data.mensagem || "Pet não encontrado. Verifique o ID.");
            return null;
        }

    } catch (error) {
        console.error("Erro ao buscar dados do pet:", error);
        exibirErro("Erro ao buscar dados do pet. Verifique sua conexão ou tente novamente.");
        return null;
    }
}

// ===== Preencher dados na página =====
function preencherDadosPet(pet) {
    if (!pet) {
        return;
    }

    // === DADOS DO PET ===
    const imgPet = document.getElementById("foto_pet"); // Definido aqui para evitar erro de referência
    if (pet.foto_pet) {
        imgPet.src = pet.foto_pet;
        imgPet.alt = `Foto de ${pet.nome_pet}`;
    } else {
        // Imagem placeholder se não houver foto
        imgPet.src = "placeholder.png";
        imgPet.alt = "Foto não disponível";
    }

    document.getElementById("nome_pet_label").textContent = pet.nome_pet || "Pet não cadastrado";
    document.getElementById("especie_pet").textContent = pet.especie || "Não informado";
    document.getElementById("raca_pet").textContent = pet.raca || "Não informado";
    document.getElementById("sexo_pet").textContent = pet.sexo || "Não informado";
    const anoEl = document.getElementById("ano_nascimento_pet");
    if (anoEl) {
    anoEl.textContent = pet.ano_nascimento || "Não informado";
    }

    // === DADOS DO TUTOR ===
    const nomeTutor = pet.nome_tutor || "Tutor não informado";
    const whatsappTutor = pet.whatsapp_tutor || "";
    const emailTutor = pet.email_tutor || "";
    const ufTutor = pet.uf || "";
    // O campo 'cidade' pode estar ausente no fluxo pago (cadastro_pets), mas 'uf' deve estar presente.
    // Se 'cidade' estiver ausente, usamos apenas 'uf'.
    const cidadeTutor = pet.cidade || "";

    document.getElementById("nome_tutor").textContent = nomeTutor;
    document.getElementById("whatsapp_tutor").textContent = whatsappTutor || "Não informado";

    let localizacao = "";
    if (cidadeTutor && ufTutor) {
        localizacao = `${cidadeTutor} - ${ufTutor}`;
    } else if (ufTutor) {
        localizacao = ufTutor;
    } else if (cidadeTutor) {
        localizacao = cidadeTutor;
    }

    document.getElementById("cidade_pet").textContent = localizacao || "Localização não informada";

    // === Botão de Contato ===
    const btnContato = document.getElementById("btn_contato");
    if (whatsappTutor) {
        // CORREÇÃO 1: Forçar o valor a ser string antes de usar .replace()
        const whatsappString = String(whatsappTutor);
        
        btnContato.href = `https://wa.me/55${whatsappString.replace(/[\D]/g, '')}?text=Ol%C3%A1%20Encontrei%20o%20seu%20pet%20${pet.nome_pet}!`;
        
        btnContato.classList.remove("d-none");
    } else {
        btnContato.classList.add("d-none");
    }

 // === Formulário de Aviso ===
const formAviso = document.getElementById("formAviso");
if (formAviso) {
  formAviso.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nomeEncontrador = document.getElementById("nome_encontrador")?.value?.trim();
    const telefoneEncontrador = document.getElementById("telefone_encontrador")?.value?.trim();
    const observacoes = document.getElementById("observacoes")?.value?.trim();

    if (!nomeEncontrador || !telefoneEncontrador) {
      alert("Por favor, preencha nome e telefone.");
      return;
    }

    const dadosAviso = {
      id_pet: pet.id_pet,
      nome_pet: pet.nome_pet,
      nome_tutor: pet.nome_tutor,
      whatsapp_tutor: pet.whatsapp_tutor,
      email_tutor: pet.email_tutor,
      nome_encontrador: nomeEncontrador,
      telefone_encontrador: telefoneEncontrador,
      mensagem: observacoes || "",   // aqui vai o texto do textarea
      link_pet: window.location.href
    };

    try {
      console.log("Enviando aviso para o webhook...", dadosAviso);

      await fetch(WEBHOOK_AVISO, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosAviso)
      });

      // Exibe sucesso (no seu HTML ele não usa "d-none", ele usa display:none)
      const ok = document.getElementById("mensagem_sucesso");
      if (ok) ok.style.display = "block";

      formAviso.reset();
      console.log("Aviso enviado (no-cors):", dadosAviso);

    } catch (error) {
      console.error("Erro ao enviar aviso:", error);
      alert("Ocorreu um erro ao tentar enviar o aviso. Tente novamente.");
    }
  });
} else {
  console.warn("Formulário #formAviso não encontrado no HTML.");
}

// ===== Inicialização =====
async function init() {
    const id_pet = obterIdPet();
    if (!id_pet) {
        exibirErro("ID do pet não encontrado na URL.");
        return;
    }

    const pet = await buscarDadosPet(id_pet);
    if (pet) {
        preencherDadosPet(pet);
    }
}

document.addEventListener("DOMContentLoaded", init);





