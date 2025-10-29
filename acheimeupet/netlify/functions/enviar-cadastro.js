// 1. Adicione esta linha no topo
const fetch = require('node-fetch'); 

exports.handler = async (event, context) => {
  try {
    // ... o resto do seu código ...
    
    // Onde você usa o fetch:
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    
    // ... o resto do seu código ...

  } catch (error) {
    // ...
  }
};
