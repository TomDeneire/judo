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
const card = document.getElementById("card");
const beltTechniques = document.getElementById("beltTechniques");
const buttons = beltTechniques.querySelectorAll("button");

/**
 * HELPER FUNCTIONS
 */

/**
 * Clear previous result on screen
 */
function clearPreviousResult() {
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

/**
 * Add hit to suggestions
 */
function addHitToSuggestions(technique) {
  const li = document.createElement("li");
  li.id = technique;
  li.textContent = technique;
  _addevent(li);
  autoSuggest.appendChild(li);
}

/**
 * Show video technique
 */
function showTechnique(technique) {
  const videoUrl = techniquesMap[technique]["video"];
  const embedUrl = `https://www.youtube.com/embed/${_getVideoId(videoUrl)}?autoplay=1&mute=1`;
  videoPlayer.innerHTML = `<iframe class="embed-responsive-item" style="width: 100%; height: 100%;" src="${embedUrl}" allowfullscreen></iframe>`;
  translation.innerHTML = `"${technique}" = "${techniquesMap[technique]["translation"]}`;
  title.innerHTML = technique;
  information.style.display = "block";
  card.style.borderWidth = "1pc";
  card.style.borderColor = techniquesMap[technique]["belt"];
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
    clearPreviousResult();
  }
  const input = document.getElementById("searchInput").value.toLowerCase();
  autoSuggest.innerHTML = ""; // Clear previous suggestions

  // Search technique
  if (suggest) {
    techniques.forEach((technique) => {
      const hit =
        technique.includes(input) ||
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
  clearPreviousResult();
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

buttons.forEach((button) => {
  button.addEventListener("click", function () {
    searchBelt(button.id);
  });
});
