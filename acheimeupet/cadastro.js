// ARQUIVO: cadastro.js (VERSÃO FINAL COM TOKEN DINÂMICO + token_origem)

document.addEventListener("DOMContentLoaded", () => {
  console.log("🐾 AcheiMeuPet: Script de cadastro iniciado (token dinâmico ativo).");

  // === Detecta token na URL ===
  const urlParams = new URLSearchParams(window.location.search);
  const temToken = urlParams.has("token");
  const tokenParam = urlParams.get("token") || "";

  // === URLs dos fluxos Fiqon ===
  const WEBHOOK_PAGO = "https://webhook.fiqon.app/webhook/a029be45-8a23-418e-93e3-33f9b620a944/3e1595ab-b587-499b-a640-a8fe46b2d0c6";
  const WEBHOOK_FREE = "https://webhook.fiqon.app/webhook/019a781c-15f8-738a-93bc-5b70388445ff/faee836c-d909-4b6b-96d0-ed6433640060";
  const WEBHOOK_FINANCEIRO = "https://webhook.fiqon.app/webhook/a037678d-0bd4-48a8-886a-d75537cfb146/4befe9a8-596a-41c2-8b27-b1ba57d0b130";

  // === Seleciona automaticamente o fluxo correto ===
  const WEBHOOK_CADASTRO = temToken ? WEBHOOK_FREE : WEBHOOK_PAGO;
  console.log(`📡 Modo de envio detectado: ${temToken ? "FREE" : "PAGO"}`);

  const formCadastro = document.getElementById("form-cadastro");
  const campoPlano = document.getElementById("tipo_plano");
  const campoPeriodo = document.getElementById("periodo");
  const inputQtdPets = document.getElementById("qtd_pets");
  const loading = document.getElementById("loading");
  const msg = document.getElementById("mensagem");

  // === Converte arquivo em base64 ===
  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  if (formCadastro) {
    formCadastro.addEventListener("submit", async (e) => {
      e.preventDefault();

      const btn = document.getElementById("botao-enviar");
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner"></span> Enviando...`;
      loading.style.display = "block";
      msg.textContent = "";
      msg.style.color = "#333";

      console.log("🚀 Iniciando envio do formulário...");

      try {
        const formData = new FormData(formCadastro);
        const dadosTutor = {
          nome_tutor: formData.get("nome_tutor"),
          cpf_tutor: formData.get("cpf_tutor"),
          email_tutor: formData.get("email_tutor"),
          whatsapp_tutor: formData.get("whatsapp_tutor"),
          cidade: formData.get("cidade"),
          uf: formData.get("uf"),
          endereco: formData.get("endereco"),
          cep: formData.get("cep"),
          obs: formData.get("obs"),
        };

        const plano = campoPlano.value;
        const periodo = campoPeriodo.value;
        const qtd = parseInt(inputQtdPets.value) || 1;

        let valor = 0;
        if (!temToken) {
          if (plano === "individual") {
            valor = periodo === "mensal" ? 24.9 : 249.9;
          } else if (plano === "familia") {
            valor = periodo === "mensal" ? 19.9 * qtd : 199.0 * qtd;
          }
        }

        // === Coleta os dados de cada pet ===
        const listaPets = [];
        for (let i = 1; i <= qtd; i++) {
          const nome_pet = formData.get(`nome_pet_${i}`);
          const especie = formData.get(`especie_${i}`);
          const raca = formData.get(`raca_${i}`);
          const sexo = formData.get(`sexo_${i}`);
          const ano_nasc = formData.get(`ano_nasc_${i}`);
          const file = formData.get(`foto_pet_${i}`);

          if (!nome_pet || !especie || !raca || !sexo || !ano_nasc || !file) {
            throw new Error(`Preencha todos os campos do Pet ${i}.`);
          }

          const MAX_FILE_SIZE = 1024 * 1024;
          if (file.size > MAX_FILE_SIZE) {
            throw new Error(`A foto do Pet ${i} é muito grande. O limite é 1MB.`);
          }

          const foto_pet = await toBase64(file);

          listaPets.push({
            nome_pet,
            especie,
            raca,
            sexo,
            ano_nascimento: ano_nasc,
            foto_pet,
          });
        }

        // === Payload principal (único para free e pago) ===
        const payloadUnico = {
          ...dadosTutor,
          plano: temToken ? "Free" : plano,
          periodo: temToken ? "" : periodo,
          qtd_pets: qtd,
          valor_total: temToken ? 0 : valor,
          origem_cadastro: temToken ? "free_site" : "assinatura_site",
          token_origem: tokenParam,            // ✅ novo campo incluído
          pets: listaPets,
        };

        console.log("📤 Enviando payload ao Fiqon:", payloadUnico);
        const resCadastro = await fetch(WEBHOOK_CADASTRO, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadUnico),
        });

        if (!resCadastro.ok) {
          const errorText = await resCadastro.text().catch(() => "Erro desconhecido no servidor.");
          console.error("⚠️ HTTP falhou:", resCadastro.status, errorText);
          throw new Error(`Falha na comunicação com o servidor. Status: ${resCadastro.status}.`);
        }

        const jsonCadastro = await resCadastro.json().catch(() => ({}));
        console.log(`📦 Retorno completo do Fiqon:`, jsonCadastro);

        // === Mensagem conforme o tipo de cadastro ===
        if (temToken) {
          msg.textContent = `✅ Cadastro gratuito recebido com sucesso! Seu(s) pet(s) está(ão) protegido(s) no AcheiMeuPet 🐾`;
          msg.style.color = "green";
        } else {
          const petsSucesso = jsonCadastro?.pets_cadastrados || [];
          const linkPagamento = jsonCadastro?.link_pagamento || null;

          if (petsSucesso.length > 0) {
            if (linkPagamento) {
              msg.textContent = `✅ ${petsSucesso.length} pet(s) cadastrado(s)! Redirecionando para o pagamento...`;
              msg.style.color = "green";
              setTimeout(() => { window.location.href = linkPagamento; }, 1500);
            } else {
              msg.textContent = `✅ ${petsSucesso.length} pet(s) cadastrados, mas o link de pagamento não foi gerado. Entraremos em contato.`;
              msg.style.color = "orange";
            }
          } else {
            throw new Error(jsonCadastro?.message || "Nenhum pet foi cadastrado. Verifique os dados.");
          }
        }

        formCadastro.reset();
        if (typeof atualizarBlocosPets === 'function') {
          document.getElementById('tipo_plano').value = '';
          atualizarBlocosPets();
        }

      } catch (erro) {
        console.error("❌ Erro no envio:", erro);
        msg.textContent = `❌ ${erro.message || "Ocorreu um erro ao enviar o cadastro. Tente novamente."}`;
        msg.style.color = "red";
      } finally {
        loading.style.display = "none";
        const btn = document.getElementById("botao-enviar");
        btn.disabled = false;
        btn.innerHTML = "🐾 Enviar cadastro";
      }
    });
  }

  // === Estilo do spinner ===
  const style = document.createElement("style");
  style.innerHTML = `
    .spinner {
      border: 3px solid #f3f3f3; border-top: 3px solid #c38e3d; border-radius: 50%;
      width: 16px; height: 16px; animation: spin 1s linear infinite;
      display: inline-block; margin-right: 6px; vertical-align: middle;
    }
    @keyframes spin { 0% {transform: rotate(0)} 100% {transform: rotate(360deg)} }
  `;
  document.head.appendChild(style);
});

