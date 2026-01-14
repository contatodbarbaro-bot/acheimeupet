// pets-ong.js - Versão com novo layout de card

document.addEventListener("DOMContentLoaded", ( ) => {
    const urlParams = new URLSearchParams(window.location.search);
    const ongId = urlParams.get("id");
    const grid = document.getElementById("pets-grid");

    if (!ongId) {
        grid.innerHTML = `<p class="status-message">⚠️ ONG não encontrada. Verifique o link.</p>`;
        console.error("ID da ONG não foi encontrado na URL.");
        return;
    }

    async function carregarPets() {
        const { data, error } = await supabase
            .from("pets_ong_cadastro")
            .select("*")
            .eq("id_ong", ongId)
            .eq("status", "ativo para adoção");

        if (error) {
            console.error("Erro ao buscar pets:", error);
            grid.innerHTML = `<p class="status-message">❌ Ocorreu um erro ao carregar os pets. Tente novamente mais tarde.</p>`;
            return;
        }

        if (!data || data.length === 0) {
            grid.innerHTML = `<p class="status-message">🐾 Nenhum pet disponível para adoção nesta ONG no momento.</p>`;
            return;
        }

        // Limpa a grade antes de adicionar os novos cards
        grid.innerHTML = "";

        data.forEach((pet) => {
            // Garante que o número de WhatsApp está no formato correto para o link
            const numeroLimpo = (pet.ong_whatsapp || "").replace(/\D/g, "");
            const whatsappLink = numeroLimpo ? `https://wa.me/55${numeroLimpo}?text=Olá! Tenho interesse em adotar o(a ) ${pet.pet_nome}.` : "#";

            // Template do novo card com as classes CSS corretas
            const cardHTML = `
                <div class="pet-card">
                    <img src="${pet.foto_pet || 'https://via.placeholder.com/300x300?text=Foto+do+Pet'}" alt="Foto de ${pet.pet_nome}">
                    <div class="pet-info">
                        <h3>${pet.pet_nome || "Pet sem nome"}</h3>
                        <p class="details">${pet.pet_especie || "Espécie não informada"} • ${pet.pet_raca || "SRD"}</p>
                        <p class="details">Idade: ${pet.pet_idade || "Não informada"}</p>
                        <p class="obs">${pet.pet_obs || ""}</p>
                        <a href="${whatsappLink}" target="_blank" class="cta-button">Quero Adotar!</a>
                    </div>
                </div>
            `;

            grid.innerHTML += cardHTML;
        } );
    }

    carregarPets();
});
