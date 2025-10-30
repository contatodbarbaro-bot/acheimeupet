const formCadastro = document.getElementById('form-cadastro');
const msg = document.getElementById('mensagem');

formCadastro.addEventListener('submit', async (e) => {
  e.preventDefault();
  msg.textContent = '⏳ Enviando dados...';

  const formData = new FormData(formCadastro);
  const fileInput = document.getElementById('foto_pet');
  let base64Image = null;

  // Compressão leve antes de converter em Base64
  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const compressed = await compressImage(file, 800, 0.7);
    base64Image = await toBase64(compressed);
  }

  const data = Object.fromEntries(formData);
  if (base64Image) data.foto_pet = base64Image;

  try {
    const response = await fetch('https://hooks.fiqon.app/YOUR_WEBHOOK_AQUI', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      msg.textContent = '✅ Cadastro enviado com sucesso!';
      formCadastro.reset();
    } else {
      msg.textContent = '⚠️ Erro ao enviar cadastro. Tente novamente.';
    }
  } catch (error) {
    msg.textContent = '⚠️ Falha de conexão. Verifique sua internet.';
  }
});

// Funções auxiliares
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

function compressImage(file, maxSize, quality) {
  return new Promise((resolve) => {
    const img = document.createElement('img');
    const canvas = document.createElement('canvas');
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
      img.onload = () => {
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => resolve(new File([blob], file.name, { type: file.type })),
          file.type,
          quality
        );
      };
    };
    reader.readAsDataURL(file);
  });
}
