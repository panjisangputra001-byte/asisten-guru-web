
const GAS_API_URL =
  "https://script.google.com/macros/s/AKfycbxeyH-QzchdP7Jbt7YL9ER_E7gnNCej90UiPp6D5kzF7nmpqbJYYi4WADpQeEsjBBwqcQ/exec";

document.addEventListener("DOMContentLoaded", () => {
  loadDashboardData();

  const form = document.getElementById("form-histori");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const idClass = document.getElementById("idClass").value.trim();
    const materi = document.getElementById("materi").value.trim();
    const subMateri = document.getElementById("subMateri").value.trim();
    const catatan = document.getElementById("catatan").value.trim();

    if (!idClass || !materi || !subMateri) {
      showStatus("Lengkapi ID kelas, materi, dan submateri.", "error");
      return;
    }

    const data = {
      action: "updateHistori",
      idClass,
      namaKelas: idClass,
      materi,
      subMateri,
      catatan: catatan || "-"
    };

    const button = form.querySelector("button");
    button.disabled = true;
    button.textContent = "Mengirim...";

    showStatus("Mengirim histori ke server...", "info");

    try {
      /*
       * Apps Script Web App dapat mengalami pembatasan CORS
       * jika dipanggil langsung dari browser Vercel.
       *
       * mode no-cors hanya memberi respons opaque:
       * kita tidak dapat membaca status sukses dari server.
       *
       * Karena itu, jangan menyatakan berhasil hanya
       * berdasarkan selesainya fetch.
       */
      await fetch(GAS_API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(data)
      });

      showStatus(
        "Permintaan dikirim. Periksa Google Sheets untuk memastikan histori tersimpan.",
        "info"
      );

    } catch (error) {
      showStatus(
        "Gagal mengirim histori: " + error.message,
        "error"
      );
    } finally {
      button.disabled = false;
      button.textContent = "Simpan Sesi Mengajar";
    }
  });
});

async function loadDashboardData() {
  const message = document.getElementById("ai-message");
  const list = document.getElementById("jadwal-list");

  message.textContent = "Memuat jadwal dan pesan asisten...";
  list.innerHTML = "";

  try {
    const hari = getHariIndonesia();

    const url =
      `${GAS_API_URL}?action=getAgendaHarian&hari=` +
      encodeURIComponent(hari);

    const response = await fetch(url);
    const result = await response.json();

    if (result.status === "error") {
      throw new Error(result.message || "Gagal memuat data.");
    }

    // Mendukung respons berbentuk {data: {...}}
    // maupun format lama yang langsung berisi jadwal.
    const data = result.data || result;

    message.textContent =
      data.pesanAsistenAI || "Belum ada pesan dari asisten.";

    if (!Array.isArray(data.jadwal) || data.jadwal.length === 0) {
      const li = document.createElement("li");
      li.textContent = "Tidak ada jadwal mengajar hari ini.";
      list.appendChild(li);
      return;
    }

    data.jadwal.forEach((j) => {
      const li = document.createElement("li");
      li.textContent =
        `${j.jam} - ${j.namaKelas} (${j.idClass})`;
      list.appendChild(li);
    });

  } catch (error) {
    message.textContent =
      "Gagal memuat data: " + error.message;
  }
}

function getHariIndonesia() {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    timeZone: "Asia/Jakarta"
  }).format(new Date());
}

function showStatus(text, type) {
  let status = document.getElementById("form-status");

  if (!status) {
    status = document.createElement("p");
    status.id = "form-status";
    status.setAttribute("role", "status");

    const form = document.getElementById("form-histori");
    form.appendChild(status);
  }

  status.textContent = text;
  status.dataset.type = type;
}
