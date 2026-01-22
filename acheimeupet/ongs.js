// ongs.js - Versão Final Corrigida (Tabela: ongs_cadastro)
const grid = document.getElementById("grid");
const search = document.getElementById("search");
const count = document.getElementById("count");

function render(list) {
    if (count) count.textContent = `${list.length} ONGs cadastradas`;

    if (!list.length) {
        grid.innerHTML = '<div class="empty">Nenhuma ONG encontrada.</div>';
        return;
    }

    grid.innerHTML = list.map(ong => {
        const numeroLimpo = (ong.ong_whatsapp || "").replace(/\D/g, '');
        const temWhatsapp = numeroLimpo.length >= 10;
        const whatsappLink = temWhatsapp ? `https://wa.me/55${numeroLimpo}` : "#";
        
        return `
            <div class="card">
                <h3>${ong.ong_nome || "ONG sem nome"}</h3>
                <p>${ong.ong_cidade || ""} - ${ong.ong_uf || ""}</p>
                <p>Contato: ${ong.ong_whatsapp || "Não informado"}</p>
                <div class="links">
                    <a href="pets-ong.html?id=${ong.id_ong}">Ver Pets</a>
                    ${temWhatsapp 
                        ? `<a href="${whatsappLink}" target="_blank">WhatsApp</a>` 
                        : `<span class="no-contact" style="color: #888; font-size: 0.9em;">WhatsApp indisponível</span>`
                    }
                </div>
            </div>
        `;
    }).join("");
}

async function load() {
    try {
        const client = window.supabaseClient || window.supabase || (typeof supabase !== 'undefined' ? supabase : null);

        if (!client) throw new Error("Cliente Supabase não encontrado.");

        // CORREÇÃO: Nome da tabela alterado para ongs_cadastro
        const { data, error } = await client
            .from("ongs_cadastro")
            .select("*");

        if (error) throw error;

        if (search) {
            search.addEventListener("input", (e) => {
                const term = e.target.value.toLowerCase();
                const filtered = data.filter(ong => 
                    (ong.ong_nome && ong.ong_nome.toLowerCase().includes(term)) || 
                    (ong.ong_cidade && ong.ong_cidade.toLowerCase().includes(term))
                );
                render(filtered);
            });
        }

        render(data || []);

    } catch (error) {
        console.error("Erro ao carregar ONGs:", error);
        grid.innerHTML = '<div class="error">Erro ao carregar ONGs. Por favor, verifique a conexão com o banco de dados.</div>';
    }
}

document.addEventListener("DOMContentLoaded", load);
