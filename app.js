// Ganti dengan URL Web App Apps Script Anda
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbxeyH-QzchdP7Jbt7YL9ER_E7gnNCej90UiPp6D5kzF7nmpqbJYYi4WADpQeEsjBBwqcQ/exec";

document.addEventListener("DOMContentLoaded", () => {
  loadDashboardData();

  document.getElementById("form-histori").addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = {
      action: "updateHistori",
      idClass: document.getElementById("idClass").value,
      materi: document.getElementById("materi").value,
      subMateri: document.getElementById("subMateri").value,
      catatan: document.getElementById("catatan").value
    };

    alert("Menyimpan data...");
    await fetch(GAS_API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    alert("Histori berhasil disimpan!");
    document.getElementById("form-histori").reset();
  });
});

async function loadDashboardData() {
  try {
    const response = await fetch(`${GAS_API_URL}?action=getAgendaHarian&hari=Senin`);
    const data = await response.json();

    document.getElementById("ai-message").innerText = data.pesanAsistenAI;

    const listContainer = document.getElementById("jadwal-list");
    listContainer.innerHTML = "";
    data.jadwal.forEach(j => {
      const li = document.createElement("li");
      li.innerText = `${j.jam} - ${j.namaKelas} (${j.idClass})`;
      listContainer.appendChild(li);
    });
  } catch (error) {
    document.getElementById("ai-message").innerText = "Gagal memuat pesan AI.";
  }
}
