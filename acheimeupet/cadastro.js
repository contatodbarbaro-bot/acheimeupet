// ===============================================================
// 🐾 AcheiMeuPet — Cadastro.js (VERSÃO PAGA CORRIGIDA)
// ===============================================================

document.addEventListener("DOMContentLoaded", () => {

    let valorCalculado = 0; // 👈 NOVO

    const form = document.getElementById("form-cadastro");
    const tipoPlano = document.getElementById("tipo_plano");
    const periodo = document.getElementById("periodo");
    const qtdPetsInput = document.getElementById("qtd_pets");
    const campoQtdPets = document.getElementById("campo_qtd_pets");
    const areaPets = document.getElementById("area-pets");
    const msg = document.getElementById("mensagem");
    const loading = document.getElementById("loading");
    const valorLabel = document.getElementById("valor_exibido");
    const botao = document.getElementById("botao-enviar");

    const WEBHOOK_PAGO = "https://webhook.fiqon.app/webhook/019ae12c-0d88-703f-8112-83a3069621e3/83e227af-cbed-43ee-974d-c9603f589a29";

    const PRECOS = {
        individual: { mensal: 19.9, anual: 199.9 },
        familia: { mensal: 14.9, anual: 149.9 }
    };

    function gerarBlocoPet(i) {
        return `
        <div class="pet-group" id="bloco_pet_${i}">
            <h4>🐾 Pet ${i}</h4>
            <label>Nome do pet *</label>
            <input type="text" name="nome_pet_${i}" required />
            <label>Espécie *</label>
            <select name="especie_${i}" required>
                <option value="">Selecione</option>
                <option value="Cachorro">Cachorro</option>
                <option value="Gato">Gato</option>
                <option value="Outros">Outros</option>
            </select>
            <label>Raça *</label>
            <input type="text" name="raca_${i}" required />
            <label>Sexo *</label>
            <select name="sexo_${i}" required>
                <option value="">Selecione</option>
                <option value="Macho">Macho</option>
                <option value="Fêmea">Fêmea</option>
            </select>
            <label>Ano de nascimento *</label>
            <input type="text" name="ano_nasc_${i}" maxlength="4" required />
            <label>Foto do pet *</label>
            <input type="file" name="foto_pet_${i}" accept="image/*" required />
        </div>
        `;
    }

    function atualizarBlocosPets() {
        const plano = tipoPlano.value;
        let qtd = 1;

        if (plano === "familia") {
            campoQtdPets.style.display = "block";
            qtd = parseInt(qtdPetsInput.value) || 2;
            if (qtd < 2) qtd = 2;
            qtdPetsInput.value = qtd;
        } else {
            campoQtdPets.style.display = "none";
            qtd = 1;
            qtdPetsInput.value = 1;
        }

        areaPets.innerHTML = "";
        for (let i = 1; i <= qtd; i++) {
            areaPets.innerHTML += gerarBlocoPet(i);
        }

        atualizarValor();
    }

    function atualizarValor() {
        const plano = tipoPlano.value;
        const per = periodo.value;
        const qtd = parseInt(qtdPetsInput.value) || 1;

        if (!plano || !per) {
            valorLabel.textContent = "Selecione o plano para ver o valor";
            valorCalculado = 0;
            return;
        }

        if (plano === "individual") {
            valorCalculado = per === "mensal"
                ? PRECOS.individual.mensal
                : PRECOS.individual.anual;
        } else {
            const qtdFamilia = Math.max(qtd, 2);
            valorCalculado = per === "mensal"
                ? qtdFamilia * PRECOS.familia.mensal
                : qtdFamilia * PRECOS.familia.anual;
        }

        valorLabel.textContent = `Valor total: R$ ${valorCalculado.toFixed(2).replace(".", ",")}`;
    }

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
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL("image/jpeg", 0.6));
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

            botao.disabled = true;
            loading.style.display = "block";
            msg.textContent = "";

            try {
                const fd = new FormData(form);
                const plano = tipoPlano.value;
                const per = periodo.value;
                const qtd = parseInt(qtdPetsInput.value) || 1;

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
                    plano: plano,
                    periodo: per,
                    qtd_pets: plano === "familia" ? Math.max(qtd, 2) : 1,
                    valor_total: valorCalculado, // 👈 AGORA VAI
                    origem_cadastro: "assinatura_site",
                    pets: []
                };

                for (let i = 1; i <= (plano === "familia" ? Math.max(qtd, 2) : 1); i++) {
                    const file = fd.get(`foto_pet_${i}`);
                    if (file && file.size > 0) {
                        const foto_base64 = await comprimirImagem(file);
                        payload.pets.push({
                            nome_pet: fd.get(`nome_pet_${i}`),
                            especie: fd.get(`especie_${i}`),
                            raca: fd.get(`raca_${i}`),
                            sexo: fd.get(`sexo_${i}`),
                            ano_nascimento: fd.get(`ano_nasc_${i}`),
                            foto_pet: foto_base64
                        });
                    }
                }

                const req = await fetch(WEBHOOK_PAGO, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                msg.style.color = "green";
                msg.textContent = "✅ Cadastro enviado!";

            } catch (error) {
                msg.style.color = "red";
                msg.textContent = "❌ Erro no envio: " + error.message;
                botao.disabled = false;
            } finally {
                loading.style.display = "none";
            }
        });
    }

    tipoPlano.addEventListener("change", atualizarBlocosPets);
    periodo.addEventListener("change", atualizarValor);
    qtdPetsInput.addEventListener("change", atualizarBlocosPets);

    atualizarBlocosPets();
});
