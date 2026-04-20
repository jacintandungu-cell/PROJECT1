const form = document.getElementById("searchForm");
const input = document.getElementById("wordInput");
const resultsDiv = document.getElementById("results");
const favoritesList = document.getElementById("favoritesList");

// Load favorites from localStorage
function loadFavorites() {
  const favorites = Object.keys(localStorage);
  favoritesList.innerHTML = favorites.length
    ? favorites.map(word => `<li>${word}</li>`).join("")
    : "<li>No favorites yet.</li>";
}
loadFavorites();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const word = input.value.trim();
  if (!word) {
    resultsDiv.innerHTML = "<p class='error'>Please enter a word.</p>";
    return;
  }

  resultsDiv.innerHTML = "<p>Loading...</p>";

  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!res.ok) throw new Error("Word not found");
    const data = await res.json();

    const entry = data[0];
    const phonetic = entry.phonetic || "No phonetic available";
    const audio = entry.phonetics.find(p => p.audio)?.audio || null;

    const meanings = entry.meanings.map(m => `
      <div class="meaning">
        <p><strong>${m.partOfSpeech}</strong>: ${m.definitions[0].definition}</p>
        <p><em>Example:</em> ${m.definitions[0].example || "N/A"}</p>
        <p><em>Synonyms:</em> ${m.synonyms.join(", ") || "None"}</p>
      </div>
    `).join("");

    resultsDiv.innerHTML = `
      <h2>${entry.word}</h2>
      <p><strong>Phonetic:</strong> ${phonetic}</p>
      ${audio ? `<audio controls src="${audio}"></audio>` : ""}
      ${meanings}
      <button id="saveBtn">⭐ Save to Favorites</button>
    `;

    document.getElementById("saveBtn").addEventListener("click", () => {
      localStorage.setItem(entry.word, JSON.stringify(entry));
      loadFavorites();
      alert(`${entry.word} saved to favorites!`);
    });

  } catch (err) {
    resultsDiv.innerHTML = `<p class='error'>${err.message}</p>`;
  }
});
