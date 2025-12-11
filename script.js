// =========================
// Helpers: generic storage
// =========================
function loadFromStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch (e) {
    console.error("Error loading", key, e);
    return [];
  }
}
function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadWorksheets() { return loadFromStorage("worksheets"); }
function saveWorksheets(data) { saveToStorage("worksheets", data); }

// =========================
// Login
// =========================
function initLogin() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value.trim();

    const ADMIN_EMAIL = "admin@thinkable.com";
    const ADMIN_PW = "admin123";
    const PARENT_EMAIL = "parent@thinkable.com";
    const PARENT_PW = "parent123";
    const STUDENT_EMAIL = "student@thinkable.com";
    const STUDENT_PW = "student123";

    if (email === ADMIN_EMAIL && password === ADMIN_PW) {
      window.location.href = "admin/home.html";
    } else if (email === PARENT_EMAIL && password === PARENT_PW) {
      window.location.href = "parent/home.html";
    } else if (email === STUDENT_EMAIL && password === STUDENT_PW) {
      window.location.href = "student/home.html";
    } else {
      alert("Invalid login. Please check your email and password.");
    }
  });
}

// =========================
// Dark Mode
// =========================
function applySavedDarkMode() {
  const enabled = localStorage.getItem("darkMode") === "true";
  if (enabled) document.body.classList.add("dark");
}
function toggleDarkMode() {
  const enabled = document.getElementById("darkModeToggle").checked;
  document.body.classList.toggle("dark", enabled);
  localStorage.setItem("darkMode", enabled);
}

// =========================
// Large Text Mode
// =========================
function applySavedLargeText() {
  const enabled = localStorage.getItem("largeText") === "true";
  if (enabled) document.body.classList.add("largeText");
}
function toggleLargeText() {
  const enabled = document.getElementById("largeTextToggle").checked;
  document.body.classList.toggle("largeText", enabled);
  localStorage.setItem("largeText", enabled);
}

// ======================
// CUSTOM COLOR THEME
// ======================

// Apply the user's saved color
function applyCustomColor(hex) {
  if (!hex) return;
  document.documentElement.style.setProperty("--accent-peach", hex);
  localStorage.setItem("customColor", hex);
}

// Save button handler
function saveCustomColor() {
  const color = document.getElementById("customColorInput").value.trim();

  // Basic HEX validation
  if (!/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
    alert("Please enter a valid HEX color. Example: #FFB36B");
    return;
  }

  applyCustomColor(color);
  alert("Theme color updated!");
}

// Load saved custom color on startup
const savedColor = localStorage.getItem("customColor");
if (savedColor) {
  applyCustomColor(savedColor);
  document.getElementById("customColorInput").value = savedColor;
}


// =========================
// Parent PIN (for student dashboard)
// =========================
function openPIN() {
  document.getElementById("pinModal").style.display = "flex";
}

function closePIN() {
  document.getElementById("pinModal").style.display = "none";
}

function verifyPIN() {
  const stored = localStorage.getItem("parentPIN") || "1234";
  const entered = document.getElementById("pinInput")?.value;
  const pending = localStorage.getItem("pendingAction");

  if (entered !== stored) {
    alert("Incorrect PIN. Try again.");
    return;
  }

  // Correct PIN → close modal
  closePIN();

  // If user was trying to activate subscription → go payment page
  if (pending === "subscription") {
    localStorage.removeItem("pendingAction");
    window.location.href = "subscription-payment.html";
    return;
  }

  // Else → normal results flow
  const dash = document.getElementById("studentDashboard");
  if (dash) dash.classList.remove("dashboard-locked");

  window.location.href = "student-progress.html";
}


// =========================
// Stars System
// =========================
function addStar() {
  let stars = parseInt(localStorage.getItem("stars") || "0");
  stars++;
  localStorage.setItem("stars", stars);
}
function loadStars() {
  const starCount = document.getElementById("starCount");
  if (starCount) starCount.textContent = localStorage.getItem("stars") || "0";
}

// =========================
// Subscription System
// =========================
function isSubscribed() {
  return localStorage.getItem("subscriptionActive") === "true";
}

/* Called when user clicks Activate Full Subscription */
function payNow() {
  // For prototype: just activate subscription
  localStorage.setItem("subscriptionActive", "true");

  alert("Your subscription is now Active!");

  // Update subscription text if dashboard exists
  const subStatus = document.getElementById("subStatus");
  if (subStatus) {
    subStatus.innerHTML = "ACTIVE — Unlimited Worksheets";
  }

  // Reload so UI updates
  window.location.reload();
}

function updateSubscriptionUI() {
  const subStatus = document.getElementById("subStatus");
  if (!subStatus) return;

  if (isSubscribed()) {
    subStatus.innerHTML = "ACTIVE — Unlimited Worksheets";
  }
}

// =========================
// Subscription Flow
// =========================

// 1) When user clicks Activate Full Subscription
function startSubscription() {
  // Show Parent PIN popup first
  document.getElementById("pinModal").style.display = "flex";

  // Mark purpose = subscription
  localStorage.setItem("pendingAction", "subscription");
}


// =========================
// Student Dashboard Logic
// =========================
function initStudentDashboard() {
  const starDisplay = document.getElementById("starCount");
  const resultsBtn = document.getElementById("viewResultsBtn");
  const payBtn = document.getElementById("paySubscriptionBtn");

  // Not on student dashboard
  if (!starDisplay) return;

  // Load stars
  loadStars();

  // Lock dashboard until PIN entered
  const dash = document.getElementById("studentDashboard");
  if (dash) dash.classList.add("dashboard-locked");

  // View results requires PIN
  if (resultsBtn) {
    resultsBtn.addEventListener("click", () => {
      document.getElementById("pinModal").style.display = "flex";
    });
  }

  // Subscription button
  if (payBtn) {
    payBtn.addEventListener("click", () => {
      activateSubscription();
      alert("Subscription activated!");
      window.location.reload();
    });

    if (isSubscribed()) payBtn.style.display = "none";
  }
}

// =========================
// Chart.js – For Student Results
// =========================
function showStudentResultsGraph() {
  const canvas = document.getElementById("resultsChart");
  if (!canvas) return;

  canvas.style.display = "block";

  const worksheets = loadWorksheets();

  const labels = worksheets.map(w => w.title);
  const data = worksheets.map(w => w.questions.length);

  if (window.resultsChart) window.resultsChart.destroy();

  window.resultsChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Total Questions (Used as Score)",
        data: data,
        backgroundColor: "#6FAF78"
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// =========================
// Worksheet Engine
// =========================
function initUniversalWorksheetEngine() {
  const main = document.querySelector("main");
  if (!main) return;

  const boxes = document.querySelectorAll(".choice-box");
  const inputs = document.querySelectorAll("input.ws-input");
  if (!boxes.length && !inputs.length) return;

  const passScore = parseInt(main.dataset.pass || "99");
  const submitBtn = document.getElementById("submitBtn");
  const doneBtn = document.getElementById("doneBtn");
  const resultText = document.getElementById("resultText");

  // MCQ selection
  boxes.forEach(box => {
    box.addEventListener("click", () => {
      box.classList.toggle("selected");
    });
  });

  submitBtn?.addEventListener("click", () => {
    let score = 0;

    boxes.forEach(b => {
      if (b.dataset.answer === "true" && b.classList.contains("selected")) {
        score++;
      }
    });

    inputs.forEach(input => {
      const correct = input.dataset.answer?.trim();
      const user = input.value.trim();
      if (correct && user === correct) score++;
    });

    resultText.textContent = "Your score: " + score;

    if (score >= passScore) addStar();

    doneBtn.style.display = "inline-block";
  });

  doneBtn?.addEventListener("click", () => {
    window.location.href = "home.html";
  });
}

// =========================
// Admin Worksheet CRUD
// =========================
// (UNCHANGED — exactly same as you provided)
// ---- RENDER ROW ----
function renderQuestionRow(container, qText = "", aText = "") {
  const row = document.createElement("div");
  row.className = "question-row";
  row.innerHTML = `
    <div>
      <label>Question</label>
      <textarea class="question-text">${qText}</textarea>
    </div>
    <div>
      <label>Answer</label>
      <input class="question-answer" type="text" value="${aText}">
    </div>
    <div>
      <button type="button" class="btn sm danger remove-question">Remove</button>
    </div>`;
  
  container.appendChild(row);
  row.querySelector(".remove-question").addEventListener("click", () => row.remove());
}

// ---- COLLECT FORM ----
function collectWorksheetForm(isEdit = false) {
  const title = document.getElementById("ws_title").value.trim();
  const subject = document.getElementById("ws_subject").value.trim();
  const grade = document.getElementById("ws_grade").value.trim();
  const description = document.getElementById("ws_description").value.trim();
  const status = document.getElementById("ws_status").value;

  if (!title || !subject || !grade) {
    alert("Missing required fields.");
    return null;
  }

  const questions = [...document.querySelectorAll(".question-text")].map(e => e.value.trim());
  const answerKey = [...document.querySelectorAll(".question-answer")].map(e => e.value.trim());

  const now = new Date().toISOString();

  const data = {
    title,
    subject,
    gradeLevel: grade,
    description,
    questions,
    answerKey,
    status,
    updatedAt: now
  };

  if (!isEdit) {
    data.id = Date.now();
    data.createdAt = now;
  }

  return data;
}

// ---- CREATE ----
function initWorksheetCreate() {
  const form = document.getElementById("worksheetCreateForm");
  if (!form) return;

  const container = document.getElementById("questionsContainer");

  document.getElementById("addQuestionBtn").addEventListener("click", () => {
    renderQuestionRow(container);
  });

  renderQuestionRow(container);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = collectWorksheetForm(false);
    if (!data) return;

    const worksheets = loadWorksheets();
    worksheets.push(data);
    saveWorksheets(worksheets);

    alert("Worksheet created!");
    window.location.href = "worksheet-read.html";
  });
}

// ---- LIST ----
function initWorksheetList() {
  const tableBody = document.getElementById("worksheetTable");
  if (!tableBody) return;

  const worksheets = loadWorksheets();
  if (!worksheets.length) {
    tableBody.innerHTML = `<tr><td colspan="6">No worksheets yet.</td></tr>`;
    return;
  }

  tableBody.innerHTML = worksheets.map(ws => `
    <tr>
      <td>${ws.title}</td>
      <td>${ws.subject}</td>
      <td>${ws.gradeLevel}</td>
      <td><span class="pill">${ws.status}</span></td>
      <td>${ws.questions.length}</td>
      <td>
        <button class="btn sm" onclick="openWorksheetEdit(${ws.id})">Edit</button>
        <button class="btn sm danger" onclick="deleteWorksheet(${ws.id})">Delete</button>
      </td>
    </tr>
  `).join("");
}

// ---- EDIT ----
function openWorksheetEdit(id) {
  localStorage.setItem("editWorksheetId", id);
  window.location.href = "worksheet-update.html";
}

function initWorksheetUpdate() {
  const form = document.getElementById("worksheetUpdateForm");
  if (!form) return;

  const id = parseInt(localStorage.getItem("editWorksheetId"));
  const worksheets = loadWorksheets();
  const ws = worksheets.find(w => w.id === id);

  if (!ws) {
    alert("Worksheet not found.");
    window.location.href = "worksheet-read.html";
    return;
  }

  document.getElementById("ws_title").value = ws.title;
  document.getElementById("ws_subject").value = ws.subject;
  document.getElementById("ws_grade").value = ws.gradeLevel;
  document.getElementById("ws_description").value = ws.description;
  document.getElementById("ws_status").value = ws.status;

  const container = document.getElementById("questionsContainer");
  document.getElementById("addQuestionBtn").addEventListener("click", () => renderQuestionRow(container));

  ws.questions.forEach((q, i) => {
    renderQuestionRow(container, q, ws.answerKey[i]);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const updated = collectWorksheetForm(true);

    Object.assign(ws, updated);
    saveWorksheets(worksheets);

    alert("Worksheet updated!");
    window.location.href = "worksheet-read.html";
  });
}

// ---- DELETE ----
function deleteWorksheet(id) {
  if (!confirm("Delete this worksheet?")) return;

  let worksheets = loadWorksheets();
  worksheets = worksheets.filter(w => w.id !== id);
  saveWorksheets(worksheets);

  alert("Deleted.");
  window.location.reload();
}

// =========================
// Auto Initialization
// =========================
document.addEventListener("DOMContentLoaded", function () {
  initLogin();
  initWorksheetCreate();
  initWorksheetList();
  initWorksheetUpdate();
  loadStars();
  applySavedDarkMode();
  applySavedLargeText();
  initUniversalWorksheetEngine();
  initStudentDashboard();
});
