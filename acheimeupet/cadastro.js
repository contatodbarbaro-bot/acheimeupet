// ====== ENDPOINTS ======
const WEBHOOK_CADASTRO =
  "https://webhook.fiqon.app/webhook/a029be45-8a23-418e-93e3-33f9b620a944/3e1595ab-b587-499b-a640-a8fe46b2d0c6";
const WEBHOOK_FINANCEIRO =
  "https://webhook.fiqon.app/webhook/a037678d-0bd4-48a8-886a-d75537cfb146/4befe9a8-596a-41c2-8b27-b1ba57d0b130";

const formCadastro = document.getElementById("form-cadastro");
const campoPlano = document.getElementById("tipo_plano");
const campoPeriodo = document.getElementById("periodo");
const campoQtdPets = document.getElementById("campo_qtd_pets");
const inputQtdPets = document.getElementById("qtd_pets");
const valorExibido = document.getElementById("valor_exibido");

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

    const btn = formCadastro.querySelector('button[type="submit"]');
    const msg = document.getElementById("mensagem");
    btn.disabled = true;
    btn.innerText = "Enviando...";
    msg.textContent = "";

    try {
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

      // foto em base64
      const fileInput = document.getElementById("foto_pet");
      if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        data.foto_pet = await toBase64(file);
      }

      // === 1️⃣ Envio ao FIQON — Cadastro Pet ===
      const resCadastro = await fetch(WEBHOOK_CADASTRO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const jsonCadastro = await resCadastro.json();

      // aceita diferentes formatos de retorno
      const id_pet =
        jsonCadastro.body?.id_pet ||
        jsonCadastro.id_pet ||
        jsonCadastro.result?.id_pet ||
        null;

      if (!resCadastro.ok || !id_pet) {
        console.error("Retorno cadastro:", jsonCadastro);
        throw new Error("Erro no cadastro do pet.");
      }

      // === 2️⃣ Envio ao FIQON — Financeiro (Asaas)
      const payloadFinanceiro = {
        id_pet,
        nome_tutor: data.nome_tutor,
        email_tutor: data.email_tutor,
        cpf_tutor: data.cpf_tutor,
        // 🔧 ALTERAÇÃO ÚNICA: alinhar com o Fiqon (whatsapp_tutor)
        whatsapp_tutor: data.whatsapp_tutor,
        plano,
        periodo,
        qtd_pets: qtd,
        valor_total: valor,
        forma_pagamento: "Boleto"
      };

      const resFinanceiro = await fetch(WEBHOOK_FINANCEIRO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFinanceiro),
      });

      const jsonFin = await resFinanceiro.json();

      if (jsonFin?.body?.payment_link || jsonFin?.payment_link) {
        const linkPagamento = jsonFin.body?.payment_link || jsonFin.payment_link;
        msg.textContent = "Redirecionando para o pagamento...";
        window.open(linkPagamento, "_blank");
      } else {
        console.warn("Retorno financeiro:", jsonFin);
        alert("Cadastro concluído, mas o link de pagamento não foi gerado automaticamente.");
      }

      // === RESET ===
      btn.innerText = "🐾 Enviar cadastro";
      formCadastro.reset();
      atualizarValor();
      msg.textContent = "✅ Cadastro enviado com sucesso!";
    } catch (erro) {
      console.error("Erro no envio:", erro);
      msg.textContent = "❌ Ocorreu um erro ao enviar o cadastro.";
    } finally {
      btn.disabled = false;
      btn.innerText = "🐾 Enviar cadastro";
    }
  });
}

// === FUNÇÃO AUXILIAR ===
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
