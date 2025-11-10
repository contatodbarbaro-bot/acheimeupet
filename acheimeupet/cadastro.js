document.addEventListener("DOMContentLoaded", () => {
  console.log("🐾 AcheiMeuPet: Script de cadastro iniciado.");

  // ====== ENDPOINTS ======
  const WEBHOOK_CADASTRO = "https://webhook.fiqon.app/webhook/a029be45-8a23-418e-93e3-33f9b620a944/3e1595ab-b587-499b-a640-a8fe46b2d0c6";
  const WEBHOOK_FINANCEIRO = "https://webhook.fiqon.app/webhook/a037678d-0bd4-48a8-886a-d75537cfb146/4befe9a8-596a-41c2-8b27-b1ba57d0b130";

  // ====== ELEMENTOS DO FORMULÁRIO ======
  const formCadastro = document.getElementById("form-cadastro" );
  const campoPlano = document.getElementById("tipo_plano");
  const campoPeriodo = document.getElementById("periodo");
  const inputQtdPets = document.getElementById("qtd_pets");
  const loading = document.getElementById("loading");
  const msg = document.getElementById("mensagem");

  // ====== HELPER: FILE → BASE64 ======
  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  // ====== SUBMIT ======
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
        // === COLETA DOS DADOS ===
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
        
        // ✅ CORREÇÃO APLICADA AQUI:
        let qtd;
        if (plano === "familia") {
          qtd = parseInt(inputQtdPets.value) || 2;
        } else {
          qtd = 1;
          // Garante que o valor do input reflita a quantidade correta para o loop
          inputQtdPets.value = 1; 
        }

        let valor = 0;
        if (plano === "individual") {
          valor = periodo === "mensal" ? 24.9 : 249.9;
        } else if (plano === "familia") {
          valor = periodo === "mensal" ? 19.9 * qtd : 199.0 * qtd;
        }

        const petsCadastrados = [];

        for (let i = 1; i <= qtd; i++) {
          console.log(`📦 Preparando envio do Pet ${i}`);
          const nome_pet = formData.get(`nome_pet_${i}`);
          const especie = formData.get(`especie_${i}`);
          const raca = formData.get(`raca_${i}`);
          const sexo = formData.get(`sexo_${i}`);
          const ano_nasc = formData.get(`ano_nasc_${i}`);
          const file = formData.get(`foto_pet_${i}`);

          // Validação de campos
          if (!nome_pet || !especie || !raca || !sexo || !ano_nasc || !file) {
            throw new Error(`Preencha todos os campos do Pet ${i}.`);
          }

          // Validação de tamanho de arquivo
          const MAX_FILE_SIZE = 1024 * 1024;
          if (file.size > MAX_FILE_SIZE) {
            throw new Error(`A foto do Pet ${i} é muito grande. O limite é 1MB.`);
          }

          // CONVERSÃO PARA BASE64
          const foto_pet = await toBase64(file);

          // MONTAGEM DO PAYLOAD
          const payloadPet = {
            nome_pet, especie, raca, sexo,
            ano_nascimento: ano_nasc,
            foto_pet, // Base64 da imagem
            ...dadosTutor,
            plano, periodo,
            qtd_pets: qtd,
            valor_total: valor,
          };

          console.log("📤 Enviando cadastro ao Fiqon...");

          // Requisição com Content-Type: application/json
          const resCadastro = await fetch(WEBHOOK_CADASTRO, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payloadPet),
          });

          // Tratamento de erro HTTP
          if (!resCadastro.ok) {
            const errorText = await resCadastro.text().catch(() => "");
            console.error("⚠️ HTTP falhou:", resCadastro.status, errorText);
            throw new Error(`Falha HTTP ao cadastrar o Pet ${i}. Status: ${resCadastro.status}.`);
          }

          // Tentativa de ler a resposta JSON
          const jsonCadastro = await resCadastro.json().catch(() => ({}));
          console.log(`📦 Retorno cadastro Pet ${i}:`, JSON.stringify(jsonCadastro));

          // Leitura ampliada do retorno JSON (para funcionar com o Fiqon)
          const id_pet =
            jsonCadastro?.id_pet ||
            jsonCadastro?.result?.id_pet ||
            jsonCadastro?.body?.id_pet ||
            jsonCadastro?.result?.result?.id_pet ||
            jsonCadastro?.body?.result?.id_pet ||
            null;

          if (id_pet) {
            petsCadastrados.push(id_pet);
          } else {
            console.warn(`⚠️ ID do Pet ${i} não encontrado na resposta do Fiqon. Resposta:`, jsonCadastro);
          }

          // Pequena pausa para evitar rate limit
          if (qtd > 1) {
            await new Promise((r) => setTimeout(r, 1000));
          }
        }

        // Validação final de pets cadastrados
        if (petsCadastrados.length === 0) {
          throw new Error("Nenhum pet foi cadastrado com sucesso. Verifique o console para detalhes.");
        }

        // === FINANCEIRO (usa o 1º pet) ===
        const payloadFinanceiro = {
          id_pet: petsCadastrados[0],
          nome_tutor: dadosTutor.nome_tutor,
          email_tutor: dadosTutor.email_tutor,
          cpf_tutor: dadosTutor.cpf_tutor,
          whatsapp_tutor: dadosTutor.whatsapp_tutor,
          plano, periodo, qtd_pets: qtd, valor_total: valor,
          forma_pagamento: "Boleto",
        };

        console.log("💰 Enviando dados financeiros...");
        const resFinanceiro = await fetch(WEBHOOK_FINANCEIRO, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadFinanceiro),
        });

        const jsonFin = await resFinanceiro.json().catch(() => ({}));
        console.log("💰 Retorno financeiro:", jsonFin);

        const linkPagamento = jsonFin?.body?.payment_link || jsonFin?.payment_link || null;

        if (linkPagamento) {
          msg.textContent = "✅ Cadastro concluído! Redirecionando para o pagamento...";
          msg.style.color = "green";
          setTimeout(() => { window.location.href = linkPagamento; }, 1500);
        } else {
          msg.textContent = "✅ Cadastro concluído, mas o link de pagamento não foi gerado. Entraremos em contato.";
          msg.style.color = "orange";
        }

        formCadastro.reset();
        if (typeof atualizarBlocosPets === 'function') {
            // Chama a função para resetar a interface para o estado inicial
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

  // ====== ESTILO DO LOADING ======
  const style = document.createElement("style");
  style.innerHTML = `
    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #c38e3d;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      animation: spin 1s linear infinite;
      display: inline-block;
      margin-right: 6px;
      vertical-align: middle;
    }
    @keyframes spin { 0% {transform: rotate(0)} 100% {transform: rotate(360deg)} }
  `;
  document.head.appendChild(style);

  console.log("✅ AcheiMeuPet — cadastro.js carregado com sucesso.");
});
