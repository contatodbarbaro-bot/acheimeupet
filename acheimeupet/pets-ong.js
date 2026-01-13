const container = document.querySelector(".container");

// Pega o ID da ONG da URL
const params = new URLSearchParams(window.location.search);
const idOng = params.get("id");

if (!idOng) {
  container.innerHTML = "<p>ONG não informada.</p>";
  throw new Error("ID da ONG não encontrado na URL");
}

async function loadPets() {
  const { data, error } = await supabase
    .from("pets_ong_cadastro")
    .select("*")
    .eq("id_ong", idOng)
    .eq("status", "ativo para adoção")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    container.innerHTML = "<p>Erro ao carregar pets.</p>";
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = "<p>Nenhum pet disponível para adoção.</p>";
    return;
  }

  container.innerHTML = data.map(pet => `
    <div class="card">
      <img src="${pet.foto_pet || 'https://via.placeholder.com/300'}" alt="${pet.pet_nome}">
      <h3>${pet.pet_nome}</h3>
      <p>${pet.pet_especie} • ${pet.pet_raca || 'SRD'}</p>
      <p>Idade: ${pet.pet_idade || 'Não informada'}</p>
      <p>${pet.pet_obs || ''}</p>
      <a href="https://wa.me/55${pet.link_pet?.replace(/\D/g,'') || ''}" target="_blank">Falar com a ONG</a>
    </div>
  `).join("");
}

loadPets();
