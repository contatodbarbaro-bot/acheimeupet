// ========================================
// ENVIO DO FORMULÁRIO DE CADASTRO DE PET
// ========================================

const formCadastro = document.getElementById('form-cadastro');

if (formCadastro) {
  formCadastro.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Coleta os dados do formulário
    const formData = new FormData(formCadastro);
    const data = Object.fromEntries(formData.entries());

    try {
      // Envio dos dados para o Webhook do Fiqon
      const response = await fetch('https://webhook.fiqon.app/webhook/a029be45-8a23-418e-93e3-33f9b620a944/3e1595ab-b587-499b-a640-a8fe46b2d0c6', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resultado = await response.json();

      // Remove qualquer mensagem anterior
      const mensagemAnterior = document.querySelector('#mensagem-status');
      if (mensagemAnterior) mensagemAnterior.remove();

      // Cria o elemento de mensagem
      const mensagem = document.createElement('p');
      mensagem.id = 'mensagem-status';
      mensagem.style.marginTop = '12px';
      mensagem.style.fontWeight = '600';
      mensagem.style.fontSize = '15px';
      mensagem.style.opacity = '0';
      mensagem.style.transition = 'opacity 0.6s ease';
      mensagem.style.textAlign = 'center';

      // Funções de animação
      const fadeIn = (el) => setTimeout(() => (el.style.opacity = '1'), 50);
      const fadeOut = (el) => (el.style.opacity = '0');

      if (resultado.ok) {
        // Mensagem de sucesso
        mensagem.textContent = '✅ Cadastro enviado com sucesso! Aguarde a confirmação do pagamento.';
        mensagem.style.color = '#2e7d32';
        formCadastro.appendChild(mensagem);
        fadeIn(mensagem);

        // Desvanece antes do redirecionamento
        setTimeout(() => fadeOut(mensagem), 3500);

        // Redireciona para a próxima etapa
        setTimeout(() => {
          window.location.href = 'https://www.projetoacheimeupet.com.br/pagamento';
        }, 4000);
      } else {
        // Mensagem de erro tratável
        mensagem.textContent = '⚠️ Ocorreu um erro ao enviar o cadastro. Tente novamente em alguns instantes.';
        mensagem.style.color = '#c62828';
        formCadastro.appendChild(mensagem);
        fadeIn(mensagem);
      }
    } catch (erro) {
      console.error('Erro de conexão:', erro);

      // Remove qualquer mensagem anterior
      const mensagemAnterior = document.querySelector('#mensagem-status');
      if (mensagemAnterior) mensagemAnterior.remove();

      // Mensagem de erro de rede
      const mensagemErro = document.createElement('p');
      mensagemErro.id = 'mensagem-status';
      mensagemErro.textContent = '⚠️ Falha na conexão com o servidor. Verifique sua internet e tente novamente.';
      mensagemErro.style.color = '#c62828';
      mensagemErro.style.marginTop = '12px';
      mensagemErro.style.fontWeight = '600';
      mensagemErro.style.opacity = '0';
      mensagemErro.style.transition = 'opacity 0.6s ease';
      mensagemErro.style.textAlign = 'center';
      formCadastro.appendChild(mensagemErro);
      setTimeout(() => (mensagemErro.style.opacity = '1'), 50);
    }
  });
}
