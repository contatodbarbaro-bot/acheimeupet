// pets-ong.js - Versão corrigida com WhatsApp funcional

const urlParams = new URLSearchParams(window.location.search);
const ongId = urlParams.get("id");

if (!ongId) {
  document.querySelector(".container").innerHTML =
    "<p>ONG não encontrada.</p>";
  throw new Error("ID da ONG não informado");
}

async function carregarPets() {
  const { data, error } = await supabase
    .from("pets_ong_cadastro")
    .select("*")
    .eq("id_ong", ongId)
    .eq("status", "ativo para adoção");

  if (error) {
    console.error("Erro ao buscar pets:", error);
    document.querySelector(".container").innerHTML =
      "<p>Erro ao carregar pets.</p>";
    return;
  }

  if (!data || data.length === 0) {
    document.querySelector(".container").innerHTML =
      "<p>Nenhum pet disponível para adoção.</p>";
    return;
  }

  const container = document.querySelector(".container");
  container.innerHTML = "";

  data.forEach((pet) => {
    const numero = (pet.ong_whatsapp || "").replace(/\D/g, ""); 
    const whatsappLink = numero
      ? `https://wa.me/${numero}`
      : "#";

    const card = `
      <div class="pet-card">
        <img src="${pet.foto_pet || 'https://via.placeholder.com/400'}" alt="${pet.pet_nome}">
        <div class="pet-info">
          <h3>${pet.pet_nome || "Pet sem nome"}</h3>
          <p>${pet.pet_especie || ""} • ${pet.pet_raca || ""}</p>
          <p>Idade: ${pet.pet_idade || "?"}</p>
          <p>${pet.pet_obs || ""}</p>
          <a href="${whatsappLink}" target="_blank">Falar com a ONG</a>
        </div>
      </div>
    `;

    container.innerHTML += card;
  });
}

carregarPets();
