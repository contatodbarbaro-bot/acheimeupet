// 📍 Capturar localização GPS/IP automaticamente (ajustado)
async function capturarLocalizacao() {
  const latInput = document.getElementById("latitude");
  const lngInput = document.getElementById("longitude");
  const srcInput = document.getElementById("loc_source");

  const setValores = (lat, lng, src) => {
    latInput.value = lat || "";
    lngInput.value = lng || "";
    srcInput.value = src || "ip";
  };

  // 🚀 Tentativa real de GPS com feedback ao usuário
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setValores(latitude.toFixed(6), longitude.toFixed(6), "gps");
        console.log("📍 Localização GPS capturada com sucesso!");
      },
      (err) => {
        console.warn("⚠️ Falha no GPS:", err.message);
        // Se falhar, tenta IP
        buscarLocalizacaoPorIP(setValores);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  } else {
    console.warn("⚠️ Navegador sem suporte à geolocalização.");
    buscarLocalizacaoPorIP(setValores);
  }
}

async function buscarLocalizacaoPorIP(setValores) {
  try {
    const ipRes = await fetch("https://ipapi.co/json/");
    const ipData = await ipRes.json();
    if (ipData?.latitude && ipData?.longitude) {
      setValores(ipData.latitude.toFixed(6), ipData.longitude.toFixed(6), "ip");
      console.log("🌍 Localização via IP aplicada.");
    } else {
      setValores("", "", "indefinido");
    }
  } catch (e) {
    console.error("Erro ao buscar localização IP:", e);
    setValores("", "", "indefinido");
  }
}
