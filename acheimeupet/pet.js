// =============================================
// AcheiMeuPet — pet.js (versão corrigida 19/11)
// Consulta dados direto no Apps Script
// Envia aviso completo ao Fiqon (Encontro_Pet_fluxo)
// =============================================

// ===== ENDPOINTS =====
const API_PET = "https://script.google.com/macros/s/AKfycbzFiM604SBy2ICG8l1It_q1lkum6V3Qy5OKA3gGnO1tcJeGmR4nIOk-wtznsw2i42kgiw/exec"; // URL atualizada pelo usuário

const WEBHOOK_AVISO = "https://webhook.fiqon.app/webhook/a02b8e45-cd21-44e0-a619-be0e64fd9a4b/b9ae07d8-e7af-4b1f-9b1c-a22cc15fb9cd";

// === Obter ID do pet da URL ===
function obterIdPet() {
    const params = new URLSearchParams(window.location.search);
    // O ID é passado na URL como '?id=PXXXXX', então buscamos por 'id'
    return params.get("id");
}

// === Buscar dados do pet ===
async function buscarDadosPet(id_pet) {
    try {
        // CORREÇÃO: O Apps Script (codigo.gs) espera o parâmetro 'id' ou 'id_pet'.
        // O código original estava enviando 'id_pet', mas o Apps Script estava buscando 'id'.
        // Para garantir a compatibilidade com o codigo.gs corrigido, que aceita 'id_pet',
        // vamos manter o envio de 'id_pet' aqui.
        const url = `${API_PET}?id_pet=${id_pet}`;
        
        const response = await fetch(url);
        
        // Verifica se a requisição HTTP foi bem-sucedida (status 200-299)
        if (!response.ok) {
            console.error(`Erro HTTP: Status ${response.status}. URL: ${url}`);
            exibirErro(`Erro de comunicação com o servidor (Status ${response.status}). Tente novamente mais tarde.`);
            return null;
        }

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

// === Preencher dados na página ===
function preencherDadosPet(pet) {
    if (!pet) {
        return;
    }

    // === DADOS DO PET ===
    document.getElementById("nome_pet_label").textContent = pet.nome_pet || "Pet não cadastrado";
    document.getElementById("especie_pet").textContent = pet.especie || "Não informado";
    document.getElementById("raca_pet").textContent = pet.raca || "Não informado";
    document.getElementById("sexo_pet").textContent = pet.sexo || "Não informado";
    // document.getElementById("ano_nascimento_pet").textContent = pet.ano_nascimento || "Não informado"; // Removido: ID não existe em pet.html
    
    // Imagem do Pet
    const imgPet = document.getElementById("foto_pet");
    if (pet.foto_pet) {
        imgPet.src = pet.foto_pet;
        imgPet.alt = `Foto de ${pet.nome_pet}`;
    } else {
        // Imagem placeholder se não houver foto
        imgPet.src = "placeholder.png"; 
        imgPet.alt = "Foto não disponível";
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

    // Botão de Contato
    const btnContato = document.getElementById("btn_contato");
    if (whatsappTutor) {
        btnContato.href = `https://wa.me/55${whatsappTutor.replace(/\D/g, '')}?text=Olá!%20Encontrei%20o%20seu%20pet%20${pet.nome_pet}.%20Ele%20está%20bem!`;
        btnContato.classList.remove("d-none");
    } else {
        btnContato.classList.add("d-none");
    }

    // O texto "Carregando..." é substituído pelo nome do pet na linha 71.
    // Os elementos 'loader' e 'pet-data-section' não existem no HTML.
    // Removendo as linhas que causavam o erro de 'classList' em elementos nulos.
}

// === Exibir mensagem de erro ===
function exibirErro(mensagem) {
    // Os elementos 'loader' e 'error-section' não existem no HTML.
    // Apenas exibimos a mensagem de erro no console e no h2 principal.
    document.getElementById("nome_pet").textContent = "ERRO: " + mensagem;
    document.getElementById("nome_pet").classList.add("erro"); // Adiciona classe de erro para estilização
}

// === Enviar aviso de pet encontrado (Fiqon Webhook) ===
async function enviarAviso(pet) {
    if (!pet || !pet.link_pet) {
        console.warn("Não foi possível enviar aviso: dados do pet incompletos.");
        return;
    }

    const data = {
        pet_id: pet.id_pet,
        nome_pet: pet.nome_pet,
        nome_tutor: pet.nome_tutor,
        whatsapp_tutor: pet.whatsapp_tutor,
        email_tutor: pet.email_tutor,
        link_pet: pet.link_pet,
        data_hora_encontro: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
        // Adicionar dados de localização do usuário que acessou a página (se disponíveis)
        // Exemplo: latitude: '...', longitude: '...'
    };

    try {
        const response = await fetch(WEBHOOK_AVISO, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            console.log("Aviso de pet encontrado enviado com sucesso para o Fiqon.");
        } else {
            console.error("Erro ao enviar aviso para o Fiqon:", response.status, await response.text());
        }
    } catch (error) {
        console.error("Erro de rede ao enviar aviso para o Fiqon:", error);
    }
}

// === Inicialização ===
async function init() {
    const id_pet = obterIdPet();

    if (!id_pet) {
        exibirErro("ID do pet não encontrado na URL.");
        return;
    }

    const pet = await buscarDadosPet(id_pet);

    if (pet) {
        preencherDadosPet(pet);
        // Não enviar aviso se o pet for do fluxo pago (Cadastro Pets)
        // O aviso deve ser enviado apenas quando um pet é *encontrado* por um terceiro.
        // O fluxo pago já deve ter um mecanismo de notificação diferente.
        // Vamos assumir que o aviso é para o fluxo free/pre-cadastro, onde o link é lido por um terceiro.
        if (pet.origem !== "cadastro_pets") {
             enviarAviso(pet);
        }
    }
}

document.addEventListener("DOMContentLoaded", init);

// === Tratamento do Formulário de Aviso ===
const formAviso = document.getElementById("formAviso");
if (formAviso) {
    formAviso.addEventListener("submit", async function(event) {
        event.preventDefault(); // Impede o recarregamento da página

        const id_pet = obterIdPet();
        if (!id_pet) {
            alert("Erro: ID do pet não encontrado na URL. Por favor, recarregue a página.");
            return;
        }

        // Desabilita o botão e mostra que está enviando
        const btnEnviar = document.querySelector("#formAviso button[type='submit']");
        btnEnviar.disabled = true;
        btnEnviar.textContent = "Enviando aviso...";

        // Coleta os dados do formulário
        const nome_encontrador = document.getElementById("nome_encontrador").value;
        const telefone_encontrador = document.getElementById("telefone_encontrador").value;
        const observacoes = document.getElementById("observacoes").value;

        // Busca os dados do pet novamente para ter o link_pet e dados do tutor
        const pet = await buscarDadosPet(id_pet);

        if (pet) {
            // Cria o objeto de dados para o webhook (Fiqon)
            const data = {
                pet_id: pet.id_pet,
                nome_pet: pet.nome_pet,
                nome_tutor: pet.nome_tutor,
                whatsapp_tutor: pet.whatsapp_tutor,
                link_pet: pet.link_pet,
                nome_encontrador: nome_encontrador,
                telefone_encontrador: telefone_encontrador,
                observacoes: observacoes,
                data_hora_encontro: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
            };

            try {
                const response = await fetch(WEBHOOK_AVISO, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    document.getElementById("mensagem_sucesso").style.display = "block";
                    formAviso.reset(); // Limpa o formulário
                    console.log("Aviso de pet encontrado enviado com sucesso para o Fiqon.");
                } else {
                    alert("Erro ao enviar aviso. Tente novamente mais tarde.");
                    console.error("Erro ao enviar aviso para o Fiqon:", response.status, await response.text());
                }
            } catch (error) {
                alert("Erro de rede ao enviar aviso. Verifique sua conexão.");
                console.error("Erro de rede ao enviar aviso para o Fiqon:", error);
            }
        } else {
            alert("Erro: Não foi possível obter os dados do pet para enviar o aviso.");
        }

        // Restaura o botão
        btnEnviar.disabled = false;
        btnEnviar.textContent = "📍 Enviar aviso ao tutor";
    });
}
