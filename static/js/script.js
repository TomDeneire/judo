/**
 * CONSTANTS
 */

const resid = await fetch("techniques.json");
// var resid = await fetch("https://tomdeneire.github.io/judo/techniques.json");
const TECHNIQUESMAP = await resid.json();
const TECHNIQUES = Object.keys(TECHNIQUESMAP);
const SEARCHINPUT = document.getElementById("searchInput");
const AUTOSUGGESTCARD = document.getElementById("autoSuggestCard");
const AUTOSUGGEST = document.getElementById("autoSuggest");
const VIDEOPLAYER = document.getElementById("videoPlayer");
const INFORMATION = document.getElementById("information");
const TITLE = document.getElementById("title");
const TRANSLATION = document.getElementById("translation");
const INFOCARD = document.getElementById("infoCard");

/**
 * HELPER FUNCTIONS
 */

/**
 * Clear screen
 */
function clearScreen() {
  VIDEOPLAYER.innerHTML = "";
  AUTOSUGGESTCARD.style.display = "none";
  AUTOSUGGEST.innerHTML = "";
  TITLE.innerHTML = "";
  TRANSLATION.innerHTML = "";
  INFORMATION.style.display = "none";
}

/**
 * Extract video ID from YouTube URL
 */
function getVideoId(url) {
  // Extract video ID from YouTube URL
  const match = url.match(/v=([^&]+)/);
  return match ? match[1] : "";
}

/**
 * Add event listener to auto-suggest list
 */
function addEvent(element) {
  element.addEventListener("click", function () {
    const input = document.getElementById("searchInput");
    input.value = element.innerHTML;
    searchEvent(false);
  });
}

const backgroundColors = {
  yellow: "lightyellow",
  green: "lightgreen",
  orange: "orange",
  blue: "lightblue",
  brown: "sienna",
  "": "lightgrey",
};

/**
 * Add hit to suggestions
 */
function addHitToSuggestions(technique) {
  const li = document.createElement("li");
  li.classList.add("list-group-item");
  li.id = technique;
  li.textContent = technique;
  li.style.backgroundColor = backgroundColors[TECHNIQUESMAP[technique]["belt"]];
  addEvent(li);
  AUTOSUGGEST.appendChild(li);
}

/**
 * Show video technique
 */
function showTechnique(technique) {
  TITLE.innerHTML = technique;
  const videoUrl = TECHNIQUESMAP[technique]["video"];
  const embedUrl = `https://www.youtube.com/embed/${getVideoId(videoUrl)}?autoplay=1&mute=1`;
  VIDEOPLAYER.innerHTML = `<iframe class="embed-responsive-item" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="${embedUrl}" allowfullscreen></iframe>`;
  const translatedTechnique = TECHNIQUESMAP[technique]["translation"];
  if (translatedTechnique != "") {
    TRANSLATION.innerHTML = `"${technique}" = "${TECHNIQUESMAP[technique]["translation"]}"`;
  }
  INFOCARD.style.borderWidth = "0.4pc";
  INFOCARD.style.borderColor = TECHNIQUESMAP[technique]["belt"];
  INFORMATION.style.display = "block";
}

/**
 * SEARCH FUNCTIONS
 */

/**
 * Search by input
 */
function searchEvent(suggest) {
  const technique = SEARCHINPUT.value.trim().toLowerCase();

  // Show technique if hit
  if (TECHNIQUESMAP.hasOwnProperty(technique)) {
    showTechnique(technique);
  } else {
    clearScreen();
  }
  const input = document.getElementById("searchInput").value.toLowerCase();
  AUTOSUGGEST.innerHTML = ""; // Clear previous suggestions

  // Search technique
  if (suggest) {
    if (technique.length < 0) {
      return;
    }
    TECHNIQUES.forEach((technique) => {
      const hit =
        technique.includes(input) ||
        technique.includes(input.replace("katame", "gatame")) ||
        TECHNIQUESMAP[technique]["translation"].includes(input);
      if (hit) {
        if ((AUTOSUGGESTCARD.style.display = "none")) {
          AUTOSUGGESTCARD.style.display = "block";
        }
        addHitToSuggestions(technique);
      }
    });
  }
}

/**
 * Search by input
 */
function searchCategory(searchValue, category) {
  clearScreen();
  AUTOSUGGESTCARD.style.display = "block";
  // Show techniques for this belt
  TECHNIQUES.forEach((technique) => {
    if (TECHNIQUESMAP[technique][category] == searchValue) {
      addHitToSuggestions(technique);
    }
  });
}

/*
EVENT LISTENERS
*/

SEARCHINPUT.addEventListener("input", function () {
  searchEvent(true);
});

document
  .getElementById("beltTechniques")
  .querySelectorAll("button")
  .forEach((button) => {
    button.addEventListener("click", function () {
      searchCategory(button.id, "belt");
    });
  });

document
  .getElementById("categoryTechniques")
  .querySelectorAll("button")
  .forEach((button) => {
    button.addEventListener("click", function () {
      searchCategory(button.id, "category");
    });
  });

document
  .getElementById("bodyTechniques")
  .querySelectorAll("button")
  .forEach((button) => {
    button.addEventListener("click", function () {
      SEARCHINPUT.value = button.id;
      searchEvent(true);
    });
  });

/*
MAIN
*/

clearScreen();
