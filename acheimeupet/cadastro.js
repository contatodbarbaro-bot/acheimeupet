// =============================================
// CADASTRO ACHEIMEUPET — FINAL COM REDIRECIONAMENTO AUTOMÁTICO (CORRIGIDO DEFINITIVO)
// =============================================

// ====== ENDPOINTS ======
const WEBHOOK_CADASTRO =
  "https://webhook.fiqon.app/webhook/a029be45-8a23-418e-93e3-33f9b620a944/3e1595ab-b587-499b-a640-a8fe46b2d0c6";
const WEBHOOK_FINANCEIRO =
  "https://webhook.fiqon.app/webhook/a037678d-0bd4-48a8-886a-d75537cfb146/4befe9a8-596a-41c2-8b27-b1ba57d0b130";

// ====== ELEMENTOS DO FORMULÁRIO ======
const formCadastro = document.getElementById("form-cadastro");
const campoPlano = document.getElementById("tipo_plano");
const campoPeriodo = document.getElementById("periodo");
const campoQtdPets = document.getElementById("campo_qtd_pets");
const inputQtdPets = document.getElementById("qtd_pets");
const valorExibido = document.getElementById("valor_exibido");
const loading = document.getElementById("loading");

// ====== EVENTOS ======
if (campoPlano) campoPlano.addEventListener("change", atualizarValor);
if (campoPeriodo) campoPeriodo.addEventListener("change", atualizarValor);
if (inputQtdPets) inputQtdPets.addEventListener("input", atualizarValor);

// === FUNÇÃO PARA ATUALIZAR O VALOR ===
function atualizarValor() {
  const plano = campoPlano?.value || "";
  const periodo = campoPeriodo?.value || "";
  const qtd = parseInt(inputQtdPets?.value) || 1;

  if (plano === "familia") {
    campoQtdPets.style.display = "block";
  } else {
    campoQtdPets.style.display = "none";
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
}

// === ENVIO DO FORMULÁRIO ===
if (formCadastro) {
  formCadastro.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = document.getElementById("botao-enviar");
    const msg = document.getElementById("mensagem");

    // Desativa botão e mostra loading
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> Enviando...`;
    loading.style.display = "block";
    msg.textContent = "";

    try {
      // === COLETA DOS DADOS ===
      const formData = new FormData(formCadastro);
      const data = Object.fromEntries(formData.entries());

      const plano = campoPlano.value;
      const periodo = campoPeriodo.value;
      const qtd = parseInt(inputQtdPets.value) || 1;
      let valor = 0;

      if (plano === "individual") {
        valor = periodo === "mensal" ? 24.9 : 249.9;
      } else if (plano === "familia") {
        valor = periodo === "mensal" ? 19.9 * qtd : 199.0 * qtd;
      }

      data.plano = plano;
      data.periodo = periodo;
      data.qtd_pets = qtd;
      data.valor_total = valor;

      // === Validação obrigatória (CORRIGIDA) ===
      for (const [campo, valorCampo] of Object.entries(data)) {
        const deveVerificar = !["qtd_pets", "valor_total", "periodo", "plano"].includes(campo);
        if (deveVerificar) {
          if (
            valorCampo === undefined ||
            valorCampo === null ||
            (typeof valorCampo === "string" && !valorCampo.trim())
          ) {
            msg.textContent = `⚠️ O campo "${campo}" é obrigatório.`;
            msg.style.color = "red";
            btn.disabled = false;
            btn.innerHTML = "🐾 Enviar cadastro";
            loading.style.display = "none";
            return;
          }
        }
      }

      // === Foto obrigatória em base64 ===
      const fileInput = document.getElementById("foto_pet");
      const file = fileInput.files[0];
      if (!file) {
        msg.textContent = "⚠️ A foto do pet é obrigatória.";
        msg.style.color = "red";
        btn.disabled = false;
        btn.innerHTML = "🐾 Enviar cadastro";
        loading.style.display = "none";
        return;
      }
      data.foto_pet = await toBase64(file);

      // === 1️⃣ Envio ao FIQON — Cadastro Pet ===
      const resCadastro = await fetch(WEBHOOK_CADASTRO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const jsonCadastro = await resCadastro.json();
      console.log("Retorno cadastro:", jsonCadastro);

      // ✅ CAPTURA CORRIGIDA DO ID_PET
      const id_pet =
        jsonCadastro?.result?.id_pet ||
        jsonCadastro?.body?.result?.id_pet ||
        jsonCadastro?.data?.result?.id_pet ||
        jsonCadastro?.id_pet ||
        null;

      if (!resCadastro.ok || !id_pet) {
        console.error("Retorno cadastro:", jsonCadastro);
        throw new Error("Erro no cadastro do pet.");
      }

      // === 2️⃣ Envio ao FIQON — Financeiro (Asaas) ===
      const payloadFinanceiro = {
        id_pet,
        nome_tutor: data.nome_tutor,
        email_tutor: data.email_tutor,
        cpf_tutor: data.cpf_tutor,
        whatsapp_tutor: data.whatsapp_tutor,
        plano,
        periodo,
        qtd_pets: qtd,
        valor_total: valor,
        forma_pagamento: "Boleto",
      };

      const resFinanceiro = await fetch(WEBHOOK_FINANCEIRO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFinanceiro),
      });

      const jsonFin = await resFinanceiro.json();
      console.log("Retorno financeiro:", jsonFin);

      // === 3️⃣ Redirecionamento Automático ===
      const linkPagamento =
        jsonFin?.body?.payment_link || jsonFin?.payment_link || null;

      if (linkPagamento) {
        msg.textContent =
          "✅ Cadastro concluído! Redirecionando para o pagamento...";
        msg.style.color = "green";
        setTimeout(() => {
          window.location.href = linkPagamento;
        }, 1500);
      } else {
        console.warn("Retorno financeiro:", jsonFin);
        msg.textContent =
          "⚠️ Cadastro concluído, mas o link de pagamento não foi gerado automaticamente.";
        msg.style.color = "orange";
      }

      // === RESET VISUAL ===
      formCadastro.reset();
      atualizarValor();

    } catch (erro) {
      console.error("Erro no envio:", erro);
      msg.textContent = "❌ Ocorreu um erro ao enviar o cadastro. Tente novamente.";
      msg.style.color = "red";
    } finally {
      loading.style.display = "none";
      btn.disabled = false;
      btn.innerHTML = "🐾 Enviar cadastro";
    }
  });
}

// === FUNÇÃO AUXILIAR PARA BASE64 ===
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

// === ESTILO DO LOADING GIRATÓRIO (spinner inline) ===
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
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`;
document.head.appendChild(style);
