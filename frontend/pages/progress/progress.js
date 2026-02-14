import { StudentTaskProgressService } from "../../services/users/student_task_progress.service.js";
import { StudentService } from "../../services/users/student.service.js";
import { BlockTaskService } from "../../services/tasks/block_task.service.js";
import { StudentTaskProgress } from "../../models/users/student_task_progress.model.js";
import { Student } from "../../models/users/student.model.js";
import { BlockTask } from "../../models/tasks/block_task.model.js";

let progressList = [];
let students = [];
let tasks = [];
let createModal;
let editModal;
let deleteModal;

const progressService = new StudentTaskProgressService();
const studentService = new StudentService();
const taskService = new BlockTaskService();

export function init() {
  const createEl = document.getElementById("progressCreateModal");
  const editEl = document.getElementById("progressEditModal");
  const deleteEl = document.getElementById("progressDeleteModal");

  createModal = createEl ? new bootstrap.Modal(createEl) : null;
  editModal = editEl ? new bootstrap.Modal(editEl) : null;
  deleteModal = deleteEl ? new bootstrap.Modal(deleteEl) : null;

  bindForms();
  bindTableActions();
  loadData();
}

function bindForms() {
  const createForm = document.getElementById("progress-create-form");
  const editForm = document.getElementById("progress-edit-form");
  const deleteBtn = document.getElementById("progress-delete-confirm");

  if (createForm) {
    createForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      createForm.classList.add("was-validated");
      if (!createForm.checkValidity()) return;

      const payload = formToProgress(createForm);
      await progressService.insert(payload);
      createForm.reset();
      createForm.classList.remove("was-validated");
      createModal?.hide();
      showAlert("Registro creado");
      loadData();
    });
  }

  if (editForm) {
    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      editForm.classList.add("was-validated");
      if (!editForm.checkValidity()) return;

      const payload = formToProgress(editForm);
      payload.id = Number(editForm.id.value);
      await progressService.update(payload);
      editModal?.hide();
      showAlert("Registro actualizado");
      loadData();
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      const id = Number(document.getElementById("progress-delete-id").value);
      if (!id) return;
      await progressService.delete(id);
      deleteModal?.hide();
      showAlert("Registro eliminado", "warning");
      loadData();
    });
  }
}

function bindTableActions() {
  const tbody = document.querySelector("#progress-table tbody");
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
  const tbody = document.querySelector("#progress-table tbody");
  if (tbody) tbody.innerHTML = `<tr><td colspan="7">Cargando...</td></tr>`;
  try {
    const [studentsData, tasksData, progressData] = await Promise.all([
      studentService.getAll(),
      taskService.getAll(),
      progressService.getAll(),
    ]);

    const rawStudents = Array.isArray(studentsData?.results) ? studentsData.results : studentsData;
    students = rawStudents.map((s) => new Student(s));

    const rawTasks = Array.isArray(tasksData?.results) ? tasksData.results : tasksData;
    tasks = rawTasks.map((t) => new BlockTask(t));

    const rawProgress = Array.isArray(progressData?.results) ? progressData.results : progressData;
    progressList = rawProgress.map((p) => new StudentTaskProgress(p));

    fillSelects();
    renderTable();
  } catch (err) {
    console.error(err);
    showAlert("No se pudo cargar el progreso", "danger");
  }
}

function renderTable() {
  const tbody = document.querySelector("#progress-table tbody");
  if (!tbody) return;

  if (!progressList.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">Sin registros</td></tr>`;
    return;
  }

  tbody.innerHTML = progressList
    .map((p) => {
      return `
        <tr>
          <td>${p.id ?? ""}</td>
          <td>${studentLabel(p.student)}</td>
          <td>${taskLabel(p.task_detail || p.task)}</td>
          <td>${p.status || "-"}</td>
          <td>${p.started_at || "-"}</td>
          <td>${p.completed_at || "-"}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary me-2" data-action="edit" data-id="${p.id}">Editar</button>
            <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${p.id}">Borrar</button>
          </td>
        </tr>`;
    })
    .join("");
}

function fillSelects() {
  const studentSelects = document.querySelectorAll('select[name="student"]');
  studentSelects.forEach((sel) => {
    sel.innerHTML = `<option value="">Selecciona</option>` +
      students.map((s) => `<option value="${s.id}">${studentLabel(s)}</option>`).join("");
  });

  const taskSelects = document.querySelectorAll('select[name="task"]');
  taskSelects.forEach((sel) => {
    sel.innerHTML = `<option value="">Selecciona</option>` +
      tasks.map((t) => `<option value="${t.id}">${taskLabel(t)}</option>`).join("");
  });
}

function openEdit(id) {
  const record = progressList.find((p) => p.id === id);
  const form = document.getElementById("progress-edit-form");
  if (!record || !form) return;
  form.id.value = record.id;
  form.student.value = record.student?.id ?? record.student ?? "";
  form.task.value = record.task?.id ?? record.task ?? "";
  form.status.value = record.status || "";
  form.started_at.value = record.started_at ? record.started_at.slice(0, 16) : "";
  form.completed_at.value = record.completed_at ? record.completed_at.slice(0, 16) : "";
  form.notes.value = record.notes || "";
  editModal?.show();
}

function openDelete(id) {
  const input = document.getElementById("progress-delete-id");
  if (!input) return;
  input.value = id;
  deleteModal?.show();
}

function formToProgress(form) {
  return {
    student: Number(form.student.value),
    task: Number(form.task.value),
    status: form.status.value,
    started_at: form.started_at.value || null,
    completed_at: form.completed_at.value || null,
    notes: form.notes.value.trim(),
  };
}

function studentLabel(student) {
  const id = typeof student === "object" ? student?.id : student;
  const record = students.find((s) => s.id === id);
  return record?.fullname || record?.user?.username || "-";
}

function taskLabel(task) {
  const id = typeof task === "object" ? task?.id : task;
  const record = tasks.find((t) => t.id === id);
  return record ? `${tTitle(record)}` : "-";
}

function tTitle(task) {
  const orderPart = task.order ? `#${task.order} ` : "";
  return `${orderPart}${task.title || "Tarea"}`;
}

function showAlert(message, type = "success") {
  const box = document.getElementById("progress-alert");
  if (!box) return;
  box.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>`;
}
