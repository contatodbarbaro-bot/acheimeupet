// netlify/functions/upload-imgbb.js
const fetch = require('node-fetch');
const FormData = require('form-data');

const IMGBB_API_KEY = "a09e3d0d9088118e413e29f2edeaadc5";
const IMGBB_URL = "https://api.imgbb.com/1/upload";

exports.handler = async (event ) => {
  if (event.httpMethod !== 'POST' ) {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
    const { base64Image } = JSON.parse(body);

    if (!base64Image) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing base64Image in request body.' }) };
    }

    const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg|gif);base64,/, "");

    const form = new FormData();
    form.append('key', IMGBB_API_KEY);
    form.append('image', base64Data);
    form.append('expiration', 600);

    const response = await fetch(IMGBB_URL, {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });

    const data = await response.json();

    if (!response.ok || data.success !== true) {
      console.error("Erro ImgBB:", data);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: data.error?.message || `Falha no upload via proxy. Status: ${response.status}` })
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
