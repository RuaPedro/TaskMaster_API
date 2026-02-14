import { StudentService } from "../../services/users/student.service.js";
import { UserService } from "../../services/users/user.service.js";
import { Student } from "../../models/users/student.model.js";
import { User } from "../../models/users/user.model.js";

let students = [];
let users = [];
let createModal;
let editModal;
let deleteModal;

const studentService = new StudentService();
const userService = new UserService();

export function init() {
  const createEl = document.getElementById("studentCreateModal");
  const editEl = document.getElementById("studentEditModal");
  const deleteEl = document.getElementById("studentDeleteModal");

  createModal = createEl ? new bootstrap.Modal(createEl) : null;
  editModal = editEl ? new bootstrap.Modal(editEl) : null;
  deleteModal = deleteEl ? new bootstrap.Modal(deleteEl) : null;

  bindForms();
  bindTableActions();
  loadData();
}

function bindForms() {
  const createForm = document.getElementById("student-create-form");
  const editForm = document.getElementById("student-edit-form");
  const deleteBtn = document.getElementById("student-delete-confirm");

  if (createForm) {
    createForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      createForm.classList.add("was-validated");
      if (!createForm.checkValidity()) return;

      const payload = formToStudent(createForm);
      await studentService.insert(payload);
      createForm.reset();
      createForm.classList.remove("was-validated");
      createModal?.hide();
      showAlert("Estudiante creado");
      loadData();
    });
  }

  if (editForm) {
    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      editForm.classList.add("was-validated");
      if (!editForm.checkValidity()) return;

      const payload = formToStudent(editForm);
      payload.id = Number(editForm.id.value);
      await studentService.update(payload);
      editModal?.hide();
      showAlert("Estudiante actualizado");
      loadData();
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      const id = Number(document.getElementById("student-delete-id").value);
      if (!id) return;
      await studentService.delete(id);
      deleteModal?.hide();
      showAlert("Estudiante eliminado", "warning");
      loadData();
    });
  }
}

function bindTableActions() {
  const tbody = document.querySelector("#students-table tbody");
  if (!tbody) return;

  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;
    if (action === "edit") openEdit(id);
    if (action === "delete") openDelete(id);
  });
}

async function loadData() {
  const tbody = document.querySelector("#students-table tbody");
  if (tbody) tbody.innerHTML = `<tr><td colspan="5">Cargando...</td></tr>`;
  try {
    const [usersData, studentsData] = await Promise.all([
      userService.getAll(),
      studentService.getAll(),
    ]);
    const rawUsers = Array.isArray(usersData?.results) ? usersData.results : usersData;
    users = rawUsers.map((u) => new User(u));
    const rawStudents = Array.isArray(studentsData?.results) ? studentsData.results : studentsData;
    students = rawStudents.map((s) => new Student(s));
    fillUserSelects();
    renderTable();
  } catch (err) {
    console.error(err);
    showAlert("No se pudieron cargar estudiantes", "danger");
  }
}

function renderTable() {
  const tbody = document.querySelector("#students-table tbody");
  if (!tbody) return;

  if (!students.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Sin registros</td></tr>`;
    return;
  }

  tbody.innerHTML = students
    .map((s) => {
      return `
        <tr>
          <td>${s.id ?? ""}</td>
          <td>${userLabel(s.user)}</td>
          <td>${s.fullname || "-"}</td>
          <td>${s.started_at || "-"}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary me-2" data-action="edit" data-id="${s.id}">Editar</button>
            <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${s.id}">Borrar</button>
          </td>
        </tr>`;
    })
    .join("");
}

function fillUserSelects() {
  const selects = document.querySelectorAll('select[name="user"]');
  selects.forEach((sel) => {
    sel.innerHTML = `<option value="">Selecciona</option>` +
      users
        .map((u) => `<option value="${u.id}">${u.username} (${u.email || "sin email"})</option>`)
        .join("");
  });
}

function openEdit(id) {
  const student = students.find((s) => s.id === id);
  const form = document.getElementById("student-edit-form");
  if (!student || !form) return;
  form.id.value = student.id;
  form.user.value = student.user?.id ?? student.user ?? "";
  form.fullname.value = student.fullname || "";
  form.started_at.value = student.started_at ? student.started_at.slice(0, 10) : "";
  editModal?.show();
}

function openDelete(id) {
  const input = document.getElementById("student-delete-id");
  if (!input) return;
  input.value = id;
  deleteModal?.show();
}

function formToStudent(form) {
  return {
    user: Number(form.user.value),
    fullname: form.fullname.value.trim(),
    started_at: form.started_at.value || null,
  };
}

function userLabel(user) {
  const id = typeof user === "object" ? user?.id : user;
  const record = users.find((u) => u.id === id);
  return record ? `${record.username}` : "-";
}

function showAlert(message, type = "success") {
  const box = document.getElementById("students-alert");
  if (!box) return;
  box.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>`;
}
