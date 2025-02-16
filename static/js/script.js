let techniques = {};

// Async function to load techniques
async function loadTechniques() {
  try {
    const response = await fetch("techniques.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    techniques = await response.json();
    return true;
  } catch (error) {
    console.error("Error loading techniques:", error);
    techniquesList.innerHTML = `
                    <div class="error">
                        Failed to load techniques. Please try again later.
                    </div>
                `;
    return false;
  }
}

const searchView = document.getElementById("searchView");
const detailsView = document.getElementById("detailsView");
const searchInput = document.getElementById("searchInput");
const techniquesList = document.getElementById("techniquesList");
const techniqueDetails = document.getElementById("techniqueDetails");

function showSearchView() {
  detailsView.style.display = "none";
  searchView.style.display = "block";
  history.pushState({ view: "search" }, "", "/");
}

function showDetailsView(techniqueName) {
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
                <div class="details-content" style="border: 3px solid ${technique.belt}">
                    <p><strong>Categorie:</strong> ${technique.category}</p>
                    <p><strong>Vertaling:</strong> ${technique.translation}</p>
                    <p><strong>Gordel:</strong> ${technique.belt}</p>
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

function filterTechniques(searchText, mode) {
  if (mode === "") {
    mode = "text";
  }
  let filtered = {};
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
    techniquesList.innerHTML = `
                    <div class="no-results">
                        Geen technieken gevonden met "${searchText}"
                    </div>
                `;
    return;
  }

  techniquesList.innerHTML = filtered
    .map(
      ([name, details]) => `
                    <button class="technique-card" data-technique="${name}" style="background-color: ${details.belt || "#f0f0f0"}">
                        <div class="technique-name">${name}</div>
                        <div class="technique-translation">${details.translation}</div>
                    </button>
                `,
    )
    .join("");
}

// Event Listeners
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
  .addEventListener("click", showSearchView);

window.addEventListener("popstate", (e) => {
  if (e.state?.view === "details") {
    showDetailsView(e.state.technique);
  } else {
    showSearchView();
  }
});

// Async initialization
async function initializeApp() {
  // Disable search while loading
  searchInput.disabled = true;

  // Load techniques
  const success = await loadTechniques();

  if (success) {
    // Enable search
    searchInput.disabled = false;

    // Initialize the view
    filterTechniques("", "text");

    // Check if we should show a specific technique (from URL hash)
    const techniqueName = window.location.hash.slice(1);
    if (techniqueName && techniques[techniqueName]) {
      showDetailsView(techniqueName);
    }
  }
}

let currentBeltFilter = "";

// Add event listeners to belt filters
document.querySelectorAll(".belt-filter").forEach((button) => {
  button.addEventListener("click", (e) => {
    // Remove active class from all buttons
    document
      .querySelectorAll(".belt-filter")
      .forEach((btn) => btn.classList.remove("active"));
    // Add active class to clicked button
    e.target.classList.add("active");

    currentBeltFilter = e.target.dataset.belt;
    filterTechniques(currentBeltFilter, "belt");
  });
});

// Start the app
initializeApp();
