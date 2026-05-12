/*
  Returners Connect Human Bingo
  Update the CONFIG and PROMPT_POOL sections below as event details change.
*/

const CONFIG = {
  eventName: "Returners Connect",
  gameTitle: "Human Bingo",
  cardCount: 20,
  gridSize: 3,
  centerLogoText: "CIVSA",
  centerSubText: "Annual Conference",
  // Replace this once the final submission destination is known.
  submissionDestination: "the conference team",
  submissionInstructions: "Get three in a row, then send a screenshot to the conference team to be entered for a chance to win a prize."
};

const PROMPT_POOL = [
  "Speaks more than one language",
  "Has a dog",
  "Was born in the same month as you",
  "First time in Minneapolis",
  "Serves on a CIVSA committee",
  "Has attended 5+ CIVSA conferences",
  "Works at the same institution where they graduated from",
  "Has a team of more than 50 ambassadors or tour guides",
  "Has a cat",
  "Has participated in CIVSA's mentorship program",
  "Is currently in a graduate or doctoral program",
  "Is left handed",
  "Is right handed",
  "Works at an institution that is in the SEC Conference",
  "First time attending the annual conference",
  "Wearing CIVSA blue",
  "Has presented at a CIVSA conference",
  "Has worked in admissions for 10+ years",
  "Has worked in admissions for less than 2 years",
  "Traveled more than 500 miles to be here",
  "Has visited Minnesota before",
  "Has a favorite campus tour stop",
  "Uses student ambassadors in their office",
  "Has planned a yield event",
  "Has hosted a large group visit",
  "Works at a public institution",
  "Works at a private institution",
  "Has changed institutions in the last year",
  "Has a campus tradition they love",
  "Has met someone new at this conference today"
];

let cards = [];
let currentCardIndex = 0;
let hasShownWinPopup = false;

function acceptTerms() {
  document.getElementById("welcomePopup").style.display = "none";
  document.getElementById("bingoContainer").style.display = "block";
}

function closeCongrats() {
  document.getElementById("congratsPopup").style.display = "none";
}

function seededRandom(seed) {
  return function random() {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function shuffleWithSeed(array, seed) {
  const copy = [...array];
  const random = seededRandom(seed);
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function generateCards() {
  const spacesNeeded = CONFIG.gridSize * CONFIG.gridSize - 1;
  return Array.from({ length: CONFIG.cardCount }, (_, index) => {
    const prompts = shuffleWithSeed(PROMPT_POOL, 20260512 + index * 97).slice(0, spacesNeeded);
    prompts.splice(Math.floor((CONFIG.gridSize * CONFIG.gridSize) / 2), 0, "CENTER_LOGO");
    return prompts;
  });
}

function getCardStateKey(cardIndex) {
  return `humanBingoCard${cardIndex + 1}`;
}

function loadCardState(cardIndex) {
  try {
    return JSON.parse(localStorage.getItem(getCardStateKey(cardIndex))) || {};
  } catch {
    return {};
  }
}

function saveCardState() {
  const state = {};
  document.querySelectorAll(".person-name").forEach(input => {
    state[input.dataset.index] = input.value;
  });
  localStorage.setItem(getCardStateKey(currentCardIndex), JSON.stringify(state));
  localStorage.setItem("humanBingoPlayerName", document.getElementById("playerName").value);
}

function checkBingo() {
  const size = CONFIG.gridSize;
  const winPatterns = [];

  for (let i = 0; i < size; i++) {
    winPatterns.push([...Array(size).keys()].map(j => `${i}-${j}`));
    winPatterns.push([...Array(size).keys()].map(j => `${j}-${i}`));
  }
  winPatterns.push([...Array(size).keys()].map(i => `${i}-${i}`));
  winPatterns.push([...Array(size).keys()].map(i => `${i}-${size - 1 - i}`));

  return winPatterns.some(pattern =>
    pattern.every(id => document.getElementById(id)?.classList.contains("selected"))
  );
}

function updateWinState() {
  if (checkBingo() && !hasShownWinPopup) {
    hasShownWinPopup = true;
    document.getElementById("congratsText").innerText = `${CONFIG.submissionInstructions}`;
    document.getElementById("congratsPopup").style.display = "flex";
  }
}

function createLogoCell(cell) {
  cell.classList.add("selected", "logo-cell");
  cell.innerHTML = `
    <div class="logo-mark" aria-hidden="true"></div>
    <strong>${CONFIG.centerLogoText}</strong>
    <span>${CONFIG.centerSubText}</span>
  `;
}

function createPromptCell(cell, prompt, index, savedValue) {
  const promptText = document.createElement("p");
  promptText.className = "prompt-text";
  promptText.innerText = prompt;

  const input = document.createElement("input");
  input.className = "person-name";
  input.dataset.index = String(index);
  input.type = "text";
  input.placeholder = "Name";
  input.value = savedValue || "";
  input.setAttribute("aria-label", `${prompt}: person's name`);

  if (input.value.trim()) cell.classList.add("selected");

  input.addEventListener("input", () => {
    cell.classList.toggle("selected", Boolean(input.value.trim()));
    saveCardState();
    updateWinState();
  });

  cell.append(promptText, input);
}

function createGrid(prompts) {
  const grid = document.getElementById("bingoGrid");
  const savedState = loadCardState(currentCardIndex);
  hasShownWinPopup = false;
  grid.innerHTML = "";

  prompts.forEach((prompt, index) => {
    const row = Math.floor(index / CONFIG.gridSize);
    const col = index % CONFIG.gridSize;
    const cell = document.createElement("div");
    cell.id = `${row}-${col}`;
    cell.className = "bingo-cell";

    if (prompt === "CENTER_LOGO") {
      createLogoCell(cell);
    } else {
      createPromptCell(cell, prompt, index, savedState[index]);
    }

    grid.appendChild(cell);
  });

  updateWinState();
}

function populateCardSelect() {
  const select = document.getElementById("cardSelect");
  select.innerHTML = "";
  cards.forEach((_, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.innerText = `Set ${index + 1}`;
    select.appendChild(option);
  });
}

function setCurrentCard(index) {
  currentCardIndex = index;
  document.getElementById("cardSelect").value = String(index);
  const url = new URL(window.location.href);
  url.searchParams.set("card", String(index + 1));
  window.history.replaceState({}, "", url);
  createGrid(cards[currentCardIndex]);
}

function resetCurrentCard() {
  if (!confirm("Clear names from this card?")) return;
  localStorage.removeItem(getCardStateKey(currentCardIndex));
  createGrid(cards[currentCardIndex]);
}

window.addEventListener("DOMContentLoaded", () => {
  cards = generateCards();
  populateCardSelect();

  document.getElementById("submissionText").innerText = CONFIG.submissionInstructions;
  document.getElementById("playerName").value = localStorage.getItem("humanBingoPlayerName") || "";
  document.getElementById("playerName").addEventListener("input", saveCardState);

  document.getElementById("cardSelect").addEventListener("change", event => {
    setCurrentCard(Number(event.target.value));
  });

  document.getElementById("randomCardButton").addEventListener("click", () => {
    setCurrentCard(Math.floor(Math.random() * cards.length));
  });

  document.getElementById("resetButton").addEventListener("click", resetCurrentCard);

  const urlCard = Number(new URLSearchParams(window.location.search).get("card"));
  const startingCard = Number.isInteger(urlCard) && urlCard >= 1 && urlCard <= CONFIG.cardCount
    ? urlCard - 1
    : Math.floor(Math.random() * cards.length);

  setCurrentCard(startingCard);
});