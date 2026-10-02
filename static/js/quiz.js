const BELT_ORDER = ["yellow", "orange", "green", "blue", "sienna", "black"];
const BELT_LABELS = {
    yellow: "Geel",
    orange: "Oranje",
    green: "Groen",
    blue: "Blauw",
    sienna: "Bruin",
    black: "Zwart",
};
const IMAGE_DIR = "static/assets/img/techniques/";
const QUESTIONS_PER_ROUND = 10;
const OPTIONS_PER_QUESTION = 3;
const BEST_STORAGE_KEY = "judoQuizRecords";
const PRAISE = ["Juist!", "Top!", "Super!", "Goed zo!", "Knap!"];
const STAR_MESSAGES = [
    "Blijven oefenen, je kan het!",
    "Goed begin!",
    "Goed bezig!",
    "Fantastisch, judokampioen!",
];

let techniques = {};
let credits = {};
let glossary = {};
let showDetails = () => {};
let container = null;

// Current screen and round state, kept so the quiz resumes after viewing a video
let screen = "start";
let round = null;

async function fetchJson(url, fallback) {
    try {
        const response = await fetch(url);
        if (!response.ok) return fallback;
        return await response.json();
    } catch {
        return fallback;
    }
}

export async function initQuiz(options) {
    techniques = options.techniques;
    showDetails = options.showDetails;
    container = document.getElementById("quizView");
    credits = await fetchJson(`${IMAGE_DIR}credits.json`, {});
    glossary = await fetchJson("glossary.json", {});

    container.addEventListener("click", handleClick);
}

export function showQuiz() {
    render();
}

function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}

// Only the first letter is capitalized: "Tate-shiho-gatame"
function displayName(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
}

function imageUrl(name) {
    return IMAGE_DIR + credits[name].file;
}

// Load the next question's images in advance so the page does not reflow when it appears
function preloadNextQuestion() {
    const next = round.questions[round.index + 1];
    if (!next) return;
    const names = next.type === "imageToName" ? [next.target] : next.options;
    names.forEach((name) => {
        new Image().src = imageUrl(name);
    });
}

// Best result per belt as {score, total}, kept in the browser as a convenience
function loadBest() {
    try {
        return JSON.parse(localStorage.getItem(BEST_STORAGE_KEY)) || {};
    } catch {
        return {};
    }
}

function saveBest(best) {
    try {
        localStorage.setItem(BEST_STORAGE_KEY, JSON.stringify(best));
    } catch {
        // Storage unavailable: the record is simply not remembered
    }
}

function starsFor(score, total) {
    const ratio = score / total;
    if (ratio >= 0.9) return 3;
    if (ratio >= 0.7) return 2;
    if (ratio >= 0.4) return 1;
    return 0;
}

function starIcons(count) {
    return "★".repeat(count) + "☆".repeat(3 - count);
}

// Techniques with an image for the chosen belt and all lower belts
function buildPool(belt) {
    const maxLevel = BELT_ORDER.indexOf(belt);
    return Object.entries(techniques)
        .filter(
            ([name, data]) =>
                credits[name] &&
                data.category !== "protocol" &&
                BELT_ORDER.indexOf(data.belt) !== -1 &&
                BELT_ORDER.indexOf(data.belt) <= maxLevel,
        )
        .map(([name]) => name);
}

// Prefer distractors from the same category so the choice is not too easy
function pickDistractors(target, pool) {
    const others = pool.filter((name) => name !== target);
    const category = techniques[target].category;
    const sameCategory = shuffle(
        others.filter((name) => techniques[name].category === category),
    );
    const otherCategory = shuffle(
        others.filter((name) => techniques[name].category !== category),
    );
    return [...sameCategory, ...otherCategory].slice(
        0,
        OPTIONS_PER_QUESTION - 1,
    );
}

function startRound(belt) {
    const pool = buildPool(belt);
    const targets = shuffle(pool).slice(0, QUESTIONS_PER_ROUND);
    round = {
        belt,
        poolSize: pool.length,
        index: 0,
        score: 0,
        streak: 0,
        answer: null,
        // Animations only play right after answering, not when the screen is redrawn
        justAnswered: false,
        praise: "",
        results: [],
        stars: 0,
        newRecord: false,
        record: null,
        questions: targets.map((target) => ({
            target,
            type: Math.random() < 0.5 ? "imageToName" : "nameToImage",
            options: shuffle([target, ...pickDistractors(target, pool)]),
        })),
    };
    screen = round.poolSize < OPTIONS_PER_QUESTION ? "tooFew" : "question";
    render();
}

function answer(name) {
    const correct = name === round.questions[round.index].target;
    round.answer = name;
    round.justAnswered = true;
    round.results.push(correct);
    if (correct) {
        round.score++;
        round.streak++;
        round.praise =
            round.streak >= 3
                ? `${round.streak} op rij! 🔥`
                : randomItem(PRAISE);
    } else {
        round.streak = 0;
    }
    render();
    // Keep the feedback and "next" button visible below tall image options
    container
        .querySelector(".quiz-feedback")
        .scrollIntoView({ behavior: "smooth", block: "nearest" });
    if (correct) {
        const button = container.querySelector(
            `.quiz-option[data-name="${name}"]`,
        );
        confetti(button, 24);
    }
}

function finishRound() {
    const best = loadBest();
    const total = round.questions.length;
    const previous = best[round.belt];
    // Compare ratios because a belt with few images has shorter rounds
    const improved =
        !previous || round.score / total > previous.score / previous.total;
    round.stars = starsFor(round.score, total);
    round.newRecord = improved && round.score > 0;
    if (improved) {
        best[round.belt] = { score: round.score, total };
        saveBest(best);
    }
    round.record = best[round.belt];
    screen = "result";
    render();
    if (round.stars === 3) {
        confetti(container.querySelector(".quiz-stars"), 80);
    }
}

// Burst of colored pieces flying out from the center of an element
function confetti(element, count) {
    if (!element || matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }
    const rect = element.getBoundingClientRect();
    const colors = ["#ffd600", "#ff9100", "#2e7d32", "#1565c0", "#c62828"];
    for (let i = 0; i < count; i++) {
        const piece = document.createElement("span");
        const angle = Math.random() * 2 * Math.PI;
        const distance = 60 + Math.random() * 120;
        piece.className = "confetti-piece";
        piece.style.left = `${rect.left + rect.width / 2}px`;
        piece.style.top = `${rect.top + rect.height / 2}px`;
        piece.style.background = randomItem(colors);
        piece.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
        piece.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
        piece.style.setProperty("--rot", `${Math.random() * 720 - 360}deg`);
        document.body.appendChild(piece);
        piece.addEventListener("animationend", () => piece.remove());
    }
}

// Explain a name word by word from the glossary, plus the full translation
function explanation(name) {
    const parts = name
        .split("-")
        .filter((part) => glossary[part])
        .map(
            (part) =>
                `<span class="quiz-word"><b>${part}</b> ${glossary[part]}</span>`,
        )
        .join("");
    const translation = techniques[name].translation;
    return `${parts ? `<div class="quiz-words">${parts}</div>` : ""}
    <div class="quiz-translation">${translation}</div>`;
}

function helpButton(name) {
    return `<button class="quiz-help" data-action="help" data-name="${name}" title="Wat betekent dit?">?</button>`;
}

function render() {
    if (!container) return;
    const renderers = {
        start: renderStart,
        question: renderQuestion,
        result: renderResult,
        tooFew: renderTooFew,
        credits: renderCredits,
    };
    container.innerHTML = renderers[screen]();
    if (round) round.justAnswered = false;
    if (screen === "question") preloadNextQuestion();
}

function renderStart() {
    const best = loadBest();
    const beltButtons = BELT_ORDER.map(
        (belt) => `
      <div class="quiz-belt">
        <button
          class="belt-filter"
          data-action="start"
          data-belt="${belt}"
          title="${BELT_LABELS[belt]}"
          style="background-color: ${belt}"
        ></button>
        <span class="quiz-belt-stars">${best[belt] ? starIcons(starsFor(best[belt].score, best[belt].total)) : ""}</span>
        <span class="quiz-belt-score">${best[belt] ? `${best[belt].score}/${best[belt].total}` : ""}</span>
      </div>`,
    ).join("");

    return `
    <h2 class="quiz-title">Kies je gordel</h2>
    <p class="quiz-subtitle">Je krijgt vragen over de technieken tot en met die gordel.</p>
    <div class="belt-filters">${beltButtons}</div>
    <button class="quiz-credits-link" data-action="credits">Bronnen afbeeldingen</button>
  `;
}

function renderProgress() {
    const dots = round.questions
        .map((_, i) => {
            if (i < round.results.length) {
                return `<span class="quiz-dot ${round.results[i] ? "correct" : "wrong"}"></span>`;
            }
            return `<span class="quiz-dot ${i === round.index ? "current" : ""}"></span>`;
        })
        .join("");
    const bump = round.justAnswered && round.results.at(-1) ? "bump" : "";
    const streak =
        round.streak >= 2
            ? `<span class="quiz-streak ${bump}">🔥 ${round.streak}</span>`
            : "";

    return `
    <div class="quiz-status">
      <span class="quiz-points ${bump}">⭐ ${round.score}</span>
      ${streak}
    </div>
    <div class="quiz-dots">${dots}</div>
  `;
}

function renderQuestion() {
    const question = round.questions[round.index];
    const answered = round.answer !== null;
    const correct = round.answer === question.target;
    const animate = round.justAnswered;

    const optionClass = (name) => {
        if (!answered) return "";
        if (name === question.target) return `correct ${animate ? "pop" : ""}`;
        if (name === round.answer) return `wrong ${animate ? "shake" : ""}`;
        return "dimmed";
    };

    let prompt;
    let options;
    if (question.type === "imageToName") {
        prompt = `
      <p class="quiz-question">Hoe heet deze techniek?</p>
      <img class="quiz-image" src="${imageUrl(question.target)}" alt="Welke techniek?" />`;
        options = question.options
            .map(
                (name) => `
        <button class="quiz-option quiz-option-name ${optionClass(name)}"
          data-action="answer" data-name="${name}" ${answered ? "disabled" : ""}>
          ${displayName(name)}
        </button>`,
            )
            .join("");
    } else {
        prompt = `
      <p class="quiz-question">Welke afbeelding is</p>
      <p class="quiz-name">${displayName(question.target)} ${helpButton(question.target)}</p>`;
        options = question.options
            .map(
                (name) => `
        <button class="quiz-option quiz-option-image ${optionClass(name)}"
          data-action="answer" data-name="${name}" ${answered ? "disabled" : ""}>
          <img src="${imageUrl(name)}" alt="Keuze" />
        </button>`,
            )
            .join("");
    }

    // A wrong answer always explains the correct name; otherwise it is shown via "?"
    const explanationBox = `
    <div id="quizExplanation" class="quiz-explanation ${answered && !correct ? "visible" : ""}">
      ${answered && !correct ? explanation(question.target) : ""}
    </div>`;

    const isLast = round.index === round.questions.length - 1;
    const feedback = answered
        ? `
      <div class="quiz-feedback ${correct ? "correct" : "wrong"} ${animate ? "slide-in" : ""}">
        <p class="quiz-feedback-title">${correct ? round.praise : "Bijna! Het juiste antwoord is:"}</p>
        <p class="quiz-name">${displayName(question.target)} ${correct ? helpButton(question.target) : ""}</p>
        ${explanationBox}
        <div class="quiz-actions">
          <button class="quiz-link" data-action="video" data-name="${question.target}">bekijk video</button>
          <button class="quiz-next" data-action="next">${isLast ? "resultaat" : "volgende →"}</button>
        </div>
      </div>`
        : "";

    return `
    ${renderProgress()}
    ${prompt}
    <div class="quiz-options ${question.type === "nameToImage" ? "quiz-options-images" : ""}">
      ${options}
    </div>
    ${answered ? feedback : explanationBox}
  `;
}

function renderResult() {
    const stars = [0, 1, 2]
        .map(
            (i) =>
                `<span class="quiz-star ${i < round.stars ? "earned" : ""}" style="animation-delay: ${i * 0.3}s">★</span>`,
        )
        .join("");

    return `
    <h2 class="quiz-title">Klaar!</h2>
    <div class="quiz-stars">${stars}</div>
    <p class="quiz-score">${round.score} / ${round.questions.length}</p>
    <p class="quiz-subtitle">${STAR_MESSAGES[round.stars]}</p>
    ${round.newRecord ? `<p class="quiz-record">🏆 Nieuw record voor ${BELT_LABELS[round.belt].toLowerCase()}!</p>` : `<p class="quiz-subtitle">Record: ${round.record.score} / ${round.record.total}</p>`}
    <div class="quiz-actions">
      <button class="quiz-next" data-action="start" data-belt="${round.belt}">opnieuw</button>
      <button class="quiz-link" data-action="restart">andere gordel</button>
    </div>
  `;
}

function renderTooFew() {
    return `
    <p class="no-results">Er zijn nog niet genoeg afbeeldingen voor deze gordel.</p>
    <div class="quiz-actions">
      <button class="quiz-link" data-action="restart">andere gordel</button>
    </div>
  `;
}

function renderCredits() {
    const rows = Object.entries(credits)
        .map(
            ([name, credit]) => `
      <li>
        <a href="${credit.source}" target="_blank" rel="noopener">${displayName(name)}</a>:
        ${credit.author},
        <a href="${credit.license_url}" target="_blank" rel="noopener">${credit.license}</a>
      </li>`,
        )
        .join("");

    return `
    <button class="back-button" data-action="restart">← terug</button>
    <h2 class="quiz-title">Bronnen afbeeldingen</h2>
    <p>De afbeeldingen komen van Wikimedia Commons.</p>
    <ul class="quiz-credits">${rows}</ul>
  `;
}

function handleClick(event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const { action, name, belt } = button.dataset;

    switch (action) {
        case "start":
            startRound(belt);
            break;
        case "answer":
            if (round.answer === null) answer(name);
            break;
        case "next":
            round.index++;
            round.answer = null;
            if (round.index < round.questions.length) {
                render();
            } else {
                finishRound();
            }
            // Bring the new question (or result) back into view after scrolling down to "next"
            if (container.getBoundingClientRect().top < 0) {
                container.scrollIntoView({ block: "start" });
            }
            break;
        case "help": {
            const box = container.querySelector("#quizExplanation");
            box.innerHTML = explanation(name);
            box.classList.add("visible");
            box.scrollIntoView({ behavior: "smooth", block: "nearest" });
            break;
        }
        case "video":
            showDetails(name);
            break;
        case "restart":
            screen = "start";
            render();
            break;
        case "credits":
            screen = "credits";
            render();
            break;
    }
}
