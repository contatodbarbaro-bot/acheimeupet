// =============================================
// AcheiMeuPet — pet.js (versão corrigida 19/11)
// Consulta dados direto no Apps Script
// Envia aviso completo ao FiQon (Encontro_Pet_fluxo)
// =============================================

// ===== ENDPOINTS =====
const API_PET = "https://script.google.com/macros/s/AKfycbzFiM604SBy2ICG8L1It_qllkum6V3Qy50KA3gGn01tcJeGmR4nIOk-w/exec";
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
    document.getElementById("ano_nascimento_pet").textContent = pet.ano_nascimento || "Não informado";

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
        // =================================================================================
        // CORREÇÃO: Forçar o valor a ser string antes de usar .replace()
        // O erro ocorre porque o Apps Script envia o número como tipo 'number'.
        const whatsappString = String(whatsappTutor);
        
        // A linha 114 original era:
        // btnContato.href = `https://wa.me/55${whatsappTutor.replace(/[\D]/g, '')}?text=Ol%C3%A1%20Encontrei%20o%20seu%20pet%20${pet.nome_pet}!`;
        
        // Nova linha 114 corrigida:
        btnContato.href = `https://wa.me/55${whatsappString.replace(/[\D]/g, '')}?text=Ol%C3%A1%20Encontrei%20o%20seu%20pet%20${pet.nome_pet}!`;
        // =================================================================================
        
        btnContato.classList.remove("d-none");
    } else {
        btnContato.classList.add("d-none");
    }

    // === Formulário de Aviso ===
    const formAviso = document.getElementById("form_aviso");
    formAviso.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const nomeEncontrador = document.getElementById("nome_encontrador").value;
        const telefoneEncontrador = document.getElementById("telefone_encontrador").value;
        const emailEncontrador = document.getElementById("email_encontrador").value;
        const mensagem = document.getElementById("mensagem_aviso").value;

        if (!nomeEncontrador || !telefoneEncontrador || !emailEncontrador || !mensagem) {
            alert("Por favor, preencha todos os campos do formulário.");
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
            email_encontrador: emailEncontrador,
            mensagem: mensagem,
            link_pet: window.location.href // Adiciona o link completo da página
        };

        try {
            const response = await fetch(WEBHOOK_AVISO, {
                method: 'POST',
                mode: 'no-cors', // Necessário para evitar erros de CORS com webhooks simples
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dadosAviso)
            });

            // Como o modo é 'no-cors', a resposta será opaca e não podemos verificar o status.
            // Assumimos o sucesso se não houver erro de rede.
            
            // Exibe a mensagem de sucesso
            document.getElementById("mensagem_sucesso").classList.remove("d-none");
            document.getElementById("form_aviso_container").classList.add("d-none");
            
            // Limpa o formulário (opcional, mas boa prática)
            formAviso.reset();

            console.log("Aviso enviado com sucesso (resposta opaca devido a 'no-cors'). Dados enviados:", dadosAviso);

        } catch (error) {
            console.error("Erro ao enviar aviso:", error);
            alert("Ocorreu um erro ao tentar enviar o aviso. Por favor, tente novamente mais tarde.");
        }
    });
    
    // Remove o "Carregando..." e exibe o conteúdo
    document.getElementById("loading_container").classList.add("d-none");
    document.getElementById("conteudo_pet").classList.remove("d-none");
}

// ===== Exibir Erro =====
function exibirErro(mensagem) {
    document.getElementById("loading_container").classList.add("d-none");
    document.getElementById("conteudo_pet").classList.add("d-none");
    document.getElementById("erro_container").classList.remove("d-none");
    document.getElementById("mensagem_erro").textContent = mensagem;
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
