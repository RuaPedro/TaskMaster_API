import { BlockTaskService } from "../../services/tasks/block_task.service.js";
import { StudyBlockService } from "../../services/tasks/study_block.service.js";
import { BlockTask } from "../../models/tasks/block_task.model.js";
import { StudyBlock } from "../../models/tasks/study_block.model.js";

let tasks = [];
let blocks = [];
let createModal;
let editModal;
let deleteModal;

const taskService = new BlockTaskService();
const blockService = new StudyBlockService();

export function init() {
  const createEl = document.getElementById("taskCreateModal");
  const editEl = document.getElementById("taskEditModal");
  const deleteEl = document.getElementById("taskDeleteModal");

  createModal = createEl ? new bootstrap.Modal(createEl) : null;
  editModal = editEl ? new bootstrap.Modal(editEl) : null;
  deleteModal = deleteEl ? new bootstrap.Modal(deleteEl) : null;

  bindForms();
  bindTableActions();
  loadData();
}

function bindForms() {
  const createForm = document.getElementById("task-create-form");
  const editForm = document.getElementById("task-edit-form");
  const deleteBtn = document.getElementById("task-delete-confirm");

  if (createForm) {
    createForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      createForm.classList.add("was-validated");
      if (!createForm.checkValidity()) return;

      const payload = formToTask(createForm);
      await taskService.insert(payload);
      createForm.reset();
      createForm.classList.remove("was-validated");
      createModal?.hide();
      showAlert("Tarea creada");
      loadData();
    });
  }

  if (editForm) {
    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      editForm.classList.add("was-validated");
      if (!editForm.checkValidity()) return;

      const payload = formToTask(editForm);
      payload.id = Number(editForm.id.value);
      await taskService.update(payload);
      editModal?.hide();
      showAlert("Tarea actualizada");
      loadData();
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      const id = Number(document.getElementById("task-delete-id").value);
      if (!id) return;
      await taskService.delete(id);
      deleteModal?.hide();
      showAlert("Tarea eliminada", "warning");
      loadData();
    });
  }
}

function bindTableActions() {
  const tbody = document.querySelector("#tasks-table tbody");
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
  const tbody = document.querySelector("#tasks-table tbody");
  if (tbody) tbody.innerHTML = `<tr><td colspan="7">Cargando...</td></tr>`;
  try {
    const [blocksData, tasksData] = await Promise.all([
      blockService.getAll(),
      taskService.getAll(),
    ]);
    const rawBlocks = Array.isArray(blocksData?.results) ? blocksData.results : blocksData;
    blocks = rawBlocks.map((b) => new StudyBlock(b));
    const rawTasks = Array.isArray(tasksData?.results) ? tasksData.results : tasksData;
    tasks = rawTasks.map((t) => new BlockTask(t));
    fillBlockSelects();
    renderTable();
  } catch (err) {
    console.error(err);
    showAlert("No se pudieron cargar tareas", "danger");
  }
}

function renderTable() {
  const tbody = document.querySelector("#tasks-table tbody");
  if (!tbody) return;

  if (!tasks.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">Sin registros</td></tr>`;
    return;
  }

  tbody.innerHTML = tasks
    .map((t) => {
      return `
        <tr>
          <td>${t.id ?? ""}</td>
          <td>${blockLabel(t.block)}</td>
          <td>${t.title}</td>
          <td>${t.order ?? "-"}</td>
          <td>${t.estimated_minutes || "-"}</td>
          <td>${t.status || "-"}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary me-2" data-action="edit" data-id="${t.id}">Editar</button>
            <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${t.id}">Borrar</button>
          </td>
        </tr>`;
    })
    .join("");
}

function fillBlockSelects() {
  const selects = document.querySelectorAll('select[name="block"]');
  selects.forEach((sel) => {
    sel.innerHTML = `<option value="">Selecciona</option>` +
      blocks
        .map((b) => `<option value="${b.id}">${blockLabel(b)}</option>`)
        .join("");
  });
}

function openEdit(id) {
  const task = tasks.find((t) => t.id === id);
  const form = document.getElementById("task-edit-form");
  if (!task || !form) return;
  form.id.value = task.id;
  form.block.value = task.block?.id ?? task.block ?? "";
  form.title.value = task.title;
  form.order.value = task.order ?? "";
  form.estimated_minutes.value = task.estimated_minutes || "";
  form.instructions.value = task.instructions || "";
  form.resources.value = task.resources || "";
  form.status.value = task.status || "";
  editModal?.show();
}

function openDelete(id) {
  const input = document.getElementById("task-delete-id");
  if (!input) return;
  input.value = id;
  deleteModal?.show();
}

function formToTask(form) {
  return {
    block: Number(form.block.value),
    title: form.title.value.trim(),
    order: form.order.value ? Number(form.order.value) : null,
    estimated_minutes: form.estimated_minutes.value ? Number(form.estimated_minutes.value) : null,
    instructions: form.instructions.value.trim(),
    resources: form.resources.value.trim(),
    status: form.status.value,
  };
}

function blockLabel(block) {
  const id = typeof block === "object" ? block?.id : block;
  const record = blocks.find((b) => b.id === id);
  if (!record) return "-";
  const numberPart = record.number ? `#${record.number} - ` : "";
  return `${numberPart}${record.title || "Bloque"}`;
}

function showAlert(message, type = "success") {
  const box = document.getElementById("tasks-alert");
  if (!box) return;
  box.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>`;
}
