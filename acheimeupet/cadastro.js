// ===============================================================
// 🐾 AcheiMeuPet — Cadastro.js Versão FINAL (2025)
// ===============================================================
// • CÓDIGO COMPLETO E FIEL AO ORIGINAL
// • ÚNICA MUDANÇA: validação ajustada para json.result.link_pagamento
// ===============================================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("🐾 AcheiMeuPet: Script FINAL (Completo) carregado.");

  // ============================
  // 🔐 TOKEN DE ORIGEM E WEBHOOKS
  // ============================
  const urlParams = new URLSearchParams(window.location.search);
  const temToken = urlParams.has("token");
  const tokenParam = urlParams.get("token") || "";

  const WEBHOOK_PAGO =
    "https://webhook.fiqon.app/webhook/a029be45-8a23-418e-93e3-33f9b620a944/3e1595ab-b587-499b-a640-a8fe46b2d0c6";

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
  // 🧱 GERAR BLOCOS DE PET COM REHIDRATAÇÃO
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
        <select name="especie_${i}` + `" required>
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
  // 💰 ATUALIZAR VALOR
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
    if (plano === "individual") valor = per === "mensal" ? 24.9 : 249.9;
    else valor = per === "mensal" ? 19.9 * qtd : 199 * qtd;

    valorLabel.textContent = `Valor total: R$ ${valor
      .toFixed(2)
      .replace(".", ",")}`;
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

        let valor = 0;
        if (!temToken) {
          if (plano === "individual") valor = per === "mensal" ? 24.9 : 249.9;
          else valor = per === "mensal" ? 19.9 * qtd : 199 * qtd;
        }

        const pets = [];
        for (let i = 1; i <= qtd; i++) {
          const nome = fd.get(`nome_pet_${i}`);
          const esp = fd.get(`especie_${i}`);
          const raca = fd.get(`raca_${i}`);
          const sexo = fd.get(`sexo_${i}`);
          const ano = fd.get(`ano_nasc_${i}`);
          const file = fd.get(`foto_pet_${i}`);

          if (!file) {
            throw new Error(`A foto do Pet ${i} é obrigatória.`);
          }

          const base64 = await new Promise((res, rej) => {
            const reader = new FileReader();
            reader.onload = () => res(reader.result);
            reader.onerror = rej;
            reader.readAsDataURL(file);
          });

          pets.push({
            nome_pet: nome,
            especie: esp,
            raca,
            sexo,
            ano_nascimento: ano,
            foto_pet: base64,
          });
        }

        const payload = {
          ...tutor,
          plano: temToken ? "Free" : plano,
          periodo: temToken ? "" : per,
          qtd_pets: qtd,
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
          throw new Error("Erro de comunicação com o servidor.");
        }

        console.log("📦 Retorno Fiqon:", json);

        if (!req.ok) {
          throw new Error(
            json?.mensagem || json?.message || "Erro ao processar assinatura."
          );
        }

        // ============================================================
        // ⭐ VALIDAÇÃO CORRIGIDA — LENDO json.result.link_pagamento
        // ============================================================
        if (!temToken) {
          const linkPagamento = json?.result?.link_pagamento || null;

          if (!linkPagamento) {
            console.error("❌ Link não encontrado no retorno:", json);
            throw new Error(
              "Erro ao finalizar a assinatura. Tente novamente mais tarde."
            );
          }

          msg.style.color = "green";
          msg.textContent =
            "✅ Cadastro recebido! Redirecionando para o pagamento...";

          setTimeout(() => {
            window.location.href = linkPagamento;
          }, 2000);
        } else {
          msg.style.color = "green";
          msg.textContent = "✅ Cadastro concluído!";
        }

        localStorage.removeItem("form_state");
        form.reset();
        tipoPlano.value = "";
        atualizarBlocosPets();
      } catch (err) {
        console.error("❌ Erro no envio", err);
        msg.style.color = "red";
        msg.textContent = "❌ " + err.message;
      } finally {
        botao.disabled = false;
        botao.innerHTML = "🐾 Enviar cadastro";
        loading.style.display = "none";
      }
    });
  }

  // ==================================================
  // EVENTOS
  // ==================================================
  tipoPlano.addEventListener("change", () => {
    salvarState();
    atualizarBlocosPets();
  });

  periodo.addEventListener("change", () => {
    salvarState();
    atualizarValor();
  });

  qtdPetsInput.addEventListener("input", () => {
    salvarState();
    atualizarBlocosPets();
  });

  carregarState();
  atualizarBlocosPets();
});
