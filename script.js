/* =========================================================
   ThinkAble – script.js (FULLY UPDATED)
   - Navbar active highlight
   - Safe storage helpers
   - Login / Signup
   - Dark mode + Large text mode
   - Custom theme color
   - Parent PIN + Subscription flow
   - Stars (safe + minimal)
   - Student Home: Student Progress chart (horizontal grouped bar)
   - Student Results graph (existing)
   - Universal worksheet engine
   - Admin worksheet CRUD (kept as-is)
========================================================= */

// ✅ Apply dark mode ASAP (prevents white flash)
(function applyDarkModeEarly() {
  const enabled = localStorage.getItem("darkMode") === "true";
  document.documentElement.classList.toggle("dark", enabled);
  document.body?.classList.toggle("dark", enabled);
})();

/* =========================
   Navbar Active State
========================= */
function highlightActiveNavLink() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll("nav a");

  navLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    const linkPage = href.split("/").pop();

    link.classList.remove("active");

    if (
      currentPage === linkPage ||
      (currentPage === "" && linkPage === "index.html") ||
      (currentPage.includes("home.html") && href.includes("home.html"))
    ) {
      link.classList.add("active");
    }
  });
}

/* =========================
   Helpers: generic storage
========================= */
function loadFromStorage(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (e) {
    console.error("Error loading", key, e);
    return fallback;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadWorksheets() {
  return loadFromStorage("worksheets", []);
}
function saveWorksheets(data) {
  saveToStorage("worksheets", data);
}

/* =========================
   Stars (SAFE)
========================= */
function loadStars() {
  const starDisplay = document.getElementById("starCount");
  if (!starDisplay) return;

  const currentUser = loadFromStorage("currentUser", null);
  const userId = currentUser?.id || localStorage.getItem("userId") || "guest";

  const starsMap = loadFromStorage("starsByUser", {});
  const stars = starsMap[userId] ?? 0;

  starDisplay.textContent = stars;
}

function addStar(amount = 1) {
  const currentUser = loadFromStorage("currentUser", null);
  const userId = currentUser?.id || localStorage.getItem("userId") || "guest";

  const starsMap = loadFromStorage("starsByUser", {});
  const current = starsMap[userId] ?? 0;

  starsMap[userId] = current + amount;
  saveToStorage("starsByUser", starsMap);

  loadStars();
}

/* =========================
   Login
========================= */
function initLogin() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email")?.value.trim().toLowerCase();
    const password = document.getElementById("password")?.value.trim();

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Login failed.");
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(data.user));
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userRole", data.user.role);

      if (data.user.role === "admin") {
        window.location.href = "admin/home.html";
      } else {
        window.location.href = "student/home.html";
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Server connection error. Please try again.");
    }
  });
}

/* =========================
   SignUp
========================= */
function initSignup() {
  const form = document.getElementById("signupForm");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document
      .getElementById("signupEmail")
      ?.value.trim()
      .toLowerCase();
    const password = document.getElementById("signupPassword")?.value.trim();
    const confirmPassword = document
      .getElementById("signupConfirmPassword")
      ?.value.trim();

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    if (password.length < 4) {
      alert("Password must be at least 4 characters.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Signup failed.");
        return;
      }

      alert("Signup successful! Please login.");
      window.location.href = "login.html";
    } catch (error) {
      console.error("Signup error:", error);
      alert("Server connection error. Please try again.");
    }
  });
}

/* =========================
   Dark Mode
========================= */
function applySavedDarkMode() {
  const enabled = localStorage.getItem("darkMode") === "true";

  // ✅ apply to both html + body (stronger)
  document.documentElement.classList.toggle("dark", enabled);
  document.body.classList.toggle("dark", enabled);

  // ✅ sync toggle if it exists on this page
  const toggle = document.getElementById("darkModeToggle");
  if (toggle) toggle.checked = enabled;
}

function toggleDarkMode() {
  const toggle = document.getElementById("darkModeToggle");
  const enabled = toggle ? toggle.checked : !(localStorage.getItem("darkMode") === "true");

  // ✅ save + apply
  localStorage.setItem("darkMode", enabled);
  document.documentElement.classList.toggle("dark", enabled);
  document.body.classList.toggle("dark", enabled);
}

/* =========================
   Large Text Mode
========================= */
function applySavedLargeText() {
  const enabled = localStorage.getItem("largeText") === "true";
  document.body.classList.toggle("largeText", enabled);

  const toggle = document.getElementById("largeTextToggle");
  if (toggle) toggle.checked = enabled;
}

function toggleLargeText() {
  const toggle = document.getElementById("largeTextToggle");
  const enabled = !!toggle?.checked;
  document.body.classList.toggle("largeText", enabled);
  localStorage.setItem("largeText", enabled);
}

/* ======================
   CUSTOM COLOR THEME
====================== */
function applyCustomColor(hex) {
  if (!hex) return;
  document.documentElement.style.setProperty("--accent-peach", hex);
  localStorage.setItem("customColor", hex);
}

function saveCustomColor() {
  const input = document.getElementById("customColorInput");
  const color = input?.value.trim();

  if (!color || !/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
    alert("Please enter a valid HEX color. Example: #FFB36B");
    return;
  }

  applyCustomColor(color);
  alert("Theme color updated!");
}

/* =========================
   Parent PIN (modal)
========================= */
function openPIN() {
  const modal = document.getElementById("pinModal");
  if (modal) modal.style.display = "flex";
}

function closePIN() {
  const modal = document.getElementById("pinModal");
  if (modal) modal.style.display = "none";
}

function verifyPIN() {
  const stored = localStorage.getItem("parentPIN") || "1234";
  const entered = document.getElementById("pinInput")?.value;
  const pending = localStorage.getItem("pendingAction");

  if (entered !== stored) {
    alert("Incorrect PIN. Try again.");
    return;
  }

  closePIN();

  if (pending === "subscription") {
    localStorage.removeItem("pendingAction");
    window.location.href = "subscription-payment.html";
    return;
  }

  const dash = document.getElementById("studentDashboard");
  if (dash) dash.classList.remove("dashboard-locked");

  // If you want to go to progress page after PIN:
  // window.location.href = "student-progress.html";
}

/* =========================
   Subscription System
========================= */
function isSubscribed() {
  return localStorage.getItem("subscriptionActive") === "true";
}

function payNow() {
  localStorage.setItem("subscriptionActive", "true");
  alert("Your subscription is now Active!");

  const subStatus = document.getElementById("subStatus");
  if (subStatus) subStatus.innerHTML = "ACTIVE — Unlimited Worksheets";

  window.location.reload();
}

function updateSubscriptionUI() {
  const subStatus = document.getElementById("subStatus");
  if (!subStatus) return;

  if (isSubscribed()) subStatus.innerHTML = "ACTIVE — Unlimited Worksheets";
}

function startSubscription() {
  openPIN();
  localStorage.setItem("pendingAction", "subscription");
}

/* =========================
   Student Dashboard Logic
========================= */
function initStudentDashboard() {
  const starDisplay = document.getElementById("starCount");
  if (!starDisplay) return; // not dashboard

  loadStars();

  const dash = document.getElementById("studentDashboard");
  if (dash) dash.classList.add("dashboard-locked");

  const resultsBtn = document.getElementById("viewResultsBtn");
  if (resultsBtn) resultsBtn.addEventListener("click", openPIN);

  const payBtn = document.getElementById("paySubscriptionBtn");
  if (payBtn) {
    if (isSubscribed()) {
      payBtn.style.display = "none";
    } else {
      payBtn.addEventListener("click", () => {
        // If you want to require PIN before subscription:
        startSubscription();
      });
    }
  }

  updateSubscriptionUI();
}

/* =========================
   Chart.js – Student Home Progress Chart
   (Horizontal grouped bars like your screenshot)
========================= */
function initStudentProgressChart() {
  const canvas = document.getElementById("studentProgressChart");
  if (!canvas) return;
  if (typeof Chart === "undefined") {
    console.warn("Chart.js not loaded. Add Chart.js CDN before script.js.");
    return;
  }

  // Optional: if you want the chart to be based on localStorage data later,
  // you can compute these values dynamically.
  const labels = ["Colors", "Shapes", "Mathematical", "Numeracy", "Literacy"];

  const dataWS3 = [1, 1, 2, 2, 2];
  const dataWS2 = [2, 2, 4, 3, 2];
  const dataWS1 = [2, 4, 4, 5, 3];

  if (window.studentProgressChart) window.studentProgressChart.destroy();

  window.studentProgressChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "WS 3",
          data: dataWS3,
          backgroundColor: "rgba(140, 190, 235, 0.85)",
          borderRadius: 6,
          barThickness: 14,
        },
        {
          label: "WS 2",
          data: dataWS2,
          backgroundColor: "rgba(60, 160, 230, 0.85)",
          borderRadius: 6,
          barThickness: 14,
        },
        {
          label: "WS 1",
          data: dataWS1,
          backgroundColor: "rgba(0, 130, 190, 0.85)",
          borderRadius: 6,
          barThickness: 14,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      plugins: {
        legend: {
          position: "bottom",
          labels: { boxWidth: 14, boxHeight: 14 },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { stepSize: 2 },
          grid: { color: "rgba(0,0,0,0.12)" },
        },
        y: {
          grid: { display: false },
        },
      },
    },
  });
}

/* =========================
   Chart.js – Student Results Graph
========================= */
function showStudentResultsGraph() {
  const canvas = document.getElementById("resultsChart");
  if (!canvas) return;
  if (typeof Chart === "undefined") return;

  canvas.style.display = "block";

  const worksheets = loadWorksheets();
  const labels = worksheets.map((w) => w.title);
  const data = worksheets.map((w) => (w.questions ? w.questions.length : 0));

  if (window.resultsChart) window.resultsChart.destroy();

  window.resultsChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Total Questions (Used as Score)",
          data,
          backgroundColor: "#6FAF78",
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true },
      },
    },
  });
}

/* =========================
   Worksheet Engine
========================= */
function initUniversalWorksheetEngine() {
  const main = document.querySelector("main");
  if (!main) return;

  const boxes = document.querySelectorAll(".choice-box");
  const inputs = document.querySelectorAll("input.ws-input");
  if (!boxes.length && !inputs.length) return;

  const passScore = parseInt(main.dataset.pass || "99", 10);
  const submitBtn = document.getElementById("submitBtn");
  const doneBtn = document.getElementById("doneBtn");
  const resultText = document.getElementById("resultText");

  boxes.forEach((box) => {
    box.addEventListener("click", () => {
      box.classList.toggle("selected");
    });
  });

  submitBtn?.addEventListener("click", () => {
    let score = 0;

    boxes.forEach((b) => {
      if (b.dataset.answer === "true" && b.classList.contains("selected")) {
        score++;
      }
    });

    inputs.forEach((input) => {
      const correct = input.dataset.answer?.trim();
      const user = input.value.trim();
      if (correct && user === correct) score++;
    });

    if (resultText) resultText.textContent = "Your score: " + score;

    if (score >= passScore) addStar();

    if (doneBtn) doneBtn.style.display = "inline-block";
  });

  doneBtn?.addEventListener("click", () => {
    window.location.href = "home.html";
  });
}

/* =========================
   Admin Worksheet CRUD
========================= */
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
  row
    .querySelector(".remove-question")
    .addEventListener("click", () => row.remove());
}

function collectWorksheetForm(isEdit = false) {
  const title = document.getElementById("ws_title")?.value.trim();
  const subject = document.getElementById("ws_subject")?.value.trim();
  const grade = document.getElementById("ws_grade")?.value.trim();
  const description = document.getElementById("ws_description")?.value.trim();
  const status = document.getElementById("ws_status")?.value;

  if (!title || !subject || !grade) {
    alert("Missing required fields.");
    return null;
  }

  const questions = [...document.querySelectorAll(".question-text")].map((e) =>
    e.value.trim()
  );
  const answerKey = [...document.querySelectorAll(".question-answer")].map((e) =>
    e.value.trim()
  );

  const now = new Date().toISOString();

  const data = {
    title,
    subject,
    gradeLevel: grade,
    description,
    questions,
    answerKey,
    status,
    updatedAt: now,
  };

  if (!isEdit) {
    data.id = Date.now();
    data.createdAt = now;
  }

  return data;
}

function initWorksheetCreate() {
  const form = document.getElementById("worksheetCreateForm");
  if (!form) return;

  const container = document.getElementById("questionsContainer");
  const addBtn = document.getElementById("addQuestionBtn");

  addBtn?.addEventListener("click", () => renderQuestionRow(container));
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

function initWorksheetList() {
  const tableBody = document.getElementById("worksheetTable");
  if (!tableBody) return;

  const worksheets = loadWorksheets();
  if (!worksheets.length) {
    tableBody.innerHTML = `<tr><td colspan="6">No worksheets yet.</td></tr>`;
    return;
  }

  tableBody.innerHTML = worksheets
    .map(
      (ws) => `
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
  `
    )
    .join("");
}

function openWorksheetEdit(id) {
  localStorage.setItem("editWorksheetId", id);
  window.location.href = "worksheet-update.html";
}

function initWorksheetUpdate() {
  const form = document.getElementById("worksheetUpdateForm");
  if (!form) return;

  const id = parseInt(localStorage.getItem("editWorksheetId"), 10);
  const worksheets = loadWorksheets();
  const ws = worksheets.find((w) => w.id === id);

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
  document
    .getElementById("addQuestionBtn")
    ?.addEventListener("click", () => renderQuestionRow(container));

  ws.questions.forEach((q, i) => {
    renderQuestionRow(container, q, ws.answerKey[i]);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const updated = collectWorksheetForm(true);
    if (!updated) return;

    Object.assign(ws, updated);
    saveWorksheets(worksheets);

    alert("Worksheet updated!");
    window.location.href = "worksheet-read.html";
  });
}

function deleteWorksheet(id) {
  if (!confirm("Delete this worksheet?")) return;

  let worksheets = loadWorksheets();
  worksheets = worksheets.filter((w) => w.id !== id);
  saveWorksheets(worksheets);

  alert("Deleted.");
  window.location.reload();
}

/* =========================
   Auto Initialization
========================= */
document.addEventListener("DOMContentLoaded", function () {
  // theme
  const savedColor = localStorage.getItem("customColor");
  if (savedColor) {
    applyCustomColor(savedColor);
    const input = document.getElementById("customColorInput");
    if (input) input.value = savedColor;
  }

  highlightActiveNavLink();

  // auth
  initLogin();
  initSignup();

  // admin worksheet
  initWorksheetCreate();
  initWorksheetList();
  initWorksheetUpdate();

  // accessibility
  applySavedDarkMode();
  applySavedLargeText();

  // stars + dashboards
  loadStars();
  initStudentDashboard();

  // worksheets (student)
  initUniversalWorksheetEngine();

  // charts
  initStudentProgressChart();
  showStudentResultsGraph();
});
