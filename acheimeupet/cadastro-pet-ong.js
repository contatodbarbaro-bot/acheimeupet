document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-cadastro-pet-ong");
  const WEBHOOK_URL = "https://webhook.fiqon.app/webhook/019bb94c-042a-711c-b3e9-d4e9098064e2/83188f14-a3c7-4715-a55f-84ac4eab7a69";

  const params = new URLSearchParams(window.location.search  );
  const id_ong = params.get("id_ong");

  if (!id_ong) {
    alert("ID da ONG não encontrado. Acesse o link enviado pela ONG.");
    if (form) form.querySelector("button").disabled = true;
    return;
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const btn = form.querySelector("button");
      const loading = document.getElementById("loading");
      const mensagem = document.getElementById("mensagem");

      const fotoInput = document.getElementById("pet_foto");
      if (!fotoInput.files || !fotoInput.files[0]) {
        alert("A foto do pet é obrigatória.");
        return;
      }

      try {
        // Bloqueia o botão e mostra loading
        btn.disabled = true;
        loading.style.display = "block";
        mensagem.textContent = "";

        const file = fotoInput.files[0];
        const base64 = await converterParaBase64(file);

        const payload = {
          id_ong: id_ong,
          pet_nome: document.getElementById("pet_nome").value.trim(),
          pet_especie: document.getElementById("pet_especie").value,
          pet_raca: document.getElementById("pet_raca").value.trim(),
          pet_idade: document.getElementById("pet_idade").value.trim(),
          pet_sexo: document.getElementById("pet_sexo").value,
          pet_obs: document.getElementById("pet_obs").value.trim(),
          pet_foto_base64: base64
        };

        const response = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Erro no servidor");

        // SUCESSO: Mensagem amigável e limpa o form
        mensagem.style.color = "green";
        mensagem.textContent = "✅ Pet cadastrado! O formulário já está pronto para o próximo.";
        form.reset();

      } catch (error) {
        console.error(error);
        mensagem.style.color = "red";
        mensagem.textContent = "❌ Erro ao cadastrar. Tente novamente.";
      } finally {
        btn.disabled = false;
        loading.style.display = "none";
      }
    });
  }

  // Função ajustada para enviar apenas o código puro da imagem (sem o prefixo data:image/...)
  function converterParaBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Divide a string na vírgula e pega apenas a segunda parte (o código base64 puro)
        const base64Pura = reader.result.split(',')[1];
        resolve(base64Pura);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
});

