export async function handler(event) {
  try {
    const webhookUrl = "https://webhook.fiqon.app/webhook/SEU-ID/SEU-ID";
    const resp = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: event.body,
    });
    const text = await resp.text();

    return {
      statusCode: resp.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: text,
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erro interno no proxy." }),
    };
  }
}
