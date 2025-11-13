// ===============================================
// 🐾 AcheiMeuPet — Cadastro.js Versão PRO (2025)
// ===============================================
//
// Reforçado, otimizado e totalmente compatível
// com fluxos Fiqon, múltiplos pets, base64 e tokens.
// ===============================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("🐾 AcheiMeuPet: Script de cadastro PRO carregado.");

  // -----------------------------
  // 🔐 Captura token da URL
  // -----------------------------
  const urlParams = new URLSearchParams(window.location.search);
  const temToken = urlParams.has("token");
  const tokenParam = urlParams.get("token") || "";

  // -----------------------------
  // 🌐 Webhooks oficiais
  // -----------------------------
  const WEBHOOK_PAGO =
    "https://webhook.fiqon.app/webhook/a029be45-8a23-418e-93e3-33f9b620a944/3e1595ab-b587-499b-a640-a8fe46b2d0c6";
  const WEBHOOK_FREE =
    "https://webhook.fiqon.app/webhook/019a781c-15f8-738a-93bc-5b70388445ff/faee836c-d909-4b6b-96d0-ed6433640060";

  const WEBHOOK_CADASTRO = temToken ? WEBHOOK_FREE : WEBHOOK_PAGO;

  console.log(`📡 Modo detectado: ${temToken ? "FREE" : "PAGO"}`);

  // -----------------------------------------
  // 📌 Seletores do DOM
  // -----------------------------------------
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

  // =====================================================
  // 🧱 FUNÇÃO — Gera bloco de campos para cada pet
  // =====================================================
  function gerarBlocoPet(i) {
    return `
      <div class="pet-group" id="bloco_pet_${i}">
        <h4>🐾 Pet ${i}</h4>

        <label>Nome do pet *</label>
        <input type="text" name="nome_pet_${i}" required />

        <label>Espécie *</label>
        <select name="especie_${i}" required>
          <option value="">Selecione</option>
          <option value="Cachorro">Cachorro</option>
          <option value="Gato">Gato</option>
          <option value="Outros">Outros</option>
        </select>

        <label>Raça *</label>
        <input type="text" name="raca_${i}" required />

        <label>Sexo *</label>
        <select name="sexo_${i}" required>
          <option value="">Selecione</option>
          <option value="Macho">Macho</option>
          <option value="Fêmea">Fêmea</option>
        </select>

        <label>Ano de nascimento (AAAA) *</label>
        <input type="text" name="ano_nasc_${i}" maxlength="4" required />

        <label>Foto do pet *</label>
        <input type="file" name="foto_pet_${i}" accept="image/*" required />
      </div>
    `;
  }

  // =====================================================
  // 🔁 Atualiza blocos de pets dinamicamente
  // =====================================================
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

  // =====================================================
  // 💰 Atualiza o valor do plano
  // =====================================================
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
      valor = per === "mensal" ? 24.9 : 249.9;
    } else if (plano === "familia") {
      valor = per === "mensal" ? 19.9 * qtd : 199 * qtd;
    }

    valorLabel.textContent = `Valor total: R$ ${valor
      .toFixed(2)
      .replace(".", ",")}`;
  }

  // =====================================================
  // 🖼 Converte foto em Base64 com Promise
  // =====================================================
  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // =====================================================
  // 🚀 ENVIO DO FORMULÁRIO
  // =====================================================
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.textContent = "";
      loading.style.display = "block";

      botao.disabled = true;
      botao.innerHTML = `<span class="spinner"></span> Enviando...`;

      try {
        const fd = new FormData(form);

        // DADOS DO TUTOR
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

        // VALOR FINAL
        let valor = 0;
        if (!temToken) {
          if (plano === "individual") {
            valor = per === "mensal" ? 24.9 : 249.9;
          } else if (plano === "familia") {
            valor = per === "mensal" ? 19.9 * qtd : 199 * qtd;
          }
        }

        // -----------------------------------------------------
        // 🐾 COLETAR PETS (com garantia de foto obrigatória)
        // -----------------------------------------------------
        const pets = [];
        for (let i = 1; i <= qtd; i++) {
          const nome_pet = fd.get(`nome_pet_${i}`);
          const especie = fd.get(`especie_${i}`);
          const raca = fd.get(`raca_${i}`);
          const sexo = fd.get(`sexo_${i}`);
          const ano = fd.get(`ano_nasc_${i}`);
          const fotoFile = fd.get(`foto_pet_${i}`);

          if (!nome_pet || !especie || !raca || !sexo || !ano) {
            throw new Error(`Preencha todos os campos do Pet ${i}.`);
          }

          if (!fotoFile || fotoFile.size === 0) {
            throw new Error(`A foto do Pet ${i} é obrigatória.`);
          }

          if (fotoFile.size > 1024 * 1024) {
            throw new Error(
              `A foto do Pet ${i} excede o limite de 1MB. Selecione outra.`
            );
          }

          const foto_pet = await toBase64(fotoFile);

          pets.push({
            nome_pet,
            especie,
            raca,
            sexo,
            ano_nascimento: ano,
            foto_pet,
          });
        }

        // -----------------------------------------------------
        // 📦 MONTA O PAYLOAD FINAL
        // -----------------------------------------------------
        const payload = {
          ...tutor,
          plano: temToken ? "Free" : plano,
          periodo: temToken ? "" : per,
          qtd_pets: qtd,
          valor_total: temToken ? 0 : valor,
          origem_cadastro: temToken ? "free_site" : "assinatura_site",
          token_origem: tokenParam,
          pets: pets,
        };

        console.log("📤 Enviando para Fiqon:", payload);

        // -----------------------------------------------------
        // 🌐 ENVIO PARA O FIQON
        // -----------------------------------------------------
        const req = await fetch(WEBHOOK_CADASTRO, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = await req.json().catch(() => ({}));

        console.log("📦 Retorno Fiqon:", json);

        // -----------------------------------------------------
        // 📩 TRATAMENTO DE RESPOSTA
        // -----------------------------------------------------
        if (!req.ok) {
          throw new Error(
            json?.message ||
              `Erro na comunicação com o servidor (HTTP ${req.status}).`
          );
        }

        // FREE
        if (temToken) {
          msg.style.color = "green";
          msg.textContent =
            "✅ Cadastro concluído! Seu(s) pet(s) está(ão) protegido(s).";
        }

        // PAGO
        else {
          const lista = json?.pets_cadastrados || [];
          const link = json?.link_pagamento;

          if (lista.length === 0) {
            throw new Error("Nenhum pet foi cadastrado.");
          }

          msg.style.color = "green";
          msg.textContent = `✅ ${lista.length} pet(s) cadastrado(s)! Redirecionando...`;

          if (link) {
            setTimeout(() => (window.location.href = link), 1500);
          }
        }

        form.reset();
        tipoPlano.value = "";
        atualizarBlocosPets();

      } catch (err) {
        console.error("❌ Erro no envio", err);
        msg.style.color = "red";
        msg.textContent = `❌ ${err.message}`;
      } finally {
        botao.disabled = false;
        botao.innerHTML = "🐾 Enviar cadastro";
        loading.style.display = "none";
      }
    });
  }

  // =====================================================
  // 📌 EVENTOS
  // =====================================================
  tipoPlano.addEventListener("change", atualizarBlocosPets);
  qtdPetsInput.addEventListener("input", atualizarBlocosPets);
  periodo.addEventListener("change", atualizarValor);

  atualizarBlocosPets(); // carregamento inicial
});
