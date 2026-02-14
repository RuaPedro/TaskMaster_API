import { StudyBlockService } from "../../services/tasks/study_block.service.js";
import { StudyTopicService } from "../../services/tasks/study_topic.service.js";
import { StudyBlock } from "../../models/tasks/study_block.model.js";
import { StudyTopic } from "../../models/tasks/study_topic.model.js";

let blocks = [];
let topics = [];
let createModal;
let editModal;
let deleteModal;

const blockService = new StudyBlockService();
const topicService = new StudyTopicService();

export function init() {
  const createEl = document.getElementById("blockCreateModal");
  const editEl = document.getElementById("blockEditModal");
  const deleteEl = document.getElementById("blockDeleteModal");

  createModal = createEl ? new bootstrap.Modal(createEl) : null;
  editModal = editEl ? new bootstrap.Modal(editEl) : null;
  deleteModal = deleteEl ? new bootstrap.Modal(deleteEl) : null;

  bindForms();
  bindTableActions();
  loadData();
}

function bindForms() {
  const createForm = document.getElementById("block-create-form");
  const editForm = document.getElementById("block-edit-form");
  const deleteBtn = document.getElementById("block-delete-confirm");

  if (createForm) {
    createForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      createForm.classList.add("was-validated");
      if (!createForm.checkValidity()) return;

      const payload = formToBlock(createForm);
      await blockService.insert(payload);
      createForm.reset();
      createForm.classList.remove("was-validated");
      createModal?.hide();
      showAlert("Bloque creado");
      loadData();
    });
  }

  if (editForm) {
    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      editForm.classList.add("was-validated");
      if (!editForm.checkValidity()) return;

      const payload = formToBlock(editForm);
      payload.id = Number(editForm.id.value);
      await blockService.update(payload);
      editModal?.hide();
      showAlert("Bloque actualizado");
      loadData();
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      const id = Number(document.getElementById("block-delete-id").value);
      if (!id) return;
      await blockService.delete(id);
      deleteModal?.hide();
      showAlert("Bloque eliminado", "warning");
      loadData();
    });
  }
}

function bindTableActions() {
  const tbody = document.querySelector("#blocks-table tbody");
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
  const tbody = document.querySelector("#blocks-table tbody");
  if (tbody) tbody.innerHTML = `<tr><td colspan="7">Cargando...</td></tr>`;
  try {
    const [topicsData, blocksData] = await Promise.all([
      topicService.getAll(),
      blockService.getAll(),
    ]);
    const rawTopics = Array.isArray(topicsData?.results) ? topicsData.results : topicsData;
    topics = rawTopics.map((t) => new StudyTopic(t));
    const rawBlocks = Array.isArray(blocksData?.results) ? blocksData.results : blocksData;
    blocks = rawBlocks.map((b) => new StudyBlock(b));
    fillTopicSelects();
    renderTable();
  } catch (err) {
    console.error(err);
    showAlert("No se pudieron cargar bloques", "danger");
  }
}

function renderTable() {
  const tbody = document.querySelector("#blocks-table tbody");
  if (!tbody) return;

  if (!blocks.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">Sin registros</td></tr>`;
    return;
  }

  tbody.innerHTML = blocks
    .map((b) => {
      return `
        <tr>
          <td>${b.id ?? ""}</td>
          <td>${topicLabel(b.topic)}</td>
          <td>${b.number}</td>
          <td>${b.title}</td>
          <td>${b.estimated_minutes || "-"}</td>
          <td>${b.is_published ? "Sí" : "No"}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary me-2" data-action="edit" data-id="${b.id}">Editar</button>
            <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${b.id}">Borrar</button>
          </td>
        </tr>`;
    })
    .join("");
}

function fillTopicSelects() {
  const selects = document.querySelectorAll('select[name="topic"]');
  selects.forEach((sel) => {
    sel.innerHTML = `<option value="">Selecciona</option>` +
      topics
        .map((t) => `<option value="${t.id}">${t.name}</option>`)
        .join("");
  });
}

function openEdit(id) {
  const block = blocks.find((b) => b.id === id);
  const form = document.getElementById("block-edit-form");
  if (!block || !form) return;
  form.id.value = block.id;
  form.topic.value = block.topic?.id ?? block.topic ?? "";
  form.number.value = block.number;
  form.title.value = block.title;
  form.description.value = block.description || "";
  form.estimated_minutes.value = block.estimated_minutes || "";
  form.is_published.checked = Boolean(block.is_published);
  editModal?.show();
}

function openDelete(id) {
  const input = document.getElementById("block-delete-id");
  if (!input) return;
  input.value = id;
  deleteModal?.show();
}

function formToBlock(form) {
  return {
    topic: Number(form.topic.value),
    number: Number(form.number.value),
    title: form.title.value.trim(),
    description: form.description.value.trim(),
    estimated_minutes: form.estimated_minutes.value ? Number(form.estimated_minutes.value) : null,
    is_published: form.is_published.checked,
  };
}

function topicLabel(topic) {
  const id = typeof topic === "object" ? topic?.id : topic;
  const record = topics.find((t) => t.id === id);
  return record?.name || "-";
}

function showAlert(message, type = "success") {
  const box = document.getElementById("blocks-alert");
  if (!box) return;
  box.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>`;
}
