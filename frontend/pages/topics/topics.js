import { StudyTopicService } from "../../services/tasks/study_topic.service.js";
import { StudyTopic } from "../../models/tasks/study_topic.model.js";

let topics = [];
let createModal;
let editModal;
let deleteModal;

const service = new StudyTopicService();

export function init() {
  const createEl = document.getElementById("topicCreateModal");
  const editEl = document.getElementById("topicEditModal");
  const deleteEl = document.getElementById("topicDeleteModal");

  createModal = createEl ? new bootstrap.Modal(createEl) : null;
  editModal = editEl ? new bootstrap.Modal(editEl) : null;
  deleteModal = deleteEl ? new bootstrap.Modal(deleteEl) : null;

  bindForms();
  bindTableActions();
  loadTopics();
}

function bindForms() {
  const createForm = document.getElementById("topic-create-form");
  const editForm = document.getElementById("topic-edit-form");
  const deleteBtn = document.getElementById("topic-delete-confirm");

  if (createForm) {
    createForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      createForm.classList.add("was-validated");
      if (!createForm.checkValidity()) return;

      const payload = formToTopic(createForm);
      await service.insert(payload);
      createForm.reset();
      createForm.classList.remove("was-validated");
      createModal?.hide();
      showAlert("Tema creado");
      loadTopics();
    });
  }

  if (editForm) {
    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      editForm.classList.add("was-validated");
      if (!editForm.checkValidity()) return;

      const payload = formToTopic(editForm);
      payload.id = Number(editForm.id.value);
      await service.update(payload);
      editModal?.hide();
      showAlert("Tema actualizado");
      loadTopics();
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      const id = Number(document.getElementById("topic-delete-id").value);
      if (!id) return;
      await service.delete(id);
      deleteModal?.hide();
      showAlert("Tema eliminado", "warning");
      loadTopics();
    });
  }
}

function bindTableActions() {
  const tbody = document.querySelector("#topics-table tbody");
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

async function loadTopics() {
  const tbody = document.querySelector("#topics-table tbody");
  if (tbody) tbody.innerHTML = `<tr><td colspan="5">Cargando...</td></tr>`;
  try {
    const data = await service.getAll();
    const raw = Array.isArray(data?.results) ? data.results : data;
    topics = raw.map((t) => new StudyTopic(t));
    renderTable();
  } catch (err) {
    console.error(err);
    showAlert("No se pudieron cargar los temas", "danger");
  }
}

function renderTable() {
  const tbody = document.querySelector("#topics-table tbody");
  if (!tbody) return;

  if (!topics.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Sin registros</td></tr>`;
    return;
  }

  tbody.innerHTML = topics
    .map((t) => {
      const active = t.is_active ? "Sí" : "No";
      return `
        <tr>
          <td>${t.id ?? ""}</td>
          <td>${t.name}</td>
          <td>${t.difficulty || "-"}</td>
          <td>${active}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary me-2" data-action="edit" data-id="${t.id}">Editar</button>
            <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${t.id}">Borrar</button>
          </td>
        </tr>`;
    })
    .join("");
}

function openEdit(id) {
  const topic = topics.find((t) => t.id === id);
  if (!topic) return;
  const form = document.getElementById("topic-edit-form");
  if (!form) return;
  form.id.value = topic.id;
  form.name.value = topic.name;
  form.description.value = topic.description || "";
  form.difficulty.value = topic.difficulty || "";
  form.is_active.checked = Boolean(topic.is_active);
  editModal?.show();
}

function openDelete(id) {
  const input = document.getElementById("topic-delete-id");
  if (!input) return;
  input.value = id;
  deleteModal?.show();
}

function formToTopic(form) {
  return {
    name: form.name.value.trim(),
    description: form.description.value.trim(),
    difficulty: form.difficulty.value,
    is_active: form.is_active.checked,
  };
}

function showAlert(message, type = "success") {
  const box = document.getElementById("topics-alert");
  if (!box) return;
  box.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>`;
}
