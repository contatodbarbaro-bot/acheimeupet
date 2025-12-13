// 📍 Capturar localização GPS/IP automaticamente (ajustado)
async function capturarLocalizacao(petId) {
    const latInput = document.getElementById("latitude");
    const lngInput = document.getElementById("longitude");
    const srcInput = document.getElementById("loc_source");

    const setValores = (lat, lng, src) => {
        latInput.value = lat || "";
        lngInput.value = lng || "";
        srcInput.value = src || "ip";
    };

    const enviarEAtualizar = (lat, lng, src) => {
        setValores(lat, lng, src); // Atualiza os inputs (opcional, mas bom para debug)
        enviarEncontro(petId, lat, lng, src); // Envia os dados
    };

    // Tentativa real de GPS com feedback ao usuário
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                enviarEAtualizar(latitude.toFixed(6), longitude.toFixed(6), "gps");
                console.log("📍 Localização GPS capturada com sucesso!");
            },
            (err) => {
                console.warn("⚠️ Falha no GPS:", err.message);
                // Se falhar, tenta IP
                buscarLocalizacaoPorIP(enviarEAtualizar);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    } else {
        // Se o navegador não suportar, tenta IP
        buscarLocalizacaoPorIP(enviarEAtualizar);
    }
}

// 🌐 Buscar localização por IP (fallback)
async function buscarLocalizacaoPorIP(callback) {
    try {
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();

        if (data.latitude && data.longitude) {
            callback(data.latitude.toFixed(6), data.longitude.toFixed(6), "ip");
            console.log("🌐 Localização por IP capturada com sucesso!");
        } else {
            console.warn("⚠️ Falha ao obter localização por IP.");
            callback("", "", "manual");
        }
    } catch (error) {
        console.error("❌ Erro na requisição de IP:", error);
        callback("", "", "manual");
    }
}

// 🔍 Obter o ID do pet da URL
function getPetIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// 📤 Enviar dados de encontro para o Webhook
async function enviarEncontro(petId, latitude, longitude, locSource) {
    const webhookUrl = "https://webhook.fiqon.app/webhook/a018d905-b76f-460e-bb85-c0ed3ad375eb/dbef3e88-594b-45e9-9de7-cf5bc122914c";

    const data = {
        pet_id: petId,
        latitude: latitude,
        longitude: longitude,
        loc_source: locSource,
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            console.log("✅ Dados de encontro enviados com sucesso!");
            // Redirecionar para a página de sucesso ou exibir mensagem
            window.location.href = "pet.html?id=" + petId;
        } else {
            console.error("❌ Falha ao enviar dados de encontro:", response.statusText);
            // Exibir mensagem de erro
            alert("Ocorreu um erro ao registrar o encontro. Tente novamente.");
        }
    } catch (error) {
        console.error("❌ Erro na requisição do Webhook:", error);
        // Exibir mensagem de erro
        alert("Ocorreu um erro de conexão. Verifique sua internet.");
    }
}

// ---------------------------------------------------------------------------------------------------------------------

// 🏁 Lógica principal
document.addEventListener("DOMContentLoaded", () => {
    const petId = getPetIdFromUrl();
    if (petId) {
        capturarLocalizacao(petId);
    } else {
        console.error("❌ ID do pet não encontrado na URL.");
    }
});
