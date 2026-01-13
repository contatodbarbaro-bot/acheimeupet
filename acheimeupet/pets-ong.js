const grid = document.getElementById("grid");

// Pega o ID da ONG pela URL
const params = new URLSearchParams(window.location.search);
const idOng = params.get("id");

if (!idOng) {
  grid.innerHTML = `<div class="empty">ONG não identificada.</div>`;
  throw new Error("ID da ONG não encontrado na URL");
}

function renderPets(pets) {
  if (!pets.length) {
    grid.innerHTML = `<div class="empty">Nenhum pet disponível para adoção.</div>`;
    return;
  }

  grid.innerHTML = pets.map(pet => `
    <div class="card">
      <img src="${pet.foto_pet || 'https://via.placeholder.com/300x220?text=Sem+Foto'}">
      <h3>${pet.pet_nome || "Sem nome"}</h3>
      <p><strong>Espécie:</strong> ${pet.pet_especie || "-"}</p>
      <p><strong>Raça:</strong> ${pet.pet_raca || "-"}</p>
      <p><strong>Idade:</strong> ${pet.pet_idade || "-"}</p>
      <p><strong>Sexo:</strong> ${pet.pet_sexo || "-"}</p>
      <p>${pet.pet_obs || ""}</p>
    </div>
  `).join("");
}

async function loadPets() {
  const { data, error } = await supabase
    .from("pets_ong_cadastro")
    .select("*")
    .eq("id_ong", idOng)
    .eq("status", "disponivel")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    grid.innerHTML = `<div class="empty">Erro ao carregar os pets.</div>`;
    return;
  }

  renderPets(data);
}

loadPets();
