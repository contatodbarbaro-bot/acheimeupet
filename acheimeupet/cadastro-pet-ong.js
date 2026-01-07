document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-cadastro-pet-ong");
  const WEBHOOK_URL = "https://webhook.fiqon.app/webhook/019b8f5b-778b-72c1-ad7e-02eed3440b68/2f08f502-d4d5-48fd-9e64-7092f0e37339";

  const params = new URLSearchParams(window.location.search );
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

  function converterParaBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
});
