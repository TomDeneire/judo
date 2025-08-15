let techniques = {};
let currentFilters = {
  belt: null,
  category: null,
};

const searchView = document.getElementById("searchView");
const detailsView = document.getElementById("detailsView");
const searchInput = document.getElementById("searchInput");
const techniquesList = document.getElementById("techniquesList");
const techniqueDetails = document.getElementById("techniqueDetails");
const beltFilters = document.getElementById("beltFilters");
const categoryFilters = document.getElementById("categoryFilters");

// Load techniques from JSON
async function loadTechniques() {
  try {
    const response = await fetch("techniques.json");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    techniques = await response.json();
    return true;
  } catch (error) {
    console.error("Error loading techniques:", error);
    techniquesList.innerHTML = `<div class="error">Failed to load techniques. Please try again later.</div>`;
    return false;
  }
}

function showSearchView() {
  detailsView.style.display = "none";
  searchView.style.display = "block";
  beltFilters.style.display = "flex";
  categoryFilters.style.display = "flex";
  history.pushState({ view: "search" }, "", location.pathname);
}

function showDetailsView(techniqueName) {
  beltFilters.style.display = "none";
  categoryFilters.style.display = "none";

  const beltTranslations = {
    white: "Wit",
    yellow: "Geel",
    orange: "Oranje",
    green: "Groen",
    blue: "Blauw",
    sienna: "Bruin",
    black: "Zwart",
  };
  const categoryTranslations = {
    throw: "Worp",
    grip: "Houdgreep",
    strangle: "Wurging",
    clamp: "Klem",
    protocol: "Afspraak",
  };

  const technique = techniques[techniqueName];
  if (!technique) return;

  const videoId = technique.video.split("v=")[1];

  techniqueDetails.innerHTML = `
    <h2 class="technique-name">${techniqueName}</h2>
    <div class="video-container">
      <iframe
        src="https://www.youtube.com/embed/${videoId}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>
    <div class="details-content border" style="border-color: ${technique.belt || "#ccc"};">
      <div class="details-row">
        <div class="details-label">
          <span>&#128193;</span> Categorie
        </div>
        <div class="details-value">
          ${categoryTranslations[technique.category] || technique.category}
        </div>
      </div>
      <div class="details-row bg-light">
        <div class="details-label">
          <span>&#128221;</span> Vertaling
        </div>
        <div class="details-value">
          ${technique.translation}
        </div>
      </div>
      <div class="details-row">
        <div class="details-label">
          <span>&#127942;</span> Gordel
        </div>
        <div class="details-value">
          ${beltTranslations[technique.belt] ?? ""}
        </div>
      </div>
    </div>
  `;

  searchView.style.display = "none";
  detailsView.style.display = "block";

  history.pushState(
    { view: "details", technique: techniqueName },
    "",
    `#${techniqueName}`,
  );
}

function applyFilters(searchText = "") {
  let filtered = Object.entries(techniques);

  // Filter op zoektext
  if (searchText.trim()) {
    filtered = filtered.filter(
      ([name, data]) =>
        name.toLowerCase().includes(searchText.toLowerCase()) ||
        data.translation?.toLowerCase().includes(searchText.toLowerCase()),
    );
  } else {
    // Als geen zoektext: alleen technieken met belt tonen
    filtered = filtered.filter(
      ([_, data]) => data.belt && data.belt.trim() !== "",
    );
  }

  // Filter op belt
  if (currentFilters.belt) {
    filtered = filtered.filter(([_, technique]) =>
      technique.belt.toLowerCase().includes(currentFilters.belt.toLowerCase()),
    );
  }

  // Filter op category
  if (currentFilters.category) {
    filtered = filtered.filter(
      ([_, technique]) => technique.category === currentFilters.category,
    );
  }

  if (filtered.length === 0) {
    techniquesList.innerHTML = `<div class="no-results">Geen technieken gevonden</div>`;
    return;
  }

  techniquesList.innerHTML = filtered
    .map(([name, details]) => {
      const borderColor = details.belt || "#ccc";
      const textColor = "#333";

      return `
      <button
        class="technique-card"
        data-technique="${name}"
        style="border-color: ${borderColor}; color: ${textColor};"
      >
        <div class="technique-name">${name}</div>
        <div class="technique-translation">${details.translation}</div>
      </button>
    `;
    })
    .join("");
}

// Event listeners
searchInput.addEventListener("input", (e) => applyFilters(e.target.value));

document.getElementById("clearFilters").addEventListener("click", () => {
  // Eenvoudige page reload
  window.location.reload();
});

techniquesList.addEventListener("click", (e) => {
  const card = e.target.closest(".technique-card");
  if (card) {
    const technique = card.dataset.technique;
    showDetailsView(technique);
  }
});

document
  .querySelector(".back-button")
  .addEventListener("click", () => window.history.back());

window.addEventListener("popstate", (e) => {
  if (e.state?.view === "details") {
    showDetailsView(e.state.technique);
  } else {
    showSearchView();
  }
});

// Belt filter - aangepast voor gecombineerde filtering
document.querySelectorAll(".belt-filter").forEach((button) => {
  button.addEventListener("click", (e) => {
    const belt = e.target.dataset.belt;

    // Toggle belt filter
    if (currentFilters.belt === belt) {
      // Als dezelfde belt aangeklikt wordt, deactiveer
      currentFilters.belt = null;
      e.target.classList.remove("active");
    } else {
      // Verwijder active van alle belt buttons
      document
        .querySelectorAll(".belt-filter")
        .forEach((btn) => btn.classList.remove("active"));

      // Activeer nieuwe belt
      currentFilters.belt = belt;
      e.target.classList.add("active");
    }

    applyFilters(searchInput.value);
  });
});

// Category filter - aangepast voor gecombineerde filtering
document.querySelectorAll(".category-filter").forEach((button) => {
  button.addEventListener("click", (e) => {
    const category = e.target.dataset.category;

    // Toggle category filter
    if (currentFilters.category === category) {
      // Als dezelfde category aangeklikt wordt, deactiveer
      currentFilters.category = null;
      e.target.classList.remove("active");
    } else {
      // Verwijder active van alle category buttons
      document
        .querySelectorAll(".category-filter")
        .forEach((btn) => btn.classList.remove("active"));

      // Activeer nieuwe category
      currentFilters.category = category;
      e.target.classList.add("active");
    }

    applyFilters(searchInput.value);
  });
});

// Init app
async function initializeApp() {
  searchInput.disabled = true;

  const success = await loadTechniques();

  if (success) {
    searchInput.disabled = false;
    applyFilters("");

    const techniqueName = window.location.hash.slice(1);
    if (techniqueName) {
      const waitForTechnique = () => {
        if (techniques[techniqueName]) {
          showDetailsView(techniqueName);
        } else {
          setTimeout(waitForTechnique, 100);
        }
      };
      waitForTechnique();
    }
  }
}

initializeApp();
