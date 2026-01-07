document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-cadastro-ong");

  const WEBHOOK_URL = "COLE_AQUI_O_WEBHOOK_DO_FLUXO";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      ong_nome: document.getElementById("ong_nome").value.trim(),
      ong_cnpj: document.getElementById("ong_cnpj").value.trim(),
      ong_endereco: document.getElementById("ong_endereco").value.trim(),
      ong_cidade: document.getElementById("ong_cidade").value.trim(),
      ong_uf: document.getElementById("ong_uf").value.trim().toUpperCase(),
      ong_whatsapp: document.getElementById("ong_whatsapp").value.trim(),
      ong_email: document.getElementById("ong_email").value.trim(),
      ong_instagram: document.getElementById("ong_instagram").value.trim()
    };

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar cadastro");
      }

      alert("Cadastro enviado com sucesso! Em breve entraremos em contato.");

      form.reset();

    } catch (error) {
      console.error(error);
      alert("Erro ao enviar cadastro. Tente novamente.");
    }
  });
});
