/* Grocery Store Ticket Queue – 3 Counters, Automatic Handling */

const SERVICE_TIME_MS = 15000; // 15 seconds per customer

// DOM references
const getTicketBtn = document.getElementById("getTicketBtn");
const lastIssuedEl = document.getElementById("lastIssued");
const lastCustomerTicketEl = document.getElementById("lastCustomerTicket");
const peopleWaitingEl = document.getElementById("peopleWaiting");
const busyCountersEl = document.getElementById("busyCounters");

const nowServingTicketEl = document.getElementById("nowServingTicket");
const nowServingCounterEl = document.getElementById("nowServingCounter");
const historyListEl = document.getElementById("historyList");

// State
let lastTicketNumber = 0;
let queue = [];
let history = []; // {ticket, counterId, time} (latest first)

// 3 counters
const counters = [
  { id: 1, ticket: null, busy: false, timerId: null },
  { id: 2, ticket: null, busy: false, timerId: null },
  { id: 3, ticket: null, busy: false, timerId: null }
];

/* ---------- Helpers ---------- */

function formatTicket(num) {
  return "A" + String(num).padStart(3, "0");
}

function saveState() {
  localStorage.setItem("queue_lastTicket", String(lastTicketNumber));
  localStorage.setItem("queue_array", JSON.stringify(queue));
  localStorage.setItem(
    "queue_counters",
    JSON.stringify(
      counters.map(c => ({ id: c.id, ticket: c.ticket, busy: c.busy }))
    )
  );
  localStorage.setItem("queue_history", JSON.stringify(history));
}

function loadState() {
  const savedLast = localStorage.getItem("queue_lastTicket");
  const savedQueue = localStorage.getItem("queue_array");
  const savedCounters = localStorage.getItem("queue_counters");
  const savedHistory = localStorage.getItem("queue_history");

  if (savedLast) lastTicketNumber = Number(savedLast) || 0;
  if (savedQueue) {
    try {
      queue = JSON.parse(savedQueue) || [];
    } catch {
      queue = [];
    }
  }

  if (savedCounters) {
    try {
      const arr = JSON.parse(savedCounters);
      arr.forEach(sc => {
        const counter = counters.find(c => c.id === sc.id);
        if (counter) {
          counter.ticket = sc.ticket;
          counter.busy = sc.busy;
        }
      });
    } catch {
      // ignore
    }
  }

  if (savedHistory) {
    try {
      history = JSON.parse(savedHistory) || [];
    } catch {
      history = [];
    }
  }
}

/* ---------- Audio: simple beep using Web Audio ---------- */
function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch (e) {
    // Audio not critical; ignore errors (older browsers)
  }
}

/* ---------- UI Update ---------- */

function updateQueueStats() {
  peopleWaitingEl.textContent = queue.length.toString();
  const busy = counters.filter(c => c.busy).length;
  busyCountersEl.textContent = `${busy} / ${counters.length}`;
}

function updateCountersUI() {
  counters.forEach(counter => {
    const statusEl = document.getElementById(`counter${counter.id}Status`);
    const ticketEl = document.getElementById(`counter${counter.id}Ticket`);

    if (!statusEl || !ticketEl) return;

    if (counter.busy && counter.ticket != null) {
      statusEl.textContent = "Serving";
      statusEl.classList.remove("free");
      statusEl.classList.add("busy");
      ticketEl.textContent = formatTicket(counter.ticket);
    } else {
      statusEl.textContent = "Free";
      statusEl.classList.remove("busy");
      statusEl.classList.add("free");
      ticketEl.textContent = "–";
    }
  });
}

function updateHistoryUI() {
  historyListEl.innerHTML = "";
  history.forEach(item => {
    const li = document.createElement("li");
    const left = document.createElement("span");
    const right = document.createElement("span");

    left.textContent = `${formatTicket(item.ticket)} → Counter ${item.counterId}`;
    right.textContent = item.time;

    li.appendChild(left);
    li.appendChild(right);
    historyListEl.appendChild(li);
  });
}

function updateLastIssuedUI() {
  if (lastTicketNumber > 0) {
    lastIssuedEl.textContent = formatTicket(lastTicketNumber);
  } else {
    lastIssuedEl.textContent = "None";
  }
}

/* Big “Now Serving” display */
function showNowServing(counter) {
  if (counter && counter.ticket != null) {
    nowServingTicketEl.textContent = formatTicket(counter.ticket);
    nowServingCounterEl.textContent = `Please go to Counter ${counter.id}`;
    nowServingTicketEl.classList.remove("flash");
    void nowServingTicketEl.offsetWidth; // restart animation
    nowServingTicketEl.classList.add("flash");
  } else if (queue.length === 0) {
    nowServingTicketEl.textContent = "–";
    nowServingCounterEl.textContent = "Waiting for next customer…";
  }
}

/* ---------- Core queue logic ---------- */

function startService(counter, ticketNumber) {
  counter.ticket = ticketNumber;
  counter.busy = true;

  // Announce on big screen and play beep
  showNowServing(counter);
  playBeep();

  // Simulate work at the counter
  counter.timerId = setTimeout(() => finishService(counter), SERVICE_TIME_MS);
}

function finishService(counter) {
  if (!counter.busy || counter.ticket == null) return;

  // Add to history (latest first)
  history.unshift({
    ticket: counter.ticket,
    counterId: counter.id,
    time: new Date().toLocaleTimeString()
  });
  if (history.length > 8) history = history.slice(0, 8);

  counter.busy = false;
  counter.ticket = null;
  counter.timerId = null;

  // Try to serve next person automatically
  assignTicketsToFreeCounters();

  saveState();
  updateCountersUI();
  updateQueueStats();
  updateHistoryUI();
  showNowServing(null); // will show waiting text if no one is being served
}

function assignTicketsToFreeCounters() {
  counters.forEach(counter => {
    if (!counter.busy && queue.length > 0) {
      const nextTicket = queue.shift();
      startService(counter, nextTicket);
    }
  });

  updateCountersUI();
  updateQueueStats();
  saveState();
}

/* ---------- Ticket issuing ---------- */

getTicketBtn.addEventListener("click", () => {
  lastTicketNumber += 1;
  const ticketNumber = lastTicketNumber;

  queue.push(ticketNumber);
  lastCustomerTicketEl.textContent = formatTicket(ticketNumber);

  updateLastIssuedUI();
  updateQueueStats();

  // Immediately try to send this person to a counter if free
  assignTicketsToFreeCounters();
});

/* ---------- Init on page load ---------- */

function init() {
  loadState();
  updateLastIssuedUI();
  updateHistoryUI();

  // After loading, counters are considered free (timers can't be restored),
  // so we clear busy flags BUT we keep queue/history/lastTicket for realism.
  counters.forEach(counter => {
    if (counter.busy) {
      counter.busy = false;
      counter.ticket = null;
      counter.timerId = null;
    }
  });

  // Fill counters with waiting customers, if any
  assignTicketsToFreeCounters();

  updateCountersUI();
  updateQueueStats();

  // If nobody is being served and no queue, show idle text
  showNowServing(null);
}

document.addEventListener("DOMContentLoaded", init);
