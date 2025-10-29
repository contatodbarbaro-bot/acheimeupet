// Função proxy do Netlify para enviar o cadastro ao fluxo Fiqon

export async function handler(event) {
  try {
    // 🔗 URL real do seu webhook Fiqon
    const webhookUrl = "https://webhook.fiqon.app/webhook/a029be45-8a23-418e-93e3-33f9b620a944/3e1595ab-b587-499b-a640-a8fe46b2d0c6";

    // Envia o corpo do formulário recebido do front-end diretamente para o Fiqon
    const resp = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: event.body, // o JSON vindo do form
    });

    // Tenta ler a resposta como texto (Fiqon retorna texto simples)
    const text = await resp.text();

    // Retorna o resultado para o navegador
    return {
      statusCode: resp.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // libera o front pra acessar
      },
      body: text,
    };
  } catch (error) {
    console.error("Erro no proxy Netlify:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        sucesso: false,
        mensagem: "Erro interno no proxy Netlify.",
        detalhe: error.message,
      }),
    };
  }
}
