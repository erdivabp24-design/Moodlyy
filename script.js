
// ======================================
// MOODLY - MOOD DIARY
// Penyimpanan menggunakan localStorage
// ======================================

const STORAGE_KEY = "moodly_diary_entries";

// Ambil data mood dari browser
function getEntries() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (error) {
    return [];
  }
}

// Simpan data mood ke browser
function storeEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// Format tanggal
function formatDate(date) {
  return new Date(date).toLocaleString("id-ID", {
    dateStyle: "full",
    timeStyle: "short"
  });
}

// Tampilkan tanggal hari ini di halaman diary
const currentDate = document.getElementById("currentDate");

if (currentDate) {
  currentDate.textContent = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

// Pilih mood
let selectedMood = null;

const moodButtons = document.querySelectorAll(".mood-option");

moodButtons.forEach(button => {
  button.addEventListener("click", () => {
    // Hilangkan pilihan sebelumnya
    moodButtons.forEach(btn => btn.classList.remove("selected"));

    // Aktifkan pilihan baru
    button.classList.add("selected");

    selectedMood = {
      mood: button.dataset.mood,
      emoji: button.dataset.emoji
    };
  });
});

// Hitung karakter tulisan
const moodStory = document.getElementById("moodStory");
const charCount = document.getElementById("charCount");

if (moodStory && charCount) {
  moodStory.addEventListener("input", () => {
    charCount.textContent = moodStory.value.length;
  });
}

// Tombol simpan mood
const saveButton = document.getElementById("saveMood");
const saveMessage = document.getElementById("saveMessage");

if (saveButton) {
  saveButton.addEventListener("click", () => {
    // Pastikan mood dipilih
    if (!selectedMood) {
      saveMessage.textContent = "Please choose your mood first ♡";
      return;
    }

    const story = moodStory.value.trim();

    if (!story) {
      saveMessage.textContent = "Write a little story about your day first ♡";
      moodStory.focus();
      return;
    }

    const entries = getEntries();

    // Buat catatan baru
    const newEntry = {
      id: Date.now(),
      mood: selectedMood.mood,
      emoji: selectedMood.emoji,
      story: story,
      date: new Date().toISOString()
    };

    // Tambahkan ke urutan paling atas
    entries.unshift(newEntry);

    // Simpan ke browser
    storeEntries(entries);

    // Bersihkan formulir
    moodStory.value = "";
    charCount.textContent = "0";
    selectedMood = null;

    moodButtons.forEach(btn => btn.classList.remove("selected"));

    saveMessage.textContent = "Your mood has been saved successfully! ♡";

    // Perbarui histori
    renderRecentEntries();
  });
}

// Hindari teks diary dianggap sebagai HTML
function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, character => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });
}

// Buat kartu diary
function createEntryCard(entry) {
  return `
    <article class="entry-card">
      <div class="entry-top">
        <div class="entry-emoji">${escapeHTML(entry.emoji)}</div>
        <div>
          <div class="entry-mood">${escapeHTML(entry.mood)}</div>
          <div class="entry-date">${formatDate(entry.date)}</div>
        </div>
      </div>
      <p class="entry-story">${escapeHTML(entry.story)}</p>
    </article>
  `;
}

// Tampilkan 3 histori terbaru di halaman diary
function renderRecentEntries() {
  const container = document.getElementById("recentEntries");

  if (!container) return;

  const entries = getEntries().slice(0, 3);

  if (entries.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🌷</span>
        Your diary is still empty.<br>
        Let's save your first mood today!
      </div>
    `;
    return;
  }

  container.innerHTML = entries.map(createEntryCard).join("");
}

// Tampilkan semua histori di halaman history
function renderAllEntries() {
  const container = document.getElementById("allEntries");

  if (!container) return;

  const entries = getEntries();

  // Hitung total diary
  const totalEntries = document.getElementById("totalEntries");

  if (totalEntries) {
    totalEntries.textContent = entries.length;
  }

  // Hitung mood paling sering dipilih
  const favoriteMood = document.getElementById("favoriteMood");

  if (favoriteMood) {
    if (entries.length === 0) {
      favoriteMood.textContent = "—";
    } else {
      const moodCounts = {};

      entries.forEach(entry => {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      });

      const topMood = Object.entries(moodCounts)
        .sort((a, b) => b[1] - a[1])[0][0];

      favoriteMood.textContent = topMood;
    }
  }

  // Jika belum ada catatan
  if (entries.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">☁️</span>
        No mood history yet.<br>
        Your little memories will appear here.
      </div>
    `;
    return;
  }

  // Tampilkan semua catatan
  container.innerHTML = entries.map(createEntryCard).join("");
}

// Jalankan fungsi sesuai halaman
renderRecentEntries();
renderAllEntries();
