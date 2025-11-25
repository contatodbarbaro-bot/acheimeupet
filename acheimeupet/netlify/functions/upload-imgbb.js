// netlify/functions/upload-imgbb.js
// Função para servir como proxy seguro para o ImgBB, evitando expor a API Key no frontend.

const fetch = require('node-fetch');

// Chave de API do ImgBB (a correta que você forneceu)
const IMGBB_API_KEY = "a09e3d0d9088118e413e29f2edeaadc5";
const IMGBB_URL = "https://api.imgbb.com/1/upload";

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // O corpo da requisição do frontend é o FormData, que o Netlify Functions não parseia automaticamente.
  // Precisamos re-enviar o corpo da requisição para o ImgBB.
  // Como o frontend enviará o FormData diretamente, podemos apenas repassar o corpo da requisição.
  
  // O ImgBB espera o campo 'image' e 'key'. O 'image' virá no corpo da requisição.
  // O 'key' será adicionado aqui de forma segura.

  try {
    // Cria um novo FormData para enviar ao ImgBB
    const formData = new URLSearchParams();
    formData.append("key", IMGBB_API_KEY);
    
    // O frontend enviará o arquivo binário. O Netlify Functions não lida bem com FormData binário
    // em seu payload padrão. A forma mais segura é pedir ao frontend para enviar a imagem
    // como Base64 (temporariamente) para esta função, ou usar um parser de multipart/form-data.
    
    // Para simplificar e usar o que o ImgBB aceita (Base64), vamos assumir que o frontend
    // enviará o Base64 da imagem para esta função.
    
    // ⚠️ ATENÇÃO: O frontend precisará ser alterado para enviar o Base64 para esta função.
    // Isso é um passo intermediário para manter a segurança da chave.
    
    // Vamos assumir que o frontend envia um JSON com { base64Image: "..." }
    const { base64Image } = JSON.parse(event.body);
    
    if (!base64Image) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing base64Image in request body.' }) };
    }
    
    // O ImgBB espera a imagem como Base64 sem o prefixo "data:image/jpeg;base64,"
    const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
    
    formData.append("image", base64Data);
    formData.append("expiration", 600); // Adiciona expiração de 10 minutos

    const response = await fetch(IMGBB_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const data = await response.json();

    if (!response.ok || data.success !== true) {
      console.error("Erro ImgBB:", data);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.error?.message || "Falha ao fazer upload da foto para o ImgBB via proxy." })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ url: data.data.url })
    };

  } catch (error) {
    console.error("Erro na função Netlify:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' })
    };
  }
};
