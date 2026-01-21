// =========================
// Navbar Active State
// =========================
function highlightActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('nav a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    const linkPage = href.split('/').pop();
    link.classList.remove('active');

    if (
      currentPage === linkPage ||
      (currentPage === '' && linkPage === 'index.html') ||
      (currentPage.includes('home.html') && href.includes('home.html'))
    ) {
      link.classList.add('active');
    }
  });
}

// =========================
// Helpers: Local Storage
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

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Login failed");
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(data.user));
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("userRole", data.user.role);

      if (data.user.role === "admin") {
        window.location.href = "admin/home.html";
      } else if (data.user.role === "parent") {
        window.location.href = "parent/home.html";
      } else {
        window.location.href = "student/home.html";
      }
    } catch (err) {
      console.error(err);
      alert("Connection error");
    }
  });
}

// =========================
// Dark Mode
// =========================
function applySavedDarkMode() {
  const enabled = localStorage.getItem("darkMode") === "true";
  document.body.classList.toggle("dark", enabled);
}
function toggleDarkMode() {
  const enabled = document.getElementById("darkModeToggle")?.checked;
  document.body.classList.toggle("dark", enabled);
  localStorage.setItem("darkMode", enabled);
}

// =========================
// Large Text Mode
// =========================
function applySavedLargeText() {
  const enabled = localStorage.getItem("largeText") === "true";
  document.body.classList.toggle("largeText", enabled);
}
function toggleLargeText() {
  const enabled = document.getElementById("largeTextToggle")?.checked;
  document.body.classList.toggle("largeText", enabled);
  localStorage.setItem("largeText", enabled);
}

// =========================
// Custom Color Theme
// =========================
function applyCustomColor(hex) {
  if (!hex) return;
  document.documentElement.style.setProperty("--accent-peach", hex);
  localStorage.setItem("customColor", hex);
}
function saveCustomColor() {
  const color = document.getElementById("customColorInput").value.trim();
  if (!/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
    alert("Invalid HEX color");
    return;
  }
  applyCustomColor(color);
  alert("Theme updated");
}
const savedColor = localStorage.getItem("customColor");
if (savedColor) applyCustomColor(savedColor);

// =========================
// Parent PIN
// =========================
function openPIN() {
  document.getElementById("pinModal").style.display = "flex";
}
function closePIN() {
  document.getElementById("pinModal").style.display = "none";
}
function verifyPIN() {
  const stored = localStorage.getItem("parentPIN") || "1234";
  const entered = document.getElementById("pinInput").value;

  if (entered !== stored) {
    alert("Incorrect PIN");
    return;
  }

  closePIN();
  localStorage.removeItem("pendingAction");
  window.location.href = "student-progress.html";
}

// =========================
// Stars System
// =========================
function addStar() {
  const stars = parseInt(localStorage.getItem("stars") || "0") + 1;
  localStorage.setItem("stars", stars);
}
function loadStars() {
  const el = document.getElementById("starCount");
  if (el) el.textContent = localStorage.getItem("stars") || "0";
}

// =========================
// Subscription
// =========================
function isSubscribed() {
  return localStorage.getItem("subscriptionActive") === "true";
}
function startSubscription() {
  localStorage.setItem("pendingAction", "subscription");
  openPIN();
}
function payNow() {
  localStorage.setItem("subscriptionActive", "true");
  alert("Subscription activated");
  window.location.reload();
}

// =========================
// Student Dashboard
// =========================
function initStudentDashboard() {
  const dash = document.getElementById("studentDashboard");
  if (!dash) return;

  loadStars();
  dash.classList.add("dashboard-locked");

  document.getElementById("viewResultsBtn")?.addEventListener("click", openPIN);
}

// =========================
// Chart.js Results
// =========================
function showStudentResultsGraph() {
  const canvas = document.getElementById("resultsChart");
  if (!canvas) return;

  const worksheets = loadWorksheets();
  const labels = worksheets.map(w => w.title);
  const data = worksheets.map(w => w.questions.length);

  if (window.resultsChart) window.resultsChart.destroy();

  window.resultsChart = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Total Questions",
        data,
        backgroundColor: "#6FAF78"
      }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } }
  });
}

// =========================
// Worksheet Engine
// =========================
function initUniversalWorksheetEngine() {
  const main = document.querySelector("main");
  if (!main) return;

  const boxes = document.querySelectorAll(".choice-box");
  const inputs = document.querySelectorAll(".ws-input");
  if (!boxes.length && !inputs.length) return;

  const submitBtn = document.getElementById("submitBtn");
  const doneBtn = document.getElementById("doneBtn");
  const resultText = document.getElementById("resultText");

  boxes.forEach(b => b.addEventListener("click", () => b.classList.toggle("selected")));

  submitBtn?.addEventListener("click", () => {
    let score = 0;

    boxes.forEach(b => {
      if (b.dataset.answer === "true" && b.classList.contains("selected")) score++;
    });

    inputs.forEach(i => {
      if (i.dataset.answer === i.value.trim()) score++;
    });

    resultText.textContent = "Your score: " + score;
    addStar();
    doneBtn.style.display = "inline-block";
  });

  doneBtn?.addEventListener("click", () => window.location.href = "home.html");
}

// =========================
// Auto Init
// =========================
document.addEventListener("DOMContentLoaded", () => {
  highlightActiveNavLink();
  initLogin();
  loadStars();
  applySavedDarkMode();
  applySavedLargeText();
  initUniversalWorksheetEngine();
  initStudentDashboard();
});
