// ========================================
// Helper: Hide all sections
// ========================================
function hideAll() {
  document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));
}

// ========================================
// Show Student List
// ========================================
function showList() {
  hideAll();
  document.getElementById("listSection").classList.add("active");
  renderTable();
}

// ========================================
// Show Create Form
// ========================================
function showCreateForm() {
  hideAll();
  document.getElementById("formTitle").innerText = "Add Student";
  document.getElementById("studentForm").reset();
  document.getElementById("studentId").value = "";
  document.getElementById("formSection").classList.add("active");
}

// ========================================
// Show Edit Form
// ========================================
async function showEditForm(id) {
  hideAll();

  const res = await fetch("http://localhost:5000/students");
  const students = await res.json();
  const s = students.find(st => st._id === id);

  // Fill the form
  document.getElementById("studentId").value = s._id;
  document.getElementById("name").value = s.name;
  document.getElementById("age").value = s.age;
  document.getElementById("school").value = s.school;
  document.getElementById("verbal").value = s.verbal;

  document.getElementById("formTitle").innerText = "Edit Student";
  document.getElementById("formSection").classList.add("active");
}

// ========================================
// Show Delete Confirmation
// ========================================
function showDelete(id) {
  hideAll();

  fetch("http://localhost:5000/students")
    .then(res => res.json())
    .then(students => {
      const student = students.find(s => s._id === id);

      document.getElementById("deleteText").innerText =
        `Are you sure you want to delete "${student.name}"?`;

      document.getElementById("confirmDeleteBtn").onclick = function () {
        deleteStudent(id);
      };

      document.getElementById("deleteSection").classList.add("active");
    });
}

// ========================================
// Save (Create or Update)
// ========================================
async function saveStudent(event) {
  event.preventDefault();

  const id = document.getElementById("studentId").value;

  const data = {
    name: document.getElementById("name").value,
    age: document.getElementById("age").value,
    school: document.getElementById("school").value,
    verbal: document.getElementById("verbal").value
  };

  // CREATE
  if (!id) {
    await fetch("http://localhost:5000/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  }

  // UPDATE
  else {
    await fetch(`http://localhost:5000/students/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  }

  showList();
}

// ========================================
// Delete Student
// ========================================
async function deleteStudent(id) {
  await fetch(`http://localhost:5000/students/${id}`, {
    method: "DELETE"
  });

  showList();
}

// ========================================
// Render Student Table
// ========================================
async function renderTable() {
  const res = await fetch("http://localhost:5000/students");
  const students = await res.json();
  const table = document.getElementById("studentTable");

  table.innerHTML = ""; // Clear table

  students.forEach(s => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${s.name}</td>
      <td>${s.age}</td>
      <td>${s.school}</td>
      <td>${s.verbal}</td>
      <td>
        <button class="btn btn-edit" onclick="showEditForm('${s._id}')">Edit</button>
        <button class="btn btn-delete" onclick="showDelete('${s._id}')">Delete</button>
      </td>
    `;

    table.appendChild(row);
  });
}

// ========================================
// Init
// ========================================
window.onload = function () {
  showList();
};
