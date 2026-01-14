// ---------------------------------------------------------------------------------------------------------------------
// ACHEI MEU PET - ENCONTRO.JS (VERSÃO ROBUSTA)
// ---------------------------------------------------------------------------------------------------------------------

// --- Elementos da Interface para Feedback ao Usuário ---
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

// --- Funções Principais ---

/**
 * 🔍 Obtém o ID do pet da URL.
 * @returns {string|null} O ID do pet ou nulo se não for encontrado.
 */
function getPetIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

/**
 * 📤 Envia os dados do encontro para o seu webhook.
 * @param {string} petId - O ID do pet.
 * @param {number|null} latitude - A latitude do encontro.
 * @param {number|null} longitude - A longitude do encontro.
 * @param {string} locSource - A fonte da localização ('gps', 'ip', 'falha').
 */
async function enviarEncontro(petId, latitude, longitude, locSource) {
    const webhookUrl = "https://webhook.fiqon.app/webhook/a018d905-b76f-460e-bb85-c0ed3ad375eb/dbef3e88-594b-45e9-9de7-cf5bc122914c";

    const data = {
        pet_id: petId,
        latitude: latitude,
        longitude: longitude,
        loc_source: locSource,
        timestamp: new Date( ).toISOString()
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            console.log("✅ Dados de encontro enviados com sucesso!");
            window.location.href = "pet.html?id=" + petId; // Redireciona para a página de sucesso
        } else {
            throw new Error(`Falha no webhook: ${response.statusText}`);
        }
    } catch (error) {
        console.error("❌ Erro ao enviar dados:", error);
        showRetry("Houve um erro ao registrar o encontro. Por favor, tente novamente.");
    }
}

/**
 * 🌐 Tenta obter a localização aproximada usando o endereço de IP.
 * @param {string} petId - O ID do pet.
 */
async function buscarLocalizacaoPorIP(petId) {
    console.log("Tentando localização por IP como alternativa...");
    showOverlay("Não conseguimos a localização precisa. Tentando uma localização aproximada...");
    try {
        const response = await fetch("https://ipapi.co/json/" );
        const data = await response.json();

        if (data && data.latitude && data.longitude) {
            console.log("🌐 Localização por IP capturada!");
            await enviarEncontro(petId, data.latitude, data.longitude, "ip");
        } else {
            throw new Error("A resposta da API de IP não continha coordenadas.");
        }
    } catch (error) {
        console.error("❌ Erro na localização por IP:", error);
        // Se até o IP falhar, mostra a opção de tentar novamente.
        showRetry("Não foi possível obter a localização. Verifique sua conexão e permissões, e tente novamente.");
    }
}

/**
 * 📍 Lógica principal para capturar a localização.
 * @param {string} petId - O ID do pet.
 */
function capturarLocalizacao(petId) {
    showOverlay("Para registrar o encontro, precisamos da sua localização. Por favor, autorize no seu navegador.");

    if (!navigator.geolocation) {
        console.warn("Geolocalização não é suportada por este navegador.");
        buscarLocalizacaoPorIP(petId);
        return;
    }

    navigator.geolocation.getCurrentPosition(
        // --- SUCESSO ---
        (position) => {
            const { latitude, longitude } = position.coords;
            console.log("📍 Localização GPS capturada com sucesso!");
            showOverlay("Localização obtida! Registrando o encontro...");
            enviarEncontro(petId, latitude, longitude, "gps");
        },
        // --- FALHA ---
        (error) => {
            console.warn(`⚠️ Falha no GPS (código: ${error.code}): ${error.message}`);
            // Tenta a localização por IP como alternativa.
            buscarLocalizacaoPorIP(petId);
        },
        // --- OPÇÕES ---
        {
            enableHighAccuracy: true, // Pede a localização mais precisa possível.
            timeout: 15000,           // Tempo máximo de 15 segundos para obter a localização.
            maximumAge: 0             // Não usar uma localização antiga em cache.
        }
    );
}

// --- Ponto de Entrada da Aplicação ---
document.addEventListener("DOMContentLoaded", () => {
    const petId = getPetIdFromUrl();

    if (petId) {
        // Adiciona o evento ao botão de "Tentar Novamente"
        retryBtn.addEventListener("click", () => capturarLocalizacao(petId));
        // Inicia a primeira tentativa de captura de localização
        capturarLocalizacao(petId);
    } else {
        console.error("❌ ID do pet não encontrado na URL.");
        showOverlay("Erro: ID do pet não encontrado. Verifique o link/QRCode.");
    }
});
