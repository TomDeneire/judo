/**
 * CONSTANTS
 */

const resid = await fetch("techniques.json");
// var resid = await fetch("https://tomdeneire.github.io/judo/techniques.json");
const techniquesMap = await resid.json();
const techniques = Object.keys(techniquesMap);
const searchInput = document.getElementById("searchInput");
const autoSuggest = document.getElementById("autoSuggest");
const videoPlayer = document.getElementById("videoPlayer");
const information = document.getElementById("information");
const title = document.getElementById("title");
const translation = document.getElementById("translation");
const infoCard = document.getElementById("infoCard");
const beltTechniques = document.getElementById("beltTechniques");
const beltButtons = beltTechniques.querySelectorAll("button");
const bodyTechniques = document.getElementById("bodyTechniques");
const bodyButtons = bodyTechniques.querySelectorAll("button");

/**
 * HELPER FUNCTIONS
 */

/**
 * Clear screen
 */
function clearScreen() {
  // Clear previous data
  // searchInput.value = "";
  videoPlayer.innerHTML = "";
  autoSuggest.innerHTML = "";
  title.innerHTML = "";
  translation.innerHTML = "";
  information.style.display = "none";
}

/**
 * Extract video ID from YouTube URL
 */
function _getVideoId(url) {
  // Extract video ID from YouTube URL
  const match = url.match(/v=([^&]+)/);
  return match ? match[1] : "";
}

/**
 * Add event listener to auto-suggest list
 */
function _addevent(element) {
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
  li.id = technique;
  li.textContent = technique;
  li.style.backgroundColor = backgroundColors[techniquesMap[technique]["belt"]];
  _addevent(li);
  autoSuggest.appendChild(li);
}

/**
 * Show video technique
 */
function showTechnique(technique) {
  title.innerHTML = technique;
  const videoUrl = techniquesMap[technique]["video"];
  const embedUrl = `https://www.youtube.com/embed/${_getVideoId(videoUrl)}?autoplay=1&mute=1`;
  videoPlayer.innerHTML = `<iframe class="embed-responsive-item" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" src="${embedUrl}" allowfullscreen></iframe>`;
  const translatedTechnique = techniquesMap[technique]["translation"];
  if (translatedTechnique != "") {
    translation.innerHTML = `"${technique}" = "${techniquesMap[technique]["translation"]}"`;
  }
  infoCard.style.borderWidth = "0.4pc";
  infoCard.style.borderColor = techniquesMap[technique]["belt"];
  information.style.display = "block";
}

/**
 * SEARCH FUNCTIONS
 */

/**
 * Search by input
 */
function searchEvent(suggest) {
  const technique = searchInput.value.trim().toLowerCase();

  // Show technique if hit
  if (techniquesMap.hasOwnProperty(technique)) {
    showTechnique(technique);
  } else {
    clearScreen();
  }
  const input = document.getElementById("searchInput").value.toLowerCase();
  autoSuggest.innerHTML = ""; // Clear previous suggestions

  // Search technique
  if (suggest) {
    if (technique.length < 0) {
      return;
    }
    techniques.forEach((technique) => {
      const hit =
        technique.includes(input) ||
        technique.includes(input.replace("katame", "gatame")) ||
        techniquesMap[technique]["translation"].includes(input);
      if (hit) {
        addHitToSuggestions(technique);
      }
    });
  }
}

/**
 * Search by input
 */
function searchBelt(color) {
  clearScreen();
  // Show techniques for this belt
  techniques.forEach((technique) => {
    if (techniquesMap[technique]["belt"] == color) {
      addHitToSuggestions(technique);
    }
  });
}

/*
EVENT LISTENERS
*/

searchInput.addEventListener("input", function () {
  searchEvent(true);
});

beltButtons.forEach((button) => {
  button.addEventListener("click", function () {
    searchBelt(button.id);
  });
});

bodyButtons.forEach((button) => {
  button.addEventListener("click", function () {
    searchInput.value = button.id;
    searchEvent(true);
  });
});
