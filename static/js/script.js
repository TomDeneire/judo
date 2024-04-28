document.addEventListener("DOMContentLoaded", async function () {
  var resid = await fetch("techniques.json");
  const techniquesMap = await resid.json();

  const searchInput = document.getElementById("searchInput");
  const autoSuggest = document.getElementById("autoSuggest");
  const videoPlayer = document.getElementById("videoPlayer");
  const information = document.getElementById("information");
  const title = document.getElementById("title");
  const translation = document.getElementById("translation");
  const belt = document.getElementById("belt");

  // Perform search
  function searchEvent(suggest) {
    const inputTechnique = searchInput.value.trim().toLowerCase();
    if (techniquesMap.hasOwnProperty(inputTechnique)) {
      // Show result
      const videoUrl = techniquesMap[inputTechnique]["video"];
      const embedUrl = `https://www.youtube.com/embed/${_getVideoId(videoUrl)}?autoplay=1&mute=1`;
      videoPlayer.innerHTML = `<iframe class="embed-responsive-item" src="${embedUrl}" allowfullscreen></iframe>`;
      translation.innerHTML = techniquesMap[inputTechnique]["translation"];
      title.innerHTML = inputTechnique;
      information.style.display = "block";
      belt.src = `static/assets/img/${techniquesMap[inputTechnique]["belt"]}_belt.png`;
    } else {
      // Clear the video player if invalid technique
      videoPlayer.innerHTML = "";
    }
    const input = document.getElementById("searchInput").value.toLowerCase();
    autoSuggest.innerHTML = ""; // Clear previous suggestions

    if (suggest) {
      for (const key in techniquesMap) {
        if (key.includes(input)) {
          const li = document.createElement("li");
          li.id = key;
          li.textContent = key;
          _addevent(li);
          autoSuggest.appendChild(li);
        }
      }
    }
  }

  searchInput.addEventListener("input", function () {
    searchEvent(true);
  });

  // Extract video ID from YouTube URL
  function _getVideoId(url) {
    const match = url.match(/v=([^&]+)/);
    return match ? match[1] : "";
  }

  // Add event listener to auto-suggest list
  function _addevent(element) {
    element.addEventListener("click", function () {
      const input = document.getElementById("searchInput");
      input.value = element.innerHTML;
      searchEvent(false);
    });
  }
});
