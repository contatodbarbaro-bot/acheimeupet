const grid = document.getElementById("grid");
const search = document.getElementById("search");
const count = document.getElementById("count");

function render(list) {
  count.textContent = `${list.length} ONGs cadastradas`;

  if (!list.length) {
    grid.innerHTML = `<div class="empty">Nenhuma ONG encontrada.</div>`;
    return;
  }

  grid.innerHTML = list.map(ong => `
    <div class="card">
      <h3>${ong.ong_nome}</h3>
      <p>${ong.ong_cidade} - ${ong.ong_uf}</p>
      <p>Contato: ${ong.ong_whatsapp || "Não informado"}</p>
      <div class="links">
        <a href="/pets-ong.html?id=${ong.id_ong}">Ver Pets</a>
        <a href="https://wa.me/55${(ong.ong_whatsapp || "").replace(/\D/g,'')}" target="_blank">WhatsApp</a>
      </div>
    </div>
  `).join("");
}

async function load() {
  const { data, error } = await supabase
    .from("ongs_cadastro")
    .select("*")
    .eq("status", "aprovada")   // <-- bate com seu banco
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    grid.innerHTML = `<div class="empty">Erro ao carregar ONGs.</div>`;
    return;
  }

  render(data);

  search.addEventListener("input", () => {
    const q = search.value.toLowerCase();
    const filtered = data.filter(o =>
      `${o.ong_nome} ${o.ong_cidade}`.toLowerCase().includes(q)
    );
    render(filtered);
  });
}

load();
