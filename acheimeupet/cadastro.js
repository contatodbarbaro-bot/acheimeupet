// ========================================
// ENVIO DO FORMULÁRIO DE CADASTRO DE PET
// ========================================

const formCadastro = document.getElementById('form-cadastro');
const mensagemStatus = document.getElementById('mensagem-status');

if (formCadastro) {
  formCadastro.addEventListener('submit', async (e) => {
    e.preventDefault();
    mensagemStatus.textContent = "Enviando cadastro...";

    // Coleta todos os campos do formulário
    const formData = new FormData(formCadastro);
    const dados = Object.fromEntries(formData.entries());

    // Se houver uma imagem, converte para Base64
    const fotoInput = document.getElementById('foto_pet');
    if (fotoInput.files.length > 0) {
      const arquivo = fotoInput.files[0];
      dados.foto_pet = await toBase64(arquivo);
    }

    // Envia o cadastro ao Webhook do Fiqon
    try {
      const resposta = await fetch("https://webhook.fiqon.app/webhook/a029be45-8a23-418e-93e3-33f9b620a944/3e1595ab-b587-499b-a640-a8fe46b2d0c6", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
      });

      if (resposta.ok) {
        mensagemStatus.textContent = "✅ Cadastro enviado com sucesso!";
        mensagemStatus.style.color = "green";

        // Redireciona após 3 segundos
        setTimeout(() => {
          window.location.href = "https://projetoacheimeupet.com.br/sucesso.html";
        }, 3000);

      } else {
        mensagemStatus.textContent = "❌ Erro ao enviar cadastro. Tente novamente.";
        mensagemStatus.style.color = "red";
      }

    } catch (erro) {
      mensagemStatus.textContent = "⚠️ Falha na conexão. Verifique sua internet.";
      mensagemStatus.style.color = "red";
      console.error("Erro:", erro);
    }
  });
}

// Função auxiliar para converter arquivo em Base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
