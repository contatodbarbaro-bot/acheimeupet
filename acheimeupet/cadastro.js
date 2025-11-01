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

campoPlano.addEventListener("change", atualizarValor);
campoPeriodo.addEventListener("change", atualizarValor);
inputQtdPets.addEventListener("input", atualizarValor);

function atualizarValor() {
  const plano = campoPlano.value;
  const periodo = campoPeriodo.value;
  const qtd = parseInt(inputQtdPets.value) || 1;

  if (plano === "familia") campoQtdPets.style.display = "block";
  else campoQtdPets.style.display = "none";

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

// ============ ENVIO DO CADASTRO ============
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

      // adiciona dados do plano
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

      // foto para base64
      const fileInput = document.getElementById("foto_pet");
      if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        data.foto_pet = await toBase64(file);
      }

      // 1️⃣ Envia ao Fiqon — Cadastro Pet
      const resCadastro = await fetch(WEBHOOK_CADASTRO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const jsonCadastro = await resCadastro.json();

      if (!resCadastro.ok || !jsonCadastro.result) {
        throw new Error("Erro no cadastro do pet.");
      }

      const { id_pet } = jsonCadastro.result;

      // 2️⃣ Envia ao Fiqon — Financeiro Asaas
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
      };

      const resFinanceiro = await fetch(WEBHOOK_FINANCEIRO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadFinanceiro),
      });

      const jsonFin = await resFinanceiro.json();

      if (jsonFin && jsonFin.payment_link) {
        msg.textContent = "Redirecionando para pagamento...";
        window.open(jsonFin.payment_link, "_blank");
      } else {
        alert("Cadastro feito, mas o link de pagamento não foi gerado.");
      }

      btn.innerText = "Cadastrar Pet";
      formCadastro.reset();
      atualizarValor();
      msg.textContent = "✅ Cadastro enviado com sucesso!";

    } catch (erro) {
      console.error("Erro no envio:", erro);
      msg.textContent = "❌ Ocorreu um erro ao enviar o cadastro.";
    } finally {
      btn.disabled = false;
      btn.innerText = "Cadastrar Pet";
    }
  });
}

// função auxiliar
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
