// ========================================
// ENVIO DO FORMULÁRIO DE CADASTRO DE PET
// ========================================

const formCadastro = document.getElementById('form-cadastro');

if (formCadastro) {
  formCadastro.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Captura os dados do formulário
    const formData = new FormData(formCadastro);
    const data = Object.fromEntries(formData.entries());

    // Captura imagem (opcional)
    const fotoInput = document.getElementById('foto_pet');
    if (fotoInput && fotoInput.files.length > 0) {
      const arquivo = fotoInput.files[0];
      const leitor = new FileReader();
      data.foto_pet = await new Promise((resolve) => {
        leitor.onloadend = () => resolve(leitor.result);
        leitor.readAsDataURL(arquivo);
      });
    }

    // Exibe mensagem de carregamento
    const msg = document.createElement('p');
    msg.id = 'mensagem-status';
    msg.textContent = '⏳ Enviando cadastro... aguarde alguns segundos.';
    msg.style.color = '#a87632';
    msg.style.fontWeight = '600';
    msg.style.textAlign = 'center';
    formCadastro.appendChild(msg);

    try {
      // === ENVIO PARA O FIQON via proxy seguro (evita CORS) ===
      const webhook = 'https://webhook.fiqon.app/webhook/a029be45-8a23-418e-93e3-33f9b620a944/3e1595ab-b587-499b-a640-a8fe46b2d0c6';
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(webhook)}`;

      const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resultado = await response.json();

      msg.remove(); // remove mensagem anterior

      // === Resposta bem-sucedida ===
      if (response.ok) {
        const sucesso = document.createElement('p');
        sucesso.textContent = '✅ Cadastro enviado com sucesso! Aguarde a confirmação.';
        sucesso.style.color = '#2e7d32';
        sucesso.style.fontWeight = '600';
        sucesso.style.textAlign = 'center';
        formCadastro.appendChild(sucesso);

        // Redireciona após breve delay
        setTimeout(() => {
          window.location.href = 'https://www.projetoacheimeupet.com.br/pagamento';
        }, 4000);
      } else {
        throw new Error('Erro ao enviar os dados. Retorno não OK.');
      }
    } catch (erro) {
      console.error('Erro de conexão:', erro);

      msg.remove();

      const erroMsg = document.createElement('p');
      erroMsg.id = 'mensagem-status';
      erroMsg.textContent = '⚠️ Falha de conexão. Verifique sua internet ou tente novamente em alguns instantes.';
      erroMsg.style.color = '#c62828';
      erroMsg.style.fontWeight = '600';
      erroMsg.style.textAlign = 'center';
      formCadastro.appendChild(erroMsg);
    }
  });
}
