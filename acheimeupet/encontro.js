// =============================
// AcheiMeuPet — Encontro (Front)
// =============================

// 🔗 API pública (Apps Script)
const API_URL = "https://script.google.com/macros/s/AKfycbz5pxePvVWe6zYI6hqIAXT1mMO0-0NNViyA2PfkFWvdsmD55bFBNT5tlwqxQdsOyEnq7w/exec";

// 🔗 Webhook oficial do Fiqon — fluxo Encontro_Pet_Fiqon
const WEBHOOK_FIQON = "https://webhook.fiqon.app/webhook/a02b8e45-cd21-44e0-a619-be0e64fd9a4b/b9ae07d8-e7af-4b1f-9b1c-a22cc15fb9cd";

// Utilitário
function getParam(name) {
  const u = new URL(window.location.href);
  return u.searchParams.get(name);
}

// 🟢 Buscar dados do pet
async function buscarDadosPet() {
  const id = getParam("id");
  if (!id) return mostrarErro("ID do pet não informado.");

  try {
    const response = await fetch(`${API_URL}?id=${encodeURIComponent(id)}`);
    const data = await response.json();

    if (!data || data.status !== "sucesso") throw new Error("Pet não encontrado.");
    preencherFicha(data.pet);
  } catch (e) {
    console.error("❌ Erro:", e);
    mostrarErro("⚠️ Não foi possível carregar as informações deste pet. Tente novamente mais tarde.");
  }
}

// 🐾 Preencher ficha
function preencherFicha(pet) {
  document.getElementById("nomePet").textContent = pet.nome_pet || "-";
  document.getElementById("especiePet").textContent = pet.especie || "-";
  document.getElementById("racaPet").textContent = pet.raca || "-";
  document.getElementById("sexoPet").textContent = pet.sexo || "-";
  document.getElementById("tutorPet").textContent = pet.nome_tutor || "-";
  document.getElementById("cidadePet").textContent = pet.cidade || "-";

  // Foto
  if (pet.foto_pet && pet.foto_pet.startsWith("http"))
    document.getElementById("fotoPet").src = pet.foto_pet;

  // 🔗 WhatsApp do tutor
  const rawTutorPhone = pet.whatsapp_tutor || pet.telefone_tutor || "";
  const telTutor = String(rawTutorPhone).replace(/\D/g, "");

  if (telTutor.length >= 10) {
    const msg = `Olá ${pet.nome_tutor}, encontrei seu pet ${pet.nome_pet} pelo sistema AcheiMeuPet 🐾`;
    const link = `https://wa.me/55${telTutor}?text=${encodeURIComponent(msg)}`;
    const btn = document.getElementById("btnWhatsTutor");
    btn.href = link;
    btn.style.display = "block";
  }
}

// ⚠️ Exibir erro visual
function mostrarErro(msg) {
  const container = document.querySelector(".container");
  container.innerHTML = `
    <div style="
      background:#fff3cd;
      border:1px solid #ffe69c;
      color:#664d03;
      padding:20px;
      border-radius:10px;
      line-height:1.6em;">
      <strong>Oops!</strong> ${msg}<br><br>
      <small>Sistema AcheiMeuPet 🐾 — em memória do Picolé ❤️</small>
    </div>`;
}

// 📍 Capturar localização GPS/IP automaticamente
async function capturarLocalizacao() {
  const latInput = document.getElementById("latitude");
  const lngInput = document.getElementById("longitude");
  const srcInput = document.getElementById("loc_source");

  const setValores = (lat, lng, src) => {
    latInput.value = lat || "";
    lngInput.value = lng || "";
    srcInput.value = src || "ip";
  };

  // Tentativa de GPS
  if ("geolocation" in navigator) {
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 7000,
          maximumAge: 0
        });
      });
      const { latitude, longitude } = pos.coords;
      if (latitude && longitude) {
        setValores(latitude.toFixed(6), longitude.toFixed(6), "gps");
        return;
      }
    } catch {
      // ignora e cai pro IP
    }
  }

  // Fallback: localização aproximada por IP
  try {
    const ipRes = await fetch("https://ipapi.co/json/");
    const ipData = await ipRes.json();
    if (ipData && ipData.latitude && ipData.longitude) {
      setValores(ipData.latitude.toFixed(6), ipData.longitude.toFixed(6), "ip");
    } else {
      setValores("", "", "indefinido");
    }
  } catch {
    setValores("", "", "indefinido");
  }
}

// 🚀 Enviar formulário ao Fiqon (com IP público e localização)
async function enviarAoTutor() {
  const nome = document.getElementById("nomeEncontrador").value.trim();
  const telefone = document.getElementById("telefoneEncontrador").value.replace(/\D/g, "");
  const mensagem = document.getElementById("mensagem").value.trim();
  const id = getParam("id");

  if (!nome || telefone.length < 10) {
    alert("Por favor, preencha seu nome e telefone corretamente.");
    return;
  }

  const btn = document.getElementById("btnEnviar");
  btn.disabled = true;
  btn.textContent = "Enviando...";

  try {
    // Captura IP público
    const ipRes = await fetch("https://api.ipify.org?format=json");
    const ipData = await ipRes.json();
    const ipPublico = ipData.ip || "indisponível";

    // Captura localização (GPS/IP)
    const lat = document.getElementById("latitude").value || "";
    const lng = document.getElementById("longitude").value || "";
    const locSrc = document.getElementById("loc_source").value || "indefinido";

    // Payload completo
    const payload = {
      id_pet: id,
      nome_encontrador: nome,
      telefone_encontrador: telefone,
      mensagem: mensagem,
      origem: "pagina_encontro",
      ip_publico: ipPublico,
      latitude: lat,
      longitude: lng,
      loc_source: locSrc,
      timestamp: new Date().toISOString()
    };

    const res = await fetch(WEBHOOK_FIQON, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert("Mensagem enviada! O tutor será avisado automaticamente 🐶❤️");
      document.getElementById("formEncontrador").reset();
    } else {
      alert("Erro ao enviar. Tente novamente mais tarde.");
    }
  } catch (err) {
    console.error(err);
    alert("Falha de conexão. Verifique sua internet e tente novamente.");
  } finally {
    btn.disabled = false;
    btn.textContent = "Enviar Mensagem ao Tutor";
  }
}

// 🧩 Inicialização
document.addEventListener("DOMContentLoaded", () => {
  buscarDadosPet();
  capturarLocalizacao(); // <- nova função automática
  document.getElementById("btnEnviar").addEventListener("click", enviarAoTutor);
});
