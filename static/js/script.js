let techniques = {};

const searchView = document.getElementById("searchView");
const detailsView = document.getElementById("detailsView");
const searchInput = document.getElementById("searchInput");
const techniquesList = document.getElementById("techniquesList");
const techniqueDetails = document.getElementById("techniqueDetails");

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

  // Fix: Avoid navigating to root "/"
  history.pushState({ view: "search" }, "", location.pathname);
}

function showDetailsView(techniqueName) {
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
    <div class="details-content" style="border: 3px solid ${technique.belt}; padding: 16px;">
      <p><strong>Categorie:</strong> ${categoryTranslations[technique.category]}</p>
      <p><strong>Vertaling:</strong> ${technique.translation}</p>
      <p><strong>Gordel:</strong> ${beltTranslations[technique.belt]}</p>
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

function filterTechniques(searchText, mode = "text") {
  let filtered = [];

  if (mode === "text") {
    filtered = Object.entries(techniques).filter(([name]) =>
      name.toLowerCase().includes(searchText.toLowerCase()),
    );
  } else if (mode === "belt") {
    filtered = Object.entries(techniques).filter(([_, technique]) =>
      technique.belt.toLowerCase().includes(searchText.toLowerCase()),
    );
  }

  if (filtered.length === 0) {
    techniquesList.innerHTML = `<div class="no-results">Geen technieken gevonden met "${searchText}"</div>`;
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
searchInput.addEventListener("input", (e) =>
  filterTechniques(e.target.value, "text"),
);

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

// Belt filter
document.querySelectorAll(".belt-filter").forEach((button) => {
  button.addEventListener("click", (e) => {
    document
      .querySelectorAll(".belt-filter")
      .forEach((btn) => btn.classList.remove("active"));
    e.target.classList.add("active");

    const belt = e.target.dataset.belt;
    filterTechniques(belt, "belt");
  });
});

// Init app
async function initializeApp() {
  searchInput.disabled = true;

  const success = await loadTechniques();

  if (success) {
    searchInput.disabled = false;
    filterTechniques("", "text");

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
