// -----------------------------
// Helper: hide all sections
// -----------------------------
function hideAll() {
  document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));
}

// -----------------------------
// Show list
// -----------------------------
function showList() {
  hideAll();
  document.getElementById("listSection").classList.add("active");
  renderTable();
}

// -----------------------------
// Show Create Form
// -----------------------------
function showCreateForm() {
  hideAll();
  document.getElementById("formTitle").innerText = "Add Worksheet";
  document.getElementById("worksheetForm").reset();
  document.getElementById("wsId").value = "";

  document.getElementById("formSection").classList.add("active");
}

// -----------------------------
// Show Edit Form
// -----------------------------
async function showEditForm(id) {
  hideAll();

  const res = await fetch("http://localhost:5000/worksheets");
  const worksheets = await res.json();
  const ws = worksheets.find(w => w._id === id);

  document.getElementById("wsId").value = ws._id;
  document.getElementById("title").value = ws.title;
  document.getElementById("topic").value = ws.topic;
  document.getElementById("level").value = ws.level;
  document.getElementById("description").value = ws.description;
  document.getElementById("totalQuestions").value = ws.totalQuestions;

  document.getElementById("formTitle").innerText = "Edit Worksheet";
  document.getElementById("formSection").classList.add("active");
}

// -----------------------------
// Save (Create or Update)
// -----------------------------
async function saveWorksheet(event) {
  event.preventDefault();

  const id = document.getElementById("wsId").value;

  const data = {
    title: document.getElementById("title").value,
    topic: document.getElementById("topic").value,
    level: document.getElementById("level").value,
    description: document.getElementById("description").value,
    totalQuestions: document.getElementById("totalQuestions").value
  };

  // CREATE
  if (!id) {
    await fetch("http://localhost:5000/worksheets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  }

  // UPDATE
  else {
    await fetch(`http://localhost:5000/worksheets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  }

  showList();
}

// -----------------------------
// Delete Worksheet
// -----------------------------
async function deleteWorksheet(id) {
  await fetch(`http://localhost:5000/worksheets/${id}`, {
    method: "DELETE"
  });

  showList();
}

// -----------------------------
// Show Delete Confirmation
// -----------------------------
async function showDelete(id) {
  hideAll();

  const res = await fetch("http://localhost:5000/worksheets");
  const worksheets = await res.json();
  const ws = worksheets.find(w => w._id === id);

  document.getElementById("deleteText").innerText =
    `Are you sure you want to delete "${ws.title}"?`;

  document.getElementById("confirmDeleteBtn").onclick = function () {
    deleteWorksheet(id);
  };

  document.getElementById("deleteSection").classList.add("active");
}

// -----------------------------
// Render Table
// -----------------------------
async function renderTable() {
  const res = await fetch("http://localhost:5000/worksheets");
  const worksheets = await res.json();
  const table = document.getElementById("worksheetTable");

  table.innerHTML = "";

  worksheets.forEach(w => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${w.title}</td>
      <td>${w.topic}</td>
      <td>${w.level}</td>
      <td>${w.totalQuestions}</td>
      <td>
        <button class="btn btn-edit" onclick="showEditForm('${w._id}')">Edit</button>
        <button class="btn btn-delete" onclick="showDelete('${w._id}')">Delete</button>
      </td>
    `;

    table.appendChild(row);
  });
}

// -----------------------------
// Init
// -----------------------------
window.onload = function () {
  showList();
};
