<script>
// =============================================
// CADASTRO ACHEIMEUPET — VERSÃO ROBUSTA (multipets + CEP)
// =============================================

document.addEventListener("DOMContentLoaded", () => {
  console.log("🐾 AcheiMeuPet: Script de cadastro iniciado.");

  // ====== ENDPOINTS ======
  const WEBHOOK_CADASTRO =
    "https://webhook.fiqon.app/webhook/a029be45-8a23-418e-93e3-33f9b620a944/3e1595ab-b587-499b-a640-a8fe46b2d0c6";
  const WEBHOOK_FINANCEIRO =
    "https://webhook.fiqon.app/webhook/a037678d-0bd4-48a8-886a-d75537cfb146/4befe9a8-596a-41c2-8b27-b1ba57d0b130";

  // ====== ELEMENTOS DO FORMULÁRIO ======
  const formCadastro   = document.getElementById("form-cadastro");
  const campoPlano     = document.getElementById("tipo_plano");
  const campoPeriodo   = document.getElementById("periodo");
  const campoQtdPets   = document.getElementById("campo_qtd_pets");
  const inputQtdPets   = document.getElementById("qtd_pets");
  const valorExibido   = document.getElementById("valor_exibido");
  const loading        = document.getElementById("loading");
  const areaPets       = document.getElementById("area-pets");

  // ====== BLOCOS DE PET DINÂMICOS ======
  function atualizarBlocosPets() {
    const plano = campoPlano.value;
    let qtd = 1;

    if (plano === "familia") {
      campoQtdPets.style.display = "block";
      qtd = parseInt(inputQtdPets.value) || 2;
      if (qtd < 2) qtd = 2;
      inputQtdPets.setAttribute("min", "2");
      inputQtdPets.setAttribute("required", "required");
    } else {
      campoQtdPets.style.display = "none";
      qtd = 1;
      inputQtdPets.value = 1;
      inputQtdPets.removeAttribute("min");
      inputQtdPets.removeAttribute("required");
    }

    areaPets.innerHTML = "";
    for (let i = 1; i <= qtd; i++) {
      areaPets.innerHTML += `
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
        </div>`;
    }
  }

  // ====== VALOR DO PLANO ======
  function atualizarValor() {
    const plano   = campoPlano?.value || "";
    const periodo = campoPeriodo?.value || "";
    const qtd     = parseInt(inputQtdPets?.value) || 1;

    if (plano === "familia") {
      campoQtdPets.style.display = "block";
      inputQtdPets.setAttribute("min", "2");
      inputQtdPets.setAttribute("required", "required");
    } else {
      campoQtdPets.style.display = "none";
      inputQtdPets.removeAttribute("min");
      inputQtdPets.removeAttribute("required");
    }

    let valor = 0;
    if (plano && periodo) {
      if (plano === "individual") {
        valor = periodo === "mensal" ? 24.9 : 249.9;
      } else if (plano === "familia") {
        valor = periodo === "mensal" ? 19.9 * qtd : 199.0 * qtd;
      }
      valorExibido.textContent = `Valor total: R$ ${valor.toFixed(2)}`;
    } else {
      valorExibido.textContent = "Selecione o plano para ver o valor";
    }

    atualizarBlocosPets();
  }

  if (campoPlano)   campoPlano.addEventListener("change", atualizarValor);
  if (campoPeriodo) campoPeriodo.addEventListener("change", atualizarValor);
  if (inputQtdPets) inputQtdPets.addEventListener("input", atualizarValor);

  // ====== HELPER: FILE → BASE64 ======
  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload  = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  // ====== HELPER: TENTAR PEGAR id_pet EM QUALQUER FORMATO ======
  function extrairIdPetDoLink(link) {
    try {
      const url = new URL(link);
      return url.searchParams.get("id"); // "P1234567"
    } catch {
      return null;
    }
  }

  function pegarIdPetDaResposta(json) {
    // tenta todas as formas comuns…
    return (
      json?.id_pet ||
      json?.result?.id_pet ||
      json?.body?.id_pet ||
      json?.body?.result?.id_pet ||
      json?.data?.result?.id_pet ||
      null
    );
  }

  function pegarLinkDaResposta(json) {
    return (
      json?.link_pet ||
      json?.result?.link_pet ||
      json?.body?.link_pet ||
      json?.body?.result?.link_pet ||
      json?.data?.result?.link_pet ||
      null
    );
  }

  // ====== SUBMIT ======
  if (formCadastro) {
    formCadastro.addEventListener("submit", async (e) => {
      e.preventDefault();

      const btn = document.getElementById("botao-enviar");
      const msg = document.getElementById("mensagem");

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
          nome_tutor:     formData.get("nome_tutor"),
          cpf_tutor:      formData.get("cpf_tutor"),
          email_tutor:    formData.get("email_tutor"),
          whatsapp_tutor: formData.get("whatsapp_tutor"),
          cidade:         formData.get("cidade"),
          uf:             formData.get("uf"),
          endereco:       formData.get("endereco"),
          cep:            formData.get("cep"),
          obs:            formData.get("obs"),
        };

        const plano   = campoPlano.value;
        const periodo = campoPeriodo.value;
        const qtd     = plano === "familia" ? (parseInt(inputQtdPets.value) || 2) : 1;

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
          const especie  = formData.get(`especie_${i}`);
          const raca     = formData.get(`raca_${i}`);
          const sexo     = formData.get(`sexo_${i}`);
          const ano_nasc = formData.get(`ano_nasc_${i}`);
          const file     = formData.get(`foto_pet_${i}`);

          if (!nome_pet || !especie || !raca || !sexo || !ano_nasc || !file) {
            msg.textContent = `⚠️ Preencha todos os campos do Pet ${i}.`;
            msg.style.color = "red";
            btn.disabled = false;
            btn.innerHTML = "🐾 Enviar cadastro";
            loading.style.display = "none";
            return;
          }

          // limite de 1MB (evita falha no ImgBB)
          const MAX_FILE_SIZE = 1024 * 1024;
          if (file.size > MAX_FILE_SIZE) {
            msg.textContent = `⚠️ A foto do Pet ${i} é muito grande. O limite é 1MB.`;
            msg.style.color = "red";
            btn.disabled = false;
            btn.innerHTML = "🐾 Enviar cadastro";
            loading.style.display = "none";
            return;
          }

          const foto_pet = await toBase64(file);

          const payloadPet = {
            nome_pet, especie, raca, sexo,
            ano_nascimento: ano_nasc,
            foto_pet,
            ...dadosTutor,
            plano, periodo,
            qtd_pets: qtd,
            valor_total: valor,
          };

          console.log("📤 Enviando cadastro ao Fiqon:", payloadPet);
          const resCadastro = await fetch(WEBHOOK_CADASTRO, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payloadPet),
          });

          // Se o servidor realmente falhou (>=400), aí sim aborta
          if (!resCadastro.ok) {
            const txt = await resCadastro.text().catch(() => "");
            console.error("⚠️ HTTP falhou:", resCadastro.status, txt);
            throw new Error(`Falha HTTP ao cadastrar o Pet ${i}.`);
          }

          const jsonCadastro = await resCadastro.json().catch(() => ({}));
          console.log(`📦 Retorno cadastro Pet ${i}:`, jsonCadastro);

          // — pega id em qualquer lugar —
          let id_pet  = pegarIdPetDaResposta(jsonCadastro);
          let linkPet = pegarLinkDaResposta(jsonCadastro);

          // se não veio id, tenta extrair do link (?id=Pxxxxx)
          if (!id_pet && linkPet) {
            id_pet = extrairIdPetDoLink(linkPet);
          }

          // se ainda não veio, mas o server disse "ok", não derruba o fluxo:
          const statusOk =
            (jsonCadastro?.status || jsonCadastro?.result?.status || jsonCadastro?.body?.status) === "ok";

          if (!id_pet && !statusOk) {
            console.error("⚠️ Resposta sem id_pet e sem status=ok:", jsonCadastro);
            throw new Error(`Erro ao cadastrar o Pet ${i}.`);
          }

          if (id_pet) petsCadastrados.push(id_pet);

          // espaçamento entre pets (evita rate limit no ImgBB)
          await new Promise((r) => setTimeout(r, 1000));
        }

        // === FINANCEIRO (usa o 1º pet) ===
        const payloadFinanceiro = {
          id_pet: petsCadastrados[0] || null,
          nome_tutor: dadosTutor.nome_tutor,
          email_tutor: dadosTutor.email_tutor,
          cpf_tutor: dadosTutor.cpf_tutor,
          whatsapp_tutor: dadosTutor.whatsapp_tutor,
          plano, periodo, qtd_pets: qtd, valor_total: valor,
          forma_pagamento: "Boleto",
        };

        console.log("💰 Enviando dados financeiros:", payloadFinanceiro);

        const resFinanceiro = await fetch(WEBHOOK_FINANCEIRO, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadFinanceiro),
        });

        const jsonFin = await resFinanceiro.json().catch(() => ({}));
        console.log("💰 Retorno financeiro:", jsonFin);

        const linkPagamento =
          jsonFin?.body?.payment_link || jsonFin?.payment_link || null;

        if (linkPagamento) {
          msg.textContent =
            "✅ Cadastro concluído! Redirecionando para o pagamento...";
          msg.style.color = "green";
          setTimeout(() => { window.location.href = linkPagamento; }, 1500);
        } else {
          msg.textContent =
            "⚠️ Cadastro concluído, mas o link de pagamento não foi gerado automaticamente.";
          msg.style.color = "orange";
        }

        formCadastro.reset();
        atualizarValor();
      } catch (erro) {
        console.error("❌ Erro no envio:", erro);
        const msg = document.getElementById("mensagem");
        msg.textContent =
          "❌ Ocorreu um erro ao enviar o cadastro. Tente novamente.";
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
</script>
