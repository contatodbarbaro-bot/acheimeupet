document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('form-cadastro');
  const btn = document.getElementById('btn-enviar');
  const msg = document.getElementById('mensagem'); // opcional: <div id="mensagem"></div>

  function setLoading(loading, texto = 'Processando...') {
    if (!btn) return;
    btn.disabled = loading;
    btn.innerText = loading ? texto : 'Enviar cadastro';
  }

  function showMessage(texto, tipo = 'info') {
    if (!msg) return;
    msg.innerText = texto;
    msg.className = '';
    msg.classList.add(tipo); // use classes .info .erro .sucesso no CSS se quiser
  }

  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    try {
      const formData = Object.fromEntries(new FormData(form));

      // Validação simples
      if (!formData.nome_tutor || !formData.email_tutor) {
        showMessage('Preencha nome e e-mail antes de enviar.', 'erro');
        return;
      }

      setLoading(true);
      showMessage('Enviando cadastro com segurança...', 'info');

      // Envia via função Netlify
      const resp = await fetch('/.netlify/functions/enviar-cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await resp.json().catch(() => ({}));

      if (resp.ok && data.sucesso) {
        showMessage('Cadastro enviado com sucesso! 🎉', 'sucesso');
        form.reset(); // limpa campos
      } else {
        console.error('Erro no retorno:', data);
        showMessage('Não foi possível enviar o cadastro. Tente novamente.', 'erro');
      }

    } catch (err) {
      console.error('Erro de conexão:', err);
      showMessage('Erro de conexão. Verifique sua internet e tente novamente.', 'erro');
    } finally {
      setLoading(false);
    }
  });
});
