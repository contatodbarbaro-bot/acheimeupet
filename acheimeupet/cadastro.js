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
      // Coleta os dados do formulário
      const formData = new FormData(formCadastro);
      const data = Object.fromEntries(formData.entries());

      // Converte imagem para Base64 (se houver)
      const fileInput = document.getElementById('foto_pet');
      if (fileInput && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        data.foto_pet = await toBase64(file);
      }

      // Envia para o Webhook do Fiqon
      const resposta = await fetch('https://webhook.fiqon.app/webhook/a029be45-8a23-418e-93e3-33f9b620a944/3e1595ab-b587-499b-a640-a8fe46b2d0c6', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const resultado = await resposta.json();

      if (resposta.ok && resultado.result) {
        const { id_pet, link_pet, url_qr_imagem } = resultado.result;

        alert(`✅ Cadastro realizado com sucesso!\n\nID: ${id_pet}`);

        // Exibe o link da ficha de encontro
        const linkContainer = document.createElement('div');
        linkContainer.innerHTML = `
          <p><strong>Ficha do Pet:</strong> <a href="${link_pet}" target="_blank">${link_pet}</a></p>
          <p><strong>QR Code:</strong><br><img src="${url_qr_imagem}" width="180" alt="QR Code do Pet" /></p>
        `;
        formCadastro.appendChild(linkContainer);

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
