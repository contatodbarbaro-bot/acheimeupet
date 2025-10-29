// --- CONFIGURAÇÕES ---
const WEBHOOK_URL = 'https://webhook.fiqon.app/webhook/a018d905-b76f-460e-bb85-c0ed3ad375eb/dbef3e88-594b-45e9-9de7-cf5bc122914c';

// --- ELEMENTOS DO DOM ---
const finderForm = document.getElementById('finderForm');
const getLocationBtn = document.getElementById('getLocationBtn');
const statusMessage = document.getElementById('status-message');

// --- LÓGICA PRINCIPAL ---
finderForm.addEventListener('submit', (event) => {
    // Impede o envio padrão do formulário
    event.preventDefault(); 

    // Pega o ID do pet da URL
    const params = new URLSearchParams(window.location.search);
    const petIdFromUrl = params.get('id');

    // Pega os dados do formulário
    const finderName = document.getElementById('finderName').value.trim();
    const finderPhone = document.getElementById('finderPhone').value.trim();

    // Validação simples (já feita com 'required', mas é uma boa prática ter em JS também)
    if (!finderName || !finderPhone) {
        alert("Por favor, preencha seu nome e telefone.");
        return;
    }

    if (!petIdFromUrl) {
        displayMessage("Erro: Não foi possível identificar o pet. O QR Code pode ser inválido.", 'error');
        return;
    }

    if (!navigator.geolocation) {
        displayMessage("Geolocalização não é suportada pelo seu navegador.", 'error');
        return;
    }
    
    getLocationBtn.textContent = 'Obtendo localização...';
    getLocationBtn.disabled = true;

    // Pede a localização
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            
            // Envia tudo para o Fiqon
            sendDataToWebhook({
                latitude,
                longitude,
                petId: petIdFromUrl,
                nomeEncontrador: finderName,
                telefoneEncontrador: finderPhone
            });
        }, 
        () => {
            displayMessage('Não foi possível obter sua localização. Por favor, habilite a permissão e tente novamente.', 'error');
            resetButton();
        }
    );
});

function sendDataToWebhook(data) {
    fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            displayMessage('Localização enviada! O tutor já foi notificado. Muito obrigado!', 'success');
            // Mantém o botão desativado para evitar envios duplicados
        } else {
            displayMessage('Houve um erro ao notificar. Por favor, tente novamente.', 'error');
            resetButton();
        }
    })
    .catch(() => {
        displayMessage('Erro de conexão. Verifique sua internet e tente novamente.', 'error');
        resetButton();
    });
}

function displayMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.style.color = type === 'success' ? 'var(--secondary-color)' : 'var(--error-color)';
}

function resetButton() {
    getLocationBtn.textContent = 'Notificar Tutor Agora';
    getLocationBtn.disabled = false;
}

