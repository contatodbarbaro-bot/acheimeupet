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
      // Faz o envio dos dados para o Webhook do Fiqon
      const response = await fetch('https://api.fiqon.app/webhook/SEU_WEBHOOK_AQUI', {
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
      mensagem.style.transition = 'opacity 0.3s ease';

      if (resultado.ok) {
        // Mensagem de sucesso
        mensagem.textContent = '✅ Cadastro enviado com sucesso! Aguarde a confirmação do pagamento.';
        mensagem.style.color = '#2e7d32';

        // Exibe no formulário
        formCadastro.appendChild(mensagem);

        // Redirecionamento automático (ajuste a URL quando o link do Asaas estiver pronto)
        setTimeout(() => {
          window.location.href = 'https://www.projetoacheimeupet.com.br/pagamento';
        }, 4000);
      } else {
        // Mensagem de erro tratável
        mensagem.textContent = '⚠️ Ocorreu um erro ao enviar o cadastro. Tente novamente em alguns instantes.';
        mensagem.style.color = '#c62828';
        formCadastro.appendChild(mensagem);
      }
    } catch (erro) {
      console.error('Erro de conexão:', erro);

      // Remove qualquer mensagem anterior
      const mensagemAnterior = document.querySelector('#mensagem-status');
      if (mensagemAnterior) mensagemAnterior.remove();

      // Exibe mensagem de erro de rede
      const mensagemErro = document.createElement('p');
      mensagemErro.id = 'mensagem-status';
      mensagemErro.textContent = '⚠️ Falha na conexão com o servidor. Verifique sua internet e tente novamente.';
      mensagemErro.style.color = '#c62828';
      mensagemErro.style.marginTop = '12px';
      mensagemErro.style.fontWeight = '600';
      formCadastro.appendChild(mensagemErro);
    }
  });
}
