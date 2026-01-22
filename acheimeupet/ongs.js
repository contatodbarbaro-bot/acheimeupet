// ongs.js - Versão Corrigida com verificação de WhatsApp
const grid = document.getElementById("grid");
const search = document.getElementById("search");
const count = document.getElementById("count");

// Função para renderizar os cards das ONGs
function render(list) {
    count.textContent = `${list.length} ONGs cadastradas`;

    if (!list.length) {
        grid.innerHTML = '<div class="empty">Nenhuma ONG encontrada.</div>';
        return;
    }

    grid.innerHTML = list.map(ong => {
        const numeroLimpo = (ong.ong_whatsapp || "").replace(/\D/g, '');
        const temWhatsapp = numeroLimpo.length >= 10; // Verifica se tem pelo menos um número válido
        const whatsappLink = temWhatsapp ? `https://wa.me/55${numeroLimpo}` : "#";
        
        return `
            <div class="card">
                <h3>${ong.ong_nome}</h3>
                <p>${ong.ong_cidade} - ${ong.ong_uf}</p>
                <p>Contato: ${ong.ong_whatsapp || "Não informado"}</p>
                <div class="links">
                    <a href="pets-ong.html?id=${ong.id_ong}">Ver Pets</a>
                    ${temWhatsapp 
                        ? `<a href="${whatsappLink}" target="_blank">WhatsApp</a>` 
                        : `<span class="no-contact" title="WhatsApp não cadastrado">WhatsApp indisponível</span>`
                    }
                </div>
            </div>
        `;
    }).join("");
}

// Função para carregar os dados do Supabase
async function load() {
    try {
        // Garante que estamos usando a instância correta do cliente
        const client = window.supabaseClient || window.supabase;

        if (!client || typeof client.from !== 'function') {
            throw new Error("Cliente Supabase não inicializado corretamente.");
        }

        const { data, error } = await client
            .from("ongs")
            .select("*")
            .order("ong_nome");

        if (error) throw error;

        // Filtro de busca
        search.addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase();
            const filtered = data.filter(ong => 
                ong.ong_nome.toLowerCase().includes(term) || 
                ong.ong_cidade.toLowerCase().includes(term)
            );
            render(filtered);
        });

        render(data);

    } catch (error) {
        console.error("Erro ao carregar ONGs:", error);
        grid.innerHTML = '<div class="error">Erro ao carregar ONGs. Tente novamente mais tarde.</div>';
    }
}

load();
