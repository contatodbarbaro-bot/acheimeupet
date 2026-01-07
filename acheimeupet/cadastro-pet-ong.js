document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-cadastro-pet");

  const WEBHOOK_URL = "https://webhook.fiqon.app/webhook/019b8f5b-778b-72c1-ad7e-02eed3440b68/2f08f502-d4d5-48fd-9e64-7092f0e37339";

  // 🔎 Captura id_ong da URL
  const params = new URLSearchParams(window.location.search);
  const id_ong = params.get("id_ong");

  if (!id_ong) {
    alert("ID da ONG não encontrado. Acesse o link enviado pela ONG.");
    form.querySelector("button").disabled = true;
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fotoInput = document.getElementById("pet_foto");

    if (!fotoInput.files || !fotoInput.files[0]) {
      alert("A foto do pet é obrigatória.");
      return;
    }

    const file = fotoInput.files[0];

    // ⛔ valida tipo básico
    if (!file.type.startsWith("image/")) {
      alert("Envie um arquivo de imagem válido.");
      return;
    }

    try {
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
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Erro ao enviar cadastro do pet");
      }

      alert("Pet cadastrado com sucesso!");
      form.reset();

    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar o pet. Tente novamente.");
    }
  });

  // 🔁 utilitário Base64
  function converterParaBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
});

