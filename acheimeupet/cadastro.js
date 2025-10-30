// ========================================
// ENVIO DO FORMULÁRIO DE CADASTRO DE PET
// ========================================

const formCadastro = document.getElementById('form-cadastro');

if (formCadastro) {
  formCadastro.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = formCadastro.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.innerText = "Enviando...";

    try {
      // Coleta dados do formulário
      const formData = new FormData(formCadastro);
      const data = Object.fromEntries(formData.entries());

      // Converte imagem (se houver)
      const fileInput = document.getElementById('foto_pet');
      if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        data.foto_pet = await toBase64(file);
      }

      // Envia para o webhook Fiqon
      const resposta = await fetch('https://webhook.fiqon.app/webhook/a029be45-8a23-418e-93e3-33f9b620a944/3e1595ab-b587-499b-a640-a8fe46b2d0c6', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const resultado = await resposta.json();

      if (resposta.ok) {
        alert('✅ Cadastro realizado com sucesso!');
        formCadastro.reset();
      } else {
        alert('⚠️ Erro ao cadastrar: ' + (resultado.message || 'Verifique os dados e tente novamente.'));
      }
    } catch (erro) {
      console.error('Erro no envio:', erro);
      alert('❌ Ocorreu um erro ao enviar o cadastro.');
    } finally {
      btn.disabled = false;
      btn.innerText = "Cadastrar Pet";
    }
  });
}

// Função auxiliar para converter imagem em Base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
