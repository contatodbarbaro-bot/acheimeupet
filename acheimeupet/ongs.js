// ongs.js - Versão Corrigida
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

  grid.innerHTML = list.map(ong => `
    <div class="card">
      <h3>${ong.ong_nome}</h3>
      <p>${ong.ong_cidade} - ${ong.ong_uf}</p>
      <p>Contato: ${ong.ong_whatsapp || "Não informado"}</p>
      <div class="links">
        <a href="/pets-ong.html?id=${ong.id_ong}">Ver Pets</a>
        <a href="https://wa.me/55${(ong.ong_whatsapp || "").replace(/\D/g, '')}" target="_blank">WhatsApp</a>
      </div>
    </div>
  `).join("");
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
      .from("ongs_cadastro")
      .select("*")
      .eq("status", "aprovada")
      .order("created_at", { ascending: false });

    if (error) throw error;

    render(data);

    // Configura a busca em tempo real
    search.addEventListener("input", () => {
      const q = search.value.toLowerCase();
      const filtered = data.filter(o => 
        `${o.ong_nome} ${o.ong_cidade}`.toLowerCase().includes(q)
      );
      render(filtered);
    });

  } catch (error) {
    console.error("Erro ao carregar ONGs:", error);
    grid.innerHTML = `<div class="empty">Erro ao carregar ONGs: ${error.message}</div>`;
  }
}

// Inicializa o carregamento
document.addEventListener("DOMContentLoaded", load);
