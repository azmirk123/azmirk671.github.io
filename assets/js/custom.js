// LAB 11 — FORM VALIDATION + RATING
const form = document.getElementById("feedbackForm");
const resultBox = document.getElementById("resultBox");
const popup = document.getElementById("successPopup");
const submitBtn = document.getElementById("submitBtn");

// Input fields
const fields = ["name", "surname", "email", "phone", "address"];

// Validation regex patterns
const patterns = {
  name: /^[A-Za-z]{2,}$/,
  surname: /^[A-Za-z]{2,}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\+?\d{7,15}$/,
  address: /^.{5,}$/
};

// Real-time validation
fields.forEach(id => {
  document.getElementById(id).addEventListener("input", validateForm);
});

function validateForm() {
  let valid = true;

  fields.forEach(id => {
    const el = document.getElementById(id);
    const error = document.getElementById(id + "Error");

    if (!patterns[id].test(el.value.trim())) {
      error.textContent = "Invalid " + id;
      valid = false;
    } else {
      error.textContent = "";
    }
  });

  submitBtn.disabled = !valid;
}

// Submit Handler
form.addEventListener("submit", function (e) {
  e.preventDefault();

  // Gather names properly
  const firstName = document.getElementById("name").value;
  const lastName = document.getElementById("surname").value;

  const emailVal = document.getElementById("email").value;
  const phoneVal = document.getElementById("phone").value;
  const addressVal = document.getElementById("address").value;

  // Ratings
  const r1 = Number(rating1.value);
  const r2 = Number(rating2.value);
  const r3 = Number(rating3.value);

  const avg = (r1 + r2 + r3) / 3;

  let boxClass = "result-success";
  if (avg < 4) boxClass = "result-danger";
  else if (avg < 7) boxClass = "result-warning";

  resultBox.className = `result-box ${boxClass}`;
  resultBox.style.display = "block";

// Build output box
resultBox.className = `result-box ${boxClass}`;
resultBox.style.display = "block";

resultBox.innerHTML = `
    <strong>Form Data Saved!</strong><br>
    Name & Surname: ${firstName} ${lastName}<br>
    Email: ${emailVal}<br>
    Phone: ${phoneVal}<br>
    Address: ${addressVal}<br><br>

    <strong>${firstName} ${lastName}:</strong>  
    <span id="avgValue">${avg.toFixed(2)}</span>
`;

// Color the average number correctly
const avgSpan = document.getElementById("avgValue");

if (avg < 4) {
    avgSpan.style.color = "red";
} else if (avg < 7) {
    avgSpan.style.color = "orange";
} else {
    avgSpan.style.color = "green";
}

  showPopup();
});

// Popup animation
function showPopup() {
  popup.classList.add("show");
  setTimeout(() => popup.classList.remove("show"), 2500);
}

/* =========================================================
   LAB 12 – MEMORY GAME + OPTIONAL TASK
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const board = document.getElementById("memoryBoard");
  const difficultySelect = document.getElementById("difficultySelect");
  const startBtn = document.getElementById("startGameBtn");
  const restartBtn = document.getElementById("restartGameBtn");
  const movesSpan = document.getElementById("movesCount");
  const matchesSpan = document.getElementById("matchesCount");
  const totalPairsSpan = document.getElementById("totalPairs");
  const bestScoreSpan = document.getElementById("bestScore");
  const timerDisplay = document.getElementById("timerDisplay");
  const winMessage = document.getElementById("winMessage");

  if (!board) return;

  // Icons dataset
  const icons = ["🐱","🐶","🦊","🐼","🐸","🐵","🐔","🦄","🐙","🐠","🦁","🐧"];

  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;

  let moves = 0;
  let matches = 0;
  let totalPairs = 0;
  let currentDifficulty = "easy";

  /* ===== TIMER ===== */
  let timer = 0;          // seconds
  let timerInterval = null;

  function startTimer() {
    stopTimer();
    timer = 0;
    timerDisplay.textContent = "00:00";
    timerInterval = setInterval(() => {
      timer++;
      const minutes = String(Math.floor(timer / 60)).padStart(2, '0');
      const seconds = String(timer % 60).padStart(2, '0');
      timerDisplay.textContent = `${minutes}:${seconds}`;
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
  }

  /* ===== BEST SCORE (localStorage) ===== */
  function getBestScore(diff) {
    return localStorage.getItem(`memory_best_${diff}`);
  }

  function setBestScore(diff, score) {
    localStorage.setItem(`memory_best_${diff}`, score);
  }

  function updateBestScoreDisplay() {
    const best = getBestScore(currentDifficulty);
    bestScoreSpan.textContent = best ? best : "—";
  }

  /* ===== BASIC UTILS ===== */
  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function resetStats() {
    moves = 0;
    matches = 0;
    movesSpan.textContent = "0";
    matchesSpan.textContent = "0";
    winMessage.classList.add("d-none");
  }

  function updateStats() {
    movesSpan.textContent = moves;
    matchesSpan.textContent = matches;
  }

  /* ===== GAME BOARD ===== */
  function buildBoard() {
    currentDifficulty = difficultySelect.value;
    const pairsCount = currentDifficulty === "easy" ? 6 : 12;
    totalPairs = pairsCount;
    totalPairsSpan.textContent = pairsCount;

    updateBestScoreDisplay();

    const selectedIcons = icons.slice(0, pairsCount);
    const cardValues = shuffle([...selectedIcons, ...selectedIcons]);

    board.classList.remove("memory-grid-easy", "memory-grid-hard");
    board.classList.add(
      currentDifficulty === "easy" ? "memory-grid-easy" : "memory-grid-hard"
    );

    board.innerHTML = "";

    cardValues.forEach((value) => {
      const card = document.createElement("div");
      card.classList.add("memory-card");
      card.dataset.value = value;

      card.innerHTML = `
        <div class="memory-card-inner">
          <div class="memory-card-face memory-card-front">?</div>
          <div class="memory-card-face memory-card-back">${value}</div>
        </div>
      `;

      card.addEventListener("click", () => handleCardClick(card));
      board.appendChild(card);
    });
  }

  function handleCardClick(card) {
    if (lockBoard || card.classList.contains("flipped") || card.classList.contains("matched")) return;

    card.classList.add("flipped");

    if (!firstCard) {
      firstCard = card;
      return;
    }

    secondCard = card;
    moves++;
    updateStats();

    checkForMatch();
  }

  function checkForMatch() {
    const isMatch = firstCard.dataset.value === secondCard.dataset.value;

    if (isMatch) {
      handleMatch();
    } else {
      unflipCards();
    }
  }

  function handleMatch() {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");

    matches++;
    updateStats();
    resetTurn();

    if (matches === totalPairs) {
      stopTimer();
      winMessage.classList.remove("d-none");

      const best = getBestScore(currentDifficulty);
      if (!best || moves < best) {
        setBestScore(currentDifficulty, moves);
        updateBestScoreDisplay();
      }
    }
  }

  function unflipCards() {
    lockBoard = true;

    setTimeout(() => {
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      resetTurn();
    }, 800);
  }

  function resetTurn() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
  }

  /* ===== GAME CONTROL ===== */
  function startGame() {
    stopTimer();
    startTimer();
    resetStats();
    buildBoard();
  }

  startBtn.addEventListener("click", startGame);

  restartBtn.addEventListener("click", () => {
    startGame();
  });

  difficultySelect.addEventListener("change", () => {
    startGame();
  });

  // Prepare board on page load, but DO NOT start timer
  buildBoard();
  resetStats();
  timerDisplay.textContent = "00:00";

});

