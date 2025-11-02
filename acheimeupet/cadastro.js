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
