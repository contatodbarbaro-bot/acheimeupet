// ========================================
// ENVIO DO FORMULÁRIO DE CADASTRO DE PET
// Projeto AcheiMeuPet — Versão Unificada (Pago + Free)
// ========================================

const formCadastro = document.getElementById('form-cadastro');

if (formCadastro) {
  formCadastro.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Coleta os dados do formulário
    const formData = new FormData(formCadastro);
    const dadosTutor = Object.fromEntries(formData.entries());

    // Identifica o número de pets
    const qtd = parseInt(dadosTutor.qtd_pets || 1);
    const listaPets = [];
    for (let i = 1; i <= qtd; i++) {
      listaPets.push({
        nome_pet: formData.get(`nome_pet_${i}`) || "",
        especie_pet: formData.get(`especie_pet_${i}`) || "",
        raca_pet: formData.get(`raca_pet_${i}`) || "",
        cor_pet: formData.get(`cor_pet_${i}`) || "",
        sexo_pet: formData.get(`sexo_pet_${i}`) || "",
      });
    }

    // Captura token da URL (se houver)
    const urlParams = new URLSearchParams(window.location.search);
    const temToken = urlParams.has("token");
    const tokenParam = urlParams.get("token") || "";

    // Define se é cadastro Free (via token) ou Pago (site direto)
    const origem_cadastro = temToken ? "free_site" : "assinatura_site";
    const webhookURL = temToken
      ? "https://hooks.fiqon.app/SEU_WEBHOOK_CADASTRO_FREE"
      : "https://hooks.fiqon.app/SEU_WEBHOOK_CADASTRO_PAGO";

    // Define plano e valor (somente para pago)
    const plano = formData.get("plano") || (temToken ? "Free" : "");
    const periodo = formData.get("periodo") || "";
    const valor = formData.get("valor_total") || (temToken ? 0 : "");

    // Monta o payload final
    const payloadUnico = {
      ...dadosTutor,
      plano,
      periodo,
      qtd_pets: qtd,
      valor_total: valor,
      origem_cadastro,
      token_origem: tokenParam, // 🔥 novo campo
      pets: listaPets,
    };

    try {
      // Envia os dados
      const resposta = await fetch(webhookURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadUnico),
      });

      if (resposta.ok) {
        alert("Cadastro enviado com sucesso! 🐾");
        formCadastro.reset();
      } else {
        alert("Erro ao enviar o cadastro. Tente novamente.");
      }
    } catch (erro) {
      console.error("Erro ao enviar o cadastro:", erro);
      alert("Falha na conexão. Verifique sua internet e tente novamente.");
    }
  });
}
