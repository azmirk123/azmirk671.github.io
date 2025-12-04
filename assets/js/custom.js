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

    <strong>Average Rating:</strong> 
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

