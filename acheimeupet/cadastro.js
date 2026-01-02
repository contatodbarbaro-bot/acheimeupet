// ===============================================================
// 🐾 AcheiMeuPet — Cadastro.js VERSÃO FINALÍSSIMA (COMPLETO)
// ===============================================================
// • CÓDIGO COMPLETO E FIEL AO ORIGINAL.
// • AJUSTADO: Redirecionamento direto para os links do Asaas conforme plano escolhido.
// • CORRIGIDO: VALORES NOVOS
//   - Individual: 19,90 (mensal) | 199,90 (anual)
//   - Família: 14,90/mês por pet | 149,90/ano por pet (mínimo 2 pets)
// • OTIMIZAÇÃO: Compressão agressiva de imagem para reduzir o payload Base64.
// ===============================================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("🐾 AcheiMeuPet: Script FINALÍSSIMA (Completo) carregado.");

  // ============================
  // 🔐 TOKEN DE ORIGEM E WEBHOOKS
  // ============================
  const urlParams = new URLSearchParams(window.location.search);
  const temToken = urlParams.has("token");
  const tokenParam = urlParams.get("token") || "";

  const WEBHOOK_PAGO =
    "https://webhook.fiqon.app/webhook/019ae12c-0d88-703f-8112-83a3069621e3/83e227af-cbed-43ee-974d-c9603f589a29";
  const WEBHOOK_FREE =
    "https://webhook.fiqon.app/webhook/019a781c-15f8-738a-93bc-5b70388445ff/faee836c-d909-4b6b-96d0-ed6433640060";
  const WEBHOOK_CADASTRO = temToken ? WEBHOOK_FREE : WEBHOOK_PAGO;

  console.log(`📡 Modo detectado: ${temToken ? "FREE" : "PAGO"}`);

  // ==================================================
  // 📌 ELEMENTOS DO DOM
  // ==================================================
  const form = document.getElementById("form-cadastro");
  const tipoPlano = document.getElementById("tipo_plano");
  const periodo = document.getElementById("periodo");
  const qtdPetsInput = document.getElementById("qtd_pets");
  const campoQtdPets = document.getElementById("campo_qtd_pets");
  const areaPets = document.getElementById("area-pets");
  const msg = document.getElementById("mensagem");
  const loading = document.getElementById("loading");
  const valorLabel = document.getElementById("valor_exibido");
  const botao = document.getElementById("botao-enviar");

  // ==================================================
  // 💰 TABELA DE PREÇOS (NOVA)
  // ==================================================
  const PRECOS = {
    individual: { mensal: 19.9, anual: 199.9 },
    familia: { mensal_por_pet: 14.9, anual_por_pet: 149.9 },
  };

  // ==================================================
  // 📦 MEMÓRIA LOCAL (STATE)
  // ==================================================
  function salvarState() {
    const data = new FormData(form);
    const obj = {};
    for (const [key, val] of data.entries()) {
      if (key.includes("foto_pet")) continue;
      obj[key] = val;
    }
    localStorage.setItem("form_state", JSON.stringify(obj));
  }

  function carregarState() {
    const state = localStorage.getItem("form_state");
    if (!state) return;
    const obj = JSON.parse(state);
    for (const key in obj) {
      const el = form.querySelector(`[name="${key}"]`);
      if (el) el.value = obj[key];
    }
  }

  // ==================================================
  // 🧱 GERAR BLOCOS DE PET
  // ==================================================
  function gerarBlocoPet(i) {
    const state = JSON.parse(localStorage.getItem("form_state") || "{}");
    const nome = state[`nome_pet_${i}`] || "";
    const especie = state[`especie_${i}`] || "";
    const raca = state[`raca_${i}`] || "";
    const sexo = state[`sexo_${i}`] || "";
    const ano = state[`ano_nasc_${i}`] || "";
    return `
      <div class="pet-group" id="bloco_pet_${i}">
        <h4>🐾 Pet ${i}</h4>
        <label>Nome do pet *</label>
        <input type="text" name="nome_pet_${i}" value="${nome}" required />
        <label>Espécie *</label>
        <select name="especie_${i}" required>
          <option value="">Selecione</option>
          <option value="Cachorro" ${especie === "Cachorro" ? "selected" : ""}>Cachorro</option>
          <option value="Gato" ${especie === "Gato" ? "selected" : ""}>Gato</option>
          <option value="Outros" ${especie === "Outros" ? "selected" : ""}>Outros</option>
        </select>
        <label>Raça *</label>
        <input type="text" name="raca_${i}" value="${raca}" required />
        <label>Sexo *</label>
        <select name="sexo_${i}" required>
          <option value="">Selecione</option>
          <option value="Macho" ${sexo === "Macho" ? "selected" : ""}>Macho</option>
          <option value="Fêmea" ${sexo === "Fêmea" ? "selected" : ""}>Fêmea</option>
        </select>
        <label>Ano de nascimento *</label>
        <input type="text" name="ano_nasc_${i}" maxlength="4" value="${ano}" required />
        <label>Foto do pet *</label>
        <input type="file" name="foto_pet_${i}" accept="image/*" required />
      </div>
    `;
  }

  // ==================================================
  // 🔁 ATUALIZAR BLOCOS DE PET
  // ==================================================
  function atualizarBlocosPets() {
    const plano = tipoPlano.value;
    let qtd = 1;

    if (plano === "familia") {
      campoQtdPets.style.display = "block";
      qtd = parseInt(qtdPetsInput.value) || 2;
      if (qtd < 2) qtd = 2;
      qtdPetsInput.value = qtd;
    } else {
      campoQtdPets.style.display = "none";
      qtd = 1;
      qtdPetsInput.value = 1;
    }

    areaPets.innerHTML = "";
    for (let i = 1; i <= qtd; i++) {
      areaPets.innerHTML += gerarBlocoPet(i);
    }
    atualizarValor();
  }

  // ==================================================
  // 💰 ATUALIZAR VALOR (NOVO)
  // ==================================================
  function atualizarValor() {
    const plano = tipoPlano.value;
    const per = periodo.value;
    const qtd = parseInt(qtdPetsInput.value) || 1;

    if (!plano || !per) {
      valorLabel.textContent = "Selecione o plano para ver o valor";
      return;
    }

    let valor = 0;

    if (plano === "individual") {
      valor = per === "mensal" ? PRECOS.individual.mensal : PRECOS.individual.anual;
    } else {
      const qtdFamilia = Math.max(qtd, 2);
      valor = per === "mensal"
        ? qtdFamilia * PRECOS.familia.mensal_por_pet
        : qtdFamilia * PRECOS.familia.anual_por_pet;
    }

    valorLabel.textContent = `Valor total: R$ ${valor.toFixed(2).replace(".", ",")}`;
  }

  // ==================================================
  // 🖼️ COMPRESSÃO AGRESSIVA DE IMAGEM
  // ==================================================
  function comprimirImagem(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = height * (MAX_WIDTH / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const base64 = canvas.toDataURL("image/jpeg", 0.6);
          resolve(base64);
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ==================================================
  // 🚀 ENVIO DO FORMULÁRIO
  // ==================================================
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.textContent = "";
      loading.style.display = "block";
      botao.disabled = true;
      botao.innerHTML = `⏳ Enviando...`;

      salvarState();

      try {
        const fd = new FormData(form);

        const tutor = {
          nome_tutor: fd.get("nome_tutor"),
          cpf_tutor: fd.get("cpf_tutor"),
          email_tutor: fd.get("email_tutor"),
          whatsapp_tutor: fd.get("whatsapp_tutor"),
          cidade: fd.get("cidade"),
          uf: fd.get("uf"),
          endereco: fd.get("endereco"),
          cep: fd.get("cep"),
          obs: fd.get("obs"),
        };

        const plano = tipoPlano.value;
        const per = periodo.value;
        const qtd = parseInt(qtdPetsInput.value) || 1;

        // ============================
        // 💰 VALOR TOTAL (NOVO)
        // ============================
        let valor = 0;
        if (!temToken) {
          if (plano === "individual") {
            valor = per === "mensal" ? PRECOS.individual.mensal : PRECOS.individual.anual;
          } else {
            const qtdFamilia = Math.max(qtd, 2);
            valor = per === "mensal"
              ? qtdFamilia * PRECOS.familia.mensal_por_pet
              : qtdFamilia * PRECOS.familia.anual_por_pet;
          }
        }

        const pets = [];
        for (let i = 1; i <= qtd; i++) {
          const nome = fd.get(`nome_pet_${i}`);
          const esp = fd.get(`especie_${i}`);
          const raca = fd.get(`raca_${i}`);
          const sexo = fd.get(`sexo_${i}`);
          const ano = fd.get(`ano_nasc_${i}`);
          const file = fd.get(`foto_pet_${i}`);

          if (!file || file.size === 0) {
            throw new Error(`A foto do Pet ${i} é obrigatória.`);
          }

          msg.textContent = `⏳ Comprimindo foto do Pet ${i}...`;
          const foto_base64 = await comprimirImagem(file);
          msg.textContent = `⏳ Enviando dados...`;

          pets.push({
            nome_pet: nome,
            especie: esp,
            raca,
            sexo,
            ano_nascimento: ano,
            foto_pet: foto_base64,
          });
        }

        const payload = {
          ...tutor,
          plano: temToken ? "Free" : plano,
          periodo: temToken ? "" : per,
          qtd_pets: plano === "familia" ? Math.max(qtd, 2) : 1,
          valor_total: temToken ? 0 : valor,
          origem_cadastro: temToken ? "free_site" : "assinatura_site",
          token_origem: tokenParam,
          pets,
        };

        console.log("📤 Enviando para Fiqon:", payload);

        const req = await fetch(WEBHOOK_CADASTRO, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const responseText = await req.text();
        let json;
        try {
          json = JSON.parse(responseText);
        } catch (e) {
          console.error("Fiqon não retornou um JSON válido. Resposta:", responseText);
          throw new Error("Ocorreu um erro de comunicação com o servidor. Tente novamente.");
        }

        console.log("📦 Retorno Fiqon (parseado):", json);

        if (!req.ok) {
          throw new Error(
            json?.body?.link_pagamento ||
              json?.message ||
              json?.error ||
              `Erro no servidor (HTTP ${req.status})`
          );
        }

        // Se o Fiqon retornar um link de pagamento, redirecionar para ele.
        if (json?.link_pagamento) {
          window.location.href = json.link_pagamento;
          return;
        }

        // ✅ SUCESSO
        msg.style.color = "green";
        msg.textContent =
          "Cadastro concluído! Seu pet(s) está(ão) protegido(s)! Verifique seu e-mail para o link de pagamento.";

        form.reset();
        localStorage.removeItem("form_state");
        tipoPlano.value = "individual";
        periodo.value = "mensal";
        qtdPetsInput.value = 1;
        atualizarBlocosPets();
      } catch (error) {
        console.error("Erro do envio:", error);
        msg.style.color = "red";
        msg.textContent = "Erro no envio: " + error.message;
      } finally {
        botao.disabled = false;
        botao.innerHTML = `🐾 Enviar cadastro`;
        loading.style.display = "none";
      }
    });
  }

  // ==================================================
  // ⚡ EVENTOS
  // ==================================================
  tipoPlano.addEventListener("change", atualizarBlocosPets);
  periodo.addEventListener("change", atualizarValor);
  qtdPetsInput.addEventListener("change", atualizarBlocosPets);
  form.addEventListener("input", salvarState);

  // Inicialização
  carregarState();
  atualizarBlocosPets();
});
