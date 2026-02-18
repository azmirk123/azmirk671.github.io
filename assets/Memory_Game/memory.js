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