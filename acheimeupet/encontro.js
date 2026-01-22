// ---------------------------------------------------------------------------------------------------------------------
// ACHEI MEU PET - ENCONTRO.JS (VERSÃO ALINHADA COM TUTOR + ONG)
// ---------------------------------------------------------------------------------------------------------------------

const overlay = document.getElementById("location-overlay");
const message = document.getElementById("location-message");
const retryBtn = document.getElementById("retry-location");

function showOverlay(msg) {
  message.textContent = msg;
  retryBtn.style.display = "none";
  overlay.style.display = "flex";
}

function showRetry(msg) {
  message.textContent = msg;
  retryBtn.style.display = "block";
  overlay.style.display = "flex";
}

// 🔍 ID do pet
function getPetIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// 📤 Enviar encontro
async function enviarEncontro(payload) {
  const webhookUrl =
    "https://webhook.fiqon.app/webhook/a018d905-b76f-460e-bb85-c0ed3ad375eb/dbef3e88-594b-45e9-9de7-cf5bc122914c";

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook erro: ${response.status}`);
    }

    console.log("✅ Encontro registrado com sucesso");
    window.location.href = "pet.html?id=" + payload.pet_id;
  } catch (err) {
    console.error("❌ Erro ao enviar encontro:", err);
    showRetry("Erro ao registrar o encontro. Tente novamente.");
  }
}

// 🌐 IP fallback
async function buscarLocalizacaoPorIP(payload) {
  showOverlay("Tentando localização aproximada...");
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();

    if (data?.latitude && data?.longitude) {
      payload.latitude = data.latitude;
      payload.longitude = data.longitude;
      payload.loc_source = "ip";
      await enviarEncontro(payload);
    } else {
      throw new Error("IP sem coordenadas");
    }
  } catch (err) {
    console.error("❌ Falha IP:", err);
    showRetry("Não foi possível obter a localização. Tente novamente.");
  }
}

// 📍 GPS
function capturarLocalizacao(payload) {
  showOverlay("Precisamos da sua localização para registrar o encontro.");

  if (!navigator.geolocation) {
    buscarLocalizacaoPorIP(payload);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      payload.latitude = pos.coords.latitude;
      payload.longitude = pos.coords.longitude;
      payload.loc_source = "gps";
      await enviarEncontro(payload);
    },
    () => buscarLocalizacaoPorIP(payload),
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );
}

// 🚀 Init
document.addEventListener("DOMContentLoaded", () => {
  const petId = getPetIdFromUrl();
  if (!petId) {
    showOverlay("Erro: ID do pet não encontrado.");
    return;
  }

  // 🔑 Dados já resolvidos pelo pet.js (fonte única da verdade)
  const payload = {
    pet_id: petId,
    responsavel_nome: document.getElementById("nome_tutor")?.textContent || "",
    responsavel_whatsapp: document.getElementById("whatsapp_tutor")?.textContent || "",
    responsavel_tipo:
      document.getElementById("nome_tutor")?.textContent.includes("ONG")
        ? "ong"
        : "tutor",
    timestamp: new Date().toISOString()
  };

  retryBtn.addEventListener("click", () => capturarLocalizacao(payload));
  capturarLocalizacao(payload);
});
