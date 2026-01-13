// =============================================
// AcheiMeuPet — pet.js (versão corrigida 19/11)
// Agora consulta dados direto no SUPABASE
// Envia aviso completo ao FiQon (Encontro_Pet_fluxo)
// =============================================

// ===== SUPABASE CONFIG =====
const SUPABASE_URL = "https://rhazoefykocooyjtcqen.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_dtre25HhmJXpPCSKOyKjIw_-AaiL_Vs";

const supabase = window.supabase.createClient(
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
      } else {
        resultado.error = resultado.error || "ip_sem_lat_lng";
      }
    } catch (e) {
      resultado.error = resultado.error || "ip_fetch_error";
    }
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
          (err) => {
            resultado.error = `gps_${err.code}_${err.message}`;
            resolve();
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
      });
    } catch (e) {
      resultado.error = resultado.error || "gps_exception";
    }
  } else {
    resultado.error = "geo_not_supported";
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
  try {
    const tabelas = [
      "Cadastro_pets",
      "Cadastro_free",
      "pets_ong_cadastro",
      "pets_ong_adotados"
    ];

    for (const tabela of tabelas) {
      const { data, error } = await supabase
        .from(tabela)
        .select("*")
        .eq("id_pet", id_pet)
        .single();

      if (data) return data;

      if (error && error.code !== "PGRST116") {
        console.warn(`Erro na tabela ${tabela}:`, error.message);
      }
    }

    exibirErro("Pet não encontrado. Verifique o ID.");
    return null;

  } catch (error) {
    console.error("Erro ao buscar dados do pet:", error);
    exibirErro("Erro ao buscar dados do pet.");
    return null;
  }
}

// ===== Preencher dados =====
function preencherDadosPet(pet) {
  if (!pet) return;

  const imgPet = document.getElementById("foto_pet");
  imgPet.src = pet.foto_pet || "placeholder.png";

  document.getElementById("nome_pet").textContent = pet.nome_pet || "Pet";
  document.getElementById("nome_pet_label").textContent = pet.nome_pet || "-";
  document.getElementById("especie_pet").textContent = pet.especie || "-";
  document.getElementById("raca_pet").textContent = pet.raca || "-";
  document.getElementById("sexo_pet").textContent = pet.sexo || "-";

  const cidade = pet.cidade && pet.uf ? `${pet.cidade} - ${pet.uf}` : "-";
  document.getElementById("cidade_pet").textContent = cidade;

  document.getElementById("nome_tutor").textContent = pet.nome_tutor || "-";
  document.getElementById("whatsapp_tutor").textContent = pet.whatsapp_tutor || "-";

  const btn = document.getElementById("btn_contato");
  if (pet.whatsapp_tutor) {
    btn.href = `https://wa.me/55${pet.whatsapp_tutor.replace(/\D/g, '')}`;
    btn.classList.remove("d-none");
  }

  const formAviso = document.getElementById("formAviso");
  formAviso.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome_encontrador").value.trim();
    const tel = document.getElementById("telefone_encontrador").value.trim();
    const obs = document.getElementById("observacoes").value.trim();

    if (!nome || !tel) {
      alert("Preencha nome e telefone.");
      return;
    }

    const loc = await obterLocalizacaoRobusta();

    const dadosAviso = {
      id_pet: pet.id_pet,
      nome_pet: pet.nome_pet,
      nome_tutor: pet.nome_tutor,
      whatsapp_tutor: pet.whatsapp_tutor,
      email_tutor: pet.email_tutor,
      nome_encontrador: nome,
      telefone_encontrador: tel,
      mensagem: obs || "",
      link_pet: window.location.href,
      latitude: loc.latitude,
      longitude: loc.longitude,
      loc_source: loc.source,
      loc_accuracy: loc.accuracy,
      loc_error: loc.error
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

// ===== Inicialização =====
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

function exibirErro(msg) {
  console.error(msg);
  alert(msg);
}
