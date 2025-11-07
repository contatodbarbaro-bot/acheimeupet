// =============================================
// CADASTRO ACHEIMEUPET — SUPORTE MULTIPETS + CAMPO CEP + DELAY ENTRE PETS
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

// === FUNÇÃO AUXILIAR PARA BASE64 ===
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
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
      // === COLETA DOS DADOS DO FORMULÁRIO ===
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

      if (plano === "individual") {
        valor = periodo === "mensal" ? 24.9 : 249.9;
      } else if (plano === "familia") {
        valor = periodo === "mensal" ? 19.9 * qtd : 199.0 * qtd;
      }

      // === LOOP PARA CADA PET ===
      const petsCadastrados = [];
      for (let i = 1; i <= qtd; i++) {
        const nome_pet = formData.get(`nome_pet_${i}`);
        const especie = formData.get(`especie_${i}`);
        const raca = formData.get(`raca_${i}`);
        const sexo = formData.get(`sexo_${i}`);
        const ano_nasc = formData.get(`ano_nasc_${i}`);
        const file = formData.get(`foto_pet_${i}`);

        if (!nome_pet || !especie || !raca || !sexo || !ano_nasc || !file) {
          msg.textContent = `⚠️ Preencha todos os campos do Pet ${i}.`;
          msg.style.color = "red";
          btn.disabled = false;
          btn.innerHTML = "🐾 Enviar cadastro";
          loading.style.display = "none";
          return;
        }

        const foto_pet = await toBase64(file);

        // === Corpo completo para o FIQON ===
        const payloadPet = {
          nome_pet,
          especie,
          raca,
          sexo,
          ano_nascimento: ano_nasc,
          foto_pet,
          ...dadosTutor,
          plano,
          periodo,
          qtd_pets: qtd,
          valor_total: valor,
        };

        // === Envio ao FIQON — Cadastro Pet ===
        const resCadastro = await fetch(WEBHOOK_CADASTRO, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadPet),
        });

        const jsonCadastro = await resCadastro.json();
        console.log(`📦 Retorno cadastro Pet ${i}:`, jsonCadastro);

        const id_pet =
          jsonCadastro?.result?.id_pet ||
          jsonCadastro?.body?.result?.id_pet ||
          jsonCadastro?.data?.result?.id_pet ||
          jsonCadastro?.id_pet ||
          null;

        if (!resCadastro.ok || !id_pet) {
          console.error("Retorno cadastro:", jsonCadastro);
          throw new Error(`Erro ao cadastrar o Pet ${i}.`);
        }

        petsCadastrados.push(id_pet);

        // 🕒 Delay de 1 segundo entre pets para evitar sobrecarga no ImgBB
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // === Envio ao FIQON — Financeiro (após todos os pets)
      const payloadFinanceiro = {
        id_pet: petsCadastrados[0],
        nome_tutor: dadosTutor.nome_tutor,
        email_tutor: dadosTutor.email_tutor,
        cpf_tutor: dadosTutor.cpf_tutor,
        whatsapp_tutor: dadosTutor.whatsapp_tutor,
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
      console.log("💰 Retorno financeiro:", jsonFin);

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

      // === RESET FINAL ===
      formCadastro.reset();
      atualizarValor();

    } catch (erro) {
      console.error("Erro no envio:", erro);
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
