// ====================================================
// MÓDULO: pet.js — AcheiMeuPet
// Exibe as informações do pet com base no ID da URL
// ====================================================

// === Função para obter o ID do pet da URL ===
function obterIdPet() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// === Função para buscar os dados do pet ===
// (Simulação temporária — no futuro virá do banco ou planilha)
function buscarDadosPet(id_pet) {
  // Aqui simulamos os dados com base no ID recebido.
  // Em produção, faremos um fetch para o backend/planilha.
  return {
    id_pet,
    nome_pet: "Picolé",
    especie: "Cachorro",
    raca: "SRD",
    sexo: "Macho",
    cidade: "Ribeirão Preto",
    uf: "SP",
    nome_tutor: "Douglas Bárbaro",
    whatsapp_tutor: "(16) 99999-9999",
    foto_pet: "https://projetoacheimeupet.com.br/imagens/pets/default_pet.jpg",
    link_qr: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://projetoacheimeupet.com.br/pet?id=${id_pet}`,
    data_cadastro: "2025-10-30"
  };
}

// === Função para preencher os dados na página ===
function preencherDadosPet(dados) {
  document.getElementById("foto_pet").src = dados.foto_pet;
  document.getElementById("nome_pet").textContent = dados.nome_pet;
  document.getElementById("raca_pet").textContent = dados.raca;
  document.getElementById("sexo_pet").textContent = dados.sexo;
  document.getElementById("especie_pet").textContent = dados.especie;
  document.getElementById("cidade_pet").textContent = `${dados.cidade} - ${dados.uf}`;
  document.getElementById("nome_tutor").textContent = dados.nome_tutor;
  document.getElementById("whatsapp_tutor").textContent = dados.whatsapp_tutor;
  document.getElementById("qr_code").src = dados.link_qr;
  document.getElementById("data_cadastro").textContent = dados.data_cadastro;
}

// === Execução automática ao carregar a página ===
document.addEventListener("DOMContentLoaded", () => {
  const id_pet = obterIdPet();

  if (!id_pet) {
    document.body.innerHTML = `
      <div style="text-align:center; padding:40px; font-family:sans-serif;">
        <h2>⚠️ ID do Pet não encontrado!</h2>
        <p>Verifique o link e tente novamente.</p>
      </div>
    `;
    return;
  }

  // Busca os dados simulados
  const dadosPet = buscarDadosPet(id_pet);

  // Preenche o conteúdo na página
  preencherDadosPet(dadosPet);
});
