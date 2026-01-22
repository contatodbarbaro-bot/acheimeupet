// =============================================
// AcheiMeuPet — pet.js (VERSÃO CORRIGIDA - TUTOR + ONG)
// =============================================

// ===== SUPABASE CONFIG =====
const SUPABASE_URL = "https://rhazoefykocooyjtcqen.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_dtre25HhmJXpPCSKOyKjIw_-AaiL_Vs";

const sb = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// ===== WEBHOOK AVISO =====
const WEBHOOK_AVISO = "https://webhook.fiqon.app/webhook/a02b8e45-cd21-44e0-a619-be0e64fd9a4b/b9ae07d8-e7af-4b1f-9b1c-a22cc15fb9cd";

// =========================================================
// Localização robusta (GPS -> IP -> vazio)
// =========================================================
async function obterLocalizacaoRobusta() {
  const resultado = {
    latitude: "",
    longitude: "",
    accuracy: "",
    source: "indefinido",
    error: ""
  };

  const tentarIP = async () => {
    try {
      const ipRes = await fetch("https://ipapi.co/json/");
      const ipData = await ipRes.json();
      if (ipData?.latitude && ipData?.longitude) {
        resultado.latitude = Number(ipData.latitude).toFixed(6);
        resultado.longitude = Number(ipData.longitude).toFixed(6);
        resultado.source = "ip";
      }
    } catch (e) {}
    return resultado;
  };

  if ("geolocation" in navigator) {
    try {
      await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resultado.latitude = pos.coords.latitude.toFixed(6);
            resultado.longitude = pos.coords.longitude.toFixed(6);
            resultado.accuracy = String(Math.round(pos.coords.accuracy || 0));
            resultado.source = "gps";
            resolve();
          },
          () => resolve(),
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      });
    } catch (e) {}
  }

  if (!resultado.latitude || !resultado.longitude) {
    await tentarIP();
  }

  return resultado;
}

// ===== Obter ID do pet da URL =====
function obterIdPet() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// ===== Buscar dados do pet (SUPABASE) =====
async function buscarDadosPet(id_pet) {
  const tabelas = [
    "Cadastro_pets",
    "Cadastro_free",
    "pets_ong_cadastro",
    "pets_ong_adotados"
  ];

  for (const tabela of tabelas) {
    const { data } = await sb
      .from(tabela)
      .select("*")
      .eq("id_pet", id_pet)
      .single();

    if (data) return data;
  }

  exibirErro("Pet não encontrado.");
  return null;
}

// ===== Campo flexível =====
function pegarCampo(pet, possibilidades, fallback = "") {
  for (const campo of possibilidades) {
    if (pet[campo] && String(pet[campo]).trim() !== "") {
      return pet[campo];
    }
  }
  return fallback;
}

// ===== Preencher dados =====
function preencherDadosPet(pet) {
  if (!pet) return;

  const nomePet = pegarCampo(pet, ["nome_pet", "pet_nome", "nome"]);
  const especie = pegarCampo(pet, ["especie", "pet_especie"]);
  const raca = pegarCampo(pet, ["raca", "pet_raca"]);
  const sexo = pegarCampo(pet, ["sexo", "pet_sexo"]);
  const foto = pegarCampo(pet, ["foto_pet", "foto", "imagem"]);

  // 👉 RESPONSÁVEL (TUTOR OU ONG)
  const responsavelNome = pegarCampo(
    pet,
    ["nome_tutor", "tutor_nome", "ong_nome"]
  );

  const responsavelWhatsapp = pegarCampo(
    pet,
    ["whatsapp_tutor", "tutor_whatsapp", "ong_whatsapp", "whatsapp"]
  );

  const cidade = pegarCampo(pet, ["cidade", "tutor_cidade", "cidade_tutor"]);
  const uf = pegarCampo(pet, ["uf", "tutor_uf"]);

  if (foto) document.getElementById("foto_pet").src = foto;

  document.getElementById("nome_pet").textContent = nomePet || "Pet não cadastrado";
  document.getElementById("nome_pet_label").textContent = nomePet || "Pet não cadastrado";
  document.getElementById("especie_pet").textContent = especie || "Não informado";
  document.getElementById("raca_pet").textContent = raca || "Não informado";
  document.getElementById("sexo_pet").textContent = sexo || "Não informado";

  document.getElementById("nome_tutor").textContent =
    responsavelNome || "Responsável não informado";

  document.getElementById("whatsapp_tutor").textContent =
    responsavelWhatsapp || "Não informado";

  let localizacao = "";
  if (cidade && uf) localizacao = `${cidade} - ${uf}`;
  else if (cidade) localizacao = cidade;
  else if (uf) localizacao = uf;

  document.getElementById("cidade_pet").textContent =
    localizacao || "Localização não informada";

  const btnContato = document.getElementById("btn_contato");

  if (responsavelWhatsapp) {
    const zap = String(responsavelWhatsapp).replace(/\D/g, "");
    btnContato.href = `https://wa.me/55${zap}?text=Olá%20encontrei%20o%20pet%20${nomePet}!`;
  } else {
    btnContato.style.display = "none";
  }

  const formAviso = document.getElementById("formAviso");

  if (formAviso) {
    formAviso.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nomeEncontrador = document.getElementById("nome_encontrador").value.trim();
      const telefoneEncontrador = document.getElementById("telefone_encontrador").value.trim();
      const observacoes = document.getElementById("observacoes").value.trim();

      if (!nomeEncontrador || !telefoneEncontrador) {
        alert("Preencha nome e telefone.");
        return;
      }

      const loc = await obterLocalizacaoRobusta();

      const dadosAviso = {
        id_pet: pet.id_pet || pet.id,
        nome_pet: nomePet,
        responsavel_nome: responsavelNome,
        responsavel_whatsapp: responsavelWhatsapp,
        nome_encontrador: nomeEncontrador,
        telefone_encontrador: telefoneEncontrador,
        mensagem: observacoes || "",
        link_pet: window.location.href,
        latitude: loc.latitude,
        longitude: loc.longitude
      };

      await fetch(WEBHOOK_AVISO, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosAviso)
      });

      document.getElementById("mensagem_sucesso").style.display = "block";
      formAviso.reset();
    });
  }
}

// ===== Init =====
async function init() {
  const id_pet = obterIdPet();
  if (!id_pet) {
    exibirErro("ID do pet não encontrado.");
    return;
  }

  const pet = await buscarDadosPet(id_pet);
  if (pet) preencherDadosPet(pet);
}

document.addEventListener("DOMContentLoaded", init);

function exibirErro(mensagem) {
  console.error("Erro:", mensagem);
  alert(mensagem);
}
