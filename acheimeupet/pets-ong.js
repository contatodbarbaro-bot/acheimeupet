// pets-ong.js - Versão Corrigida V2
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const ongId = urlParams.get("id");
    const grid = document.getElementById("pets-grid");

    if (!grid) return;

    if (!ongId) {
        grid.innerHTML = `<p class="status-message">⚠️ ONG não encontrada. Verifique o link.</p>`;
        return;
    }

    async function carregarPets() {
        try {
            const client = window.supabaseClient || window.supabase || (typeof supabase !== 'undefined' ? supabase : null);
            
            if (!client) throw new Error("Supabase não inicializado");

            const { data, error } = await client
                .from("pets_ong_cadastro")
                .select("*")
                .eq("id_ong", ongId)
                .eq("status", "ativo para adoção");

            if (error) throw error;

            if (!data || data.length === 0) {
                grid.innerHTML = `<p class="status-message">🐾 Nenhum pet disponível para adoção nesta ONG no momento.</p>`;
                return;
            }

            grid.innerHTML = "";

            data.forEach((pet) => {
                const numeroLimpo = (pet.ong_whatsapp || "").replace(/\D/g, "");
                
                const mensagem = encodeURIComponent(
                    `Olá! Tenho interesse em adotar o(a) *${pet.pet_nome}*.\n\n` +
                    `Vi o perfil no site AcheiMeuPet.\n` +
                    `Link da foto: ${pet.foto_pet || 'Não disponível'}`
                );

                const temWhatsapp = numeroLimpo.length >= 10;
                const whatsappLink = temWhatsapp ? `https://wa.me/55${numeroLimpo}?text=${mensagem}` : "#";

                const cardHTML = `
                    <div class="pet-card">
                        <img src="${pet.foto_pet || 'https://via.placeholder.com/300x300?text=Foto+do+Pet'}" alt="Foto de ${pet.pet_nome}">
                        <div class="pet-info">
                            <h3>${pet.pet_nome || "Pet sem nome"}</h3>
                            <p class="details">${pet.pet_especie || "Espécie não informada"} • ${pet.pet_raca || "SRD"}</p>
                            <p class="details">Idade: ${pet.pet_idade || "Não informada"}</p>
                            <p class="obs">${pet.pet_obs || ""}</p>
                            ${temWhatsapp 
                                ? `<a href="${whatsappLink}" target="_blank" class="cta-button">Quero Adotar!</a>`
                                : `<button class="cta-button disabled" style="background: #ccc; cursor: not-allowed;">WhatsApp Indisponível</button>`
                            }
                        </div>
                    </div>
                `;

                grid.innerHTML += cardHTML;
            });
        } catch (err) {
            console.error("Erro ao carregar pets:", err);
            grid.innerHTML = `<p class="status-message">❌ Erro ao carregar os pets. Tente novamente mais tarde.</p>`;
        }
    }

    carregarPets();
});
