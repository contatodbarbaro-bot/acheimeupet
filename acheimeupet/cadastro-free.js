// ===============================================================
// 🐾 AcheiMeuPet — Cadastro-Free.js
// ===============================================================
// • Versão exclusiva para o fluxo gratuito.
// • Removida lógica de planos e pagamentos.
// • Adicionada trava de clique duplo e validação robusta.
// ===============================================================

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("form-cadastro-free");
    const msg = document.getElementById("mensagem");
    const loading = document.getElementById("loading");
    const botao = document.getElementById("botao-enviar");

    const WEBHOOK_FREE = "https://webhook.fiqon.app/webhook/019a781c-15f8-738a-93bc-5b70388445ff/faee836c-d909-4b6b-96d0-ed6433640060";

    // Função para comprimir imagem (mantida do original para garantir qualidade)
    function comprimirImagem(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const MAX_WIDTH = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > MAX_WIDTH) {
                        height = height * (MAX_WIDTH / width);
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, width, height);

                    const base64 = canvas.toDataURL("image/jpeg", 0.6);
                    resolve(base64);
                };
                img.onerror = reject;
                img.src = event.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            // 1. Validação básica de campos obrigatórios
            const inputs = form.querySelectorAll("[required]");
            let todosPreenchidos = true;
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    input.style.borderColor = "red";
                    todosPreenchidos = false;
                } else {
                    input.style.borderColor = "#ccc";
                }
            });

            if (!todosPreenchidos) {
                msg.style.color = "red";
                msg.textContent = "⚠️ Por favor, preencha todos os campos obrigatórios.";
                return;
            }

            // 2. Trava do botão para evitar múltiplos envios
            msg.textContent = "";
            loading.style.display = "block";
            botao.disabled = true;
            botao.innerHTML = `⏳ Enviando...`;

            try {
                const fd = new FormData(form);

                // Captura dados do tutor
                const payload = {
                    nome_tutor: fd.get("nome_tutor"),
                    cpf_tutor: fd.get("cpf_tutor"),
                    email_tutor: fd.get("email_tutor"),
                    whatsapp_tutor: fd.get("whatsapp_tutor"),
                    cidade: fd.get("cidade"),
                    uf: fd.get("uf"),
                    endereco: fd.get("endereco"),
                    cep: fd.get("cep"),
                    obs: fd.get("obs"),
                    plano: "Free",
                    periodo: "",
                    qtd_pets: 1,
                    valor_total: 0,
                    origem_cadastro: "free_site",
                    token_origem: "free",
                    pets: []
                };

                // Processa o Pet único do modo Free
                const file = fd.get("foto_pet_1");
                if (!file || file.size === 0) {
                    throw new Error("A foto do pet é obrigatória.");
                }

                msg.textContent = "⏳ Comprimindo foto do pet...";
                const foto_base64 = await comprimirImagem(file);

                payload.pets.push({
                    nome_pet: fd.get("nome_pet_1"),
                    especie: fd.get("especie_1"),
                    raca: fd.get("raca_1"),
                    sexo: fd.get("sexo_1"),
                    ano_nascimento: fd.get("ano_nasc_1"),
                    foto_pet: foto_base64
                });

                msg.textContent = "🚀 Finalizando cadastro...";

                // 3. Envio para o Webhook
                const req = await fetch(WEBHOOK_FREE, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (!req.ok) {
                    throw new Error(`Erro no servidor (HTTP ${req.status})`);
                }

                // 4. Sucesso
                msg.style.color = "green";
                msg.innerHTML = "✅ <b>Cadastro concluído com sucesso!</b><br>Seu pet agora está protegido. Você receberá um e-mail de confirmação em breve.";
                
                form.reset();
                // Opcional: Redirecionar para uma página de sucesso após 3 segundos
                // setTimeout(() => { window.location.href = "/sucesso.html"; }, 3000);

            } catch (error) {
                console.error("Erro no envio:", error);
                msg.style.color = "red";
                msg.textContent = "❌ Erro no envio: " + error.message;
                botao.disabled = false; // Reabilita apenas se der erro
                botao.innerHTML = `🐾 Tentar novamente`;
            } finally {
                loading.style.display = "none";
            }
        });
    }
});
