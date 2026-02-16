import { StudyTopicService } from "../../services/tasks/study_topic.service.js";
import { StudyBlockService } from "../../services/tasks/study_block.service.js";
import { BlockTaskService } from "../../services/tasks/block_task.service.js";
import { StudyTopic } from "../../models/tasks/study_topic.model.js";
import { StudyBlock } from "../../models/tasks/study_block.model.js";
import { BlockTask } from "../../models/tasks/block_task.model.js";

let topics = [];
let blocks = [];
let tasks = [];

let selectedTopicId = null;
let selectedBlockId = null;

let topicCreateModal;
let topicEditModal;
let topicDeleteModal;
let blockCreateModal;
let blockEditModal;
let blockDeleteModal;
let taskCreateModal;
let taskEditModal;
let taskDeleteModal;

const topicService = new StudyTopicService();
const blockService = new StudyBlockService();
const taskService = new BlockTaskService();

export function init() {
  initModals();
  bindTopicForms();
  bindBlockForms();
  bindTaskForms();
  bindTopicTableActions();
  bindInlineButtons();
  loadData();
}

function initModals() {
  topicCreateModal = buildModal("topicCreateModal");
  topicEditModal = buildModal("topicEditModal");
  topicDeleteModal = buildModal("topicDeleteModal");
  blockCreateModal = buildModal("topicBlockCreateModal");
  blockEditModal = buildModal("topicBlockEditModal");
  blockDeleteModal = buildModal("topicBlockDeleteModal");
  taskCreateModal = buildModal("topicTaskCreateModal");
  taskEditModal = buildModal("topicTaskEditModal");
  taskDeleteModal = buildModal("topicTaskDeleteModal");
}

function buildModal(id) {
  const el = document.getElementById(id);
  return el ? new bootstrap.Modal(el) : null;
}

function bindTopicForms() {
  const createForm = document.getElementById("topic-create-form");
  const editForm = document.getElementById("topic-edit-form");
  const deleteBtn = document.getElementById("topic-delete-confirm");

  if (createForm) {
    createForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      createForm.classList.add("was-validated");
      if (!createForm.checkValidity()) return;

      const payload = formToTopic(createForm);
      try {
        await topicService.insert(payload);
      } catch (err) {
        return handleError(err, "No se pudo crear el tema");
      }
      createForm.reset();
      createForm.classList.remove("was-validated");
      topicCreateModal?.hide();
      showAlert("Tema creado");
      loadData({ preserveSelection: false });
    });
  }

  if (editForm) {
    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      editForm.classList.add("was-validated");
      if (!editForm.checkValidity()) return;

      const payload = formToTopic(editForm);
      payload.id = Number(editForm.id.value);
      try {
        await topicService.update(payload);
      } catch (err) {
        return handleError(err, "No se pudo actualizar el tema");
      }
      topicEditModal?.hide();
      showAlert("Tema actualizado");
      loadData();
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      const id = Number(document.getElementById("topic-delete-id").value);
      if (!id) return;
      try {
        await topicService.delete(id);
      } catch (err) {
        return handleError(err, "No se pudo eliminar el tema");
      }
      topicDeleteModal?.hide();
      showAlert("Tema eliminado", "warning");
      loadData({ preserveSelection: false });
    });
  }
}

function bindBlockForms() {
  const createForm = document.getElementById("topic-block-create-form");
  const editForm = document.getElementById("topic-block-edit-form");
  const deleteBtn = document.getElementById("block-delete-confirm");

  if (createForm) {
    createForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      createForm.classList.add("was-validated");
      if (!createForm.checkValidity()) return;
      const payload = formToBlock(createForm);
      try {
        await blockService.insert(payload);
      } catch (err) {
        return handleError(err, "No se pudo crear el bloque");
      }
      createForm.reset();
      createForm.classList.remove("was-validated");
      blockCreateModal?.hide();
      showAlert("Bloque creado");
      await loadData();
    });
  }

  if (editForm) {
    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      editForm.classList.add("was-validated");
      if (!editForm.checkValidity()) return;
      const payload = formToBlock(editForm);
      payload.id = Number(editForm.id.value);
      try {
        await blockService.update(payload);
      } catch (err) {
        return handleError(err, "No se pudo actualizar el bloque");
      }
      blockEditModal?.hide();
      showAlert("Bloque actualizado");
      await loadData();
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      const id = Number(document.getElementById("block-delete-id").value);
      if (!id) return;
      try {
        await blockService.delete(id);
      } catch (err) {
        return handleError(err, "No se pudo eliminar el bloque");
      }
      blockDeleteModal?.hide();
      showAlert("Bloque eliminado", "warning");
      await loadData();
    });
  }
}

function bindTaskForms() {
  const createForm = document.getElementById("topic-task-create-form");
  const editForm = document.getElementById("topic-task-edit-form");
  const deleteBtn = document.getElementById("task-delete-confirm");

  if (createForm) {
    createForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      createForm.classList.add("was-validated");
      if (!createForm.checkValidity()) return;
      const payload = formToTask(createForm);
      try {
        await taskService.insert(payload);
      } catch (err) {
        return handleError(err, "No se pudo crear la tarea");
      }
      createForm.reset();
      createForm.classList.remove("was-validated");
      taskCreateModal?.hide();
      showAlert("Tarea creada");
      await loadData();
    });
  }

  if (editForm) {
    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      editForm.classList.add("was-validated");
      if (!editForm.checkValidity()) return;
      const payload = formToTask(editForm);
      payload.id = Number(editForm.id.value);
      try {
        await taskService.update(payload);
      } catch (err) {
        return handleError(err, "No se pudo actualizar la tarea");
      }
      taskEditModal?.hide();
      showAlert("Tarea actualizada");
      await loadData();
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      const id = Number(document.getElementById("task-delete-id").value);
      if (!id) return;
      try {
        await taskService.delete(id);
      } catch (err) {
        return handleError(err, "No se pudo eliminar la tarea");
      }
      taskDeleteModal?.hide();
      showAlert("Tarea eliminada", "warning");
      await loadData();
    });
  }
}

function bindTopicTableActions() {
  const tbody = document.querySelector("#topics-table tbody");
  if (!tbody) return;

  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;
    if (action === "detail") setSelectedTopic(id);
    if (action === "edit") openTopicEdit(id);
    if (action === "delete") openTopicDelete(id);
  });
}

function bindInlineButtons() {
  const addBlockBtn = document.getElementById("add-block-btn");
  const addTaskBtn = document.getElementById("add-task-btn");
  const topicEditBtn = document.getElementById("topic-edit-shortcut");

  if (addBlockBtn) {
    addBlockBtn.addEventListener("click", () => {
      if (!selectedTopicId) return;
      prepareBlockCreateForm();
      blockCreateModal?.show();
    });
  }

  if (addTaskBtn) {
    addTaskBtn.addEventListener("click", () => {
      if (!selectedBlockId) return;
      prepareTaskCreateForm();
      taskCreateModal?.show();
    });
  }

  if (topicEditBtn) {
    topicEditBtn.addEventListener("click", () => {
      if (!selectedTopicId) return;
      openTopicEdit(selectedTopicId);
    });
  }

  const blocksTbody = document.querySelector("#blocks-inline-table tbody");
  if (blocksTbody) {
    blocksTbody.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const id = Number(btn.dataset.id);
      const action = btn.dataset.action;
      if (action === "select") setSelectedBlock(id);
      if (action === "edit") openBlockEdit(id);
      if (action === "delete") openBlockDelete(id);
    });
  }

  const tasksTbody = document.querySelector("#tasks-inline-table tbody");
  if (tasksTbody) {
    tasksTbody.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const id = Number(btn.dataset.id);
      const action = btn.dataset.action;
      if (action === "edit") openTaskEdit(id);
      if (action === "delete") openTaskDelete(id);
    });
  }
}

async function loadData({ preserveSelection = true } = {}) {
  const topicsTbody = document.querySelector("#topics-table tbody");
  if (topicsTbody) topicsTbody.innerHTML = `<tr><td colspan="5">Cargando...</td></tr>`;

  const prevTopic = preserveSelection ? selectedTopicId : null;
  const prevBlock = preserveSelection ? selectedBlockId : null;

  try {
    const [topicsData, blocksData, tasksData] = await Promise.all([
      topicService.getAll(),
      blockService.getAll(),
      taskService.getAll(),
    ]);

    topics = toArray(topicsData).map((t) => new StudyTopic(t));
    blocks = toArray(blocksData).map((b) => new StudyBlock(b));
    tasks = toArray(tasksData).map((t) => new BlockTask(t));

    if (prevTopic && topics.some((t) => t.id === prevTopic)) {
      selectedTopicId = prevTopic;
    } else {
      selectedTopicId = topics[0]?.id ?? null;
    }

    const currentBlocks = blocks.filter((b) => topicId(b) === selectedTopicId);
    if (prevBlock && currentBlocks.some((b) => b.id === prevBlock)) {
      selectedBlockId = prevBlock;
    } else {
      selectedBlockId = currentBlocks[0]?.id ?? null;
    }

    renderTopicsTable();
    renderTopicDetail();
    renderBlocksTable();
    renderTasksTable();
  } catch (err) {
    console.error(err);
    showAlert("No se pudieron cargar los datos", "danger");
  }
}

function renderTopicsTable() {
  const tbody = document.querySelector("#topics-table tbody");
  if (!tbody) return;

  if (!topics.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Sin registros</td></tr>`;
    return;
  }

  tbody.innerHTML = topics
    .map((t) => {
      const active = t.is_active ? "Sí" : "No";
      const rowClass = t.id === selectedTopicId ? "table-active" : "";
      return `
        <tr class="${rowClass}">
          <td>${t.id ?? ""}</td>
          <td>${t.name}</td>
          <td>${difficultyLabel(t.difficulty)}</td>
          <td>${active}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-secondary me-1" data-action="detail" data-id="${t.id}">Ver</button>
            <button class="btn btn-sm btn-outline-primary me-1" data-action="edit" data-id="${t.id}">Editar</button>
            <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${t.id}">Borrar</button>
          </td>
        </tr>`;
    })
    .join("");
}

function renderTopicDetail() {
  const nameEl = document.getElementById("detail-name");
  const descEl = document.getElementById("detail-description");
  const diffEl = document.getElementById("detail-difficulty");
  const statusEl = document.getElementById("detail-status");
  const addBlockBtn = document.getElementById("add-block-btn");
  const editBtn = document.getElementById("topic-edit-shortcut");

  const topic = topics.find((t) => t.id === selectedTopicId);
  if (!topic) {
    if (nameEl) nameEl.textContent = "Selecciona un tema";
    if (descEl) descEl.textContent = "Para ver la estructura completa, elige un tema de la lista.";
    if (diffEl) diffEl.textContent = "-";
    if (diffEl) diffEl.className = "badge bg-light text-secondary";
    if (statusEl) statusEl.textContent = "-";
    if (statusEl) statusEl.className = "badge bg-light text-secondary";
    if (addBlockBtn) addBlockBtn.disabled = true;
    if (editBtn) editBtn.disabled = true;
    return;
  }

  if (nameEl) nameEl.textContent = topic.name;
  if (descEl) descEl.textContent = topic.description || "Sin descripción.";

  if (diffEl) {
    diffEl.textContent = difficultyLabel(topic.difficulty);
    diffEl.className = `badge ${difficultyBadge(topic.difficulty)}`;
  }

  if (statusEl) {
    statusEl.textContent = topic.is_active ? "Activo" : "Inactivo";
    statusEl.className = `badge ${topic.is_active ? "bg-success-subtle text-success" : "bg-secondary-subtle text-secondary"}`;
  }

  if (addBlockBtn) addBlockBtn.disabled = false;
  if (editBtn) editBtn.disabled = false;
}

function renderBlocksTable() {
  const tbody = document.querySelector("#blocks-inline-table tbody");
  const addTaskBtn = document.getElementById("add-task-btn");
  const tasksLabel = document.getElementById("tasks-block-label");

  if (!tbody) return;

  if (!selectedTopicId) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-muted text-center">Selecciona un tema para ver sus bloques.</td></tr>`;
    if (addTaskBtn) addTaskBtn.disabled = true;
    if (tasksLabel) tasksLabel.textContent = "Selecciona un bloque para ver sus tareas.";
    return;
  }

  const related = blocks
    .filter((b) => topicId(b) === selectedTopicId)
    .sort((a, b) => Number(a.number) - Number(b.number));

  if (!related.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-muted text-center">No hay bloques para este tema.</td></tr>`;
    selectedBlockId = null;
    if (addTaskBtn) addTaskBtn.disabled = true;
    if (tasksLabel) tasksLabel.textContent = "Agrega un bloque para poder crear tareas.";
    renderTasksTable();
    return;
  }

  if (!related.some((b) => b.id === selectedBlockId)) {
    selectedBlockId = related[0]?.id ?? null;
  }

  tbody.innerHTML = related
    .map((b) => {
      const published = b.is_published ? "Publicado" : "Borrador";
      const rowClass = b.id === selectedBlockId ? "table-active" : "";
      return `
        <tr class="${rowClass}">
          <td>${b.number ?? "-"}</td>
          <td>${b.title}</td>
          <td>${b.estimated_minutes || "-"}</td>
          <td>${published}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-secondary me-1" data-action="select" data-id="${b.id}">Ver tareas</button>
            <button class="btn btn-sm btn-outline-primary me-1" data-action="edit" data-id="${b.id}">Editar</button>
            <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${b.id}">Borrar</button>
          </td>
        </tr>`;
    })
    .join("");

  if (addTaskBtn) addTaskBtn.disabled = !selectedBlockId;
  updateTasksLabel();
}

function renderTasksTable() {
  const tbody = document.querySelector("#tasks-inline-table tbody");
  if (!tbody) return;

  if (!selectedBlockId) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-muted text-center">Selecciona un bloque para ver sus tareas.</td></tr>`;
    updateTasksLabel();
    return;
  }

  const related = tasks
    .filter((t) => blockId(t) === selectedBlockId)
    .sort((a, b) => Number(a.order) - Number(b.order));

  if (!related.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-muted text-center">No hay tareas para este bloque.</td></tr>`;
    updateTasksLabel();
    return;
  }

  tbody.innerHTML = related
    .map((t) => {
      return `
        <tr>
          <td>${t.order ?? "-"}</td>
          <td>${t.title}</td>
          <td>${t.estimated_minutes || "-"}</td>
          <td>${t.status || "-"}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary me-1" data-action="edit" data-id="${t.id}">Editar</button>
            <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${t.id}">Borrar</button>
          </td>
        </tr>`;
    })
    .join("");

  updateTasksLabel();
}

function setSelectedTopic(id) {
  selectedTopicId = id;
  const relatedBlocks = blocks.filter((b) => topicId(b) === id);
  selectedBlockId = relatedBlocks[0]?.id ?? null;
  renderTopicsTable();
  renderTopicDetail();
  renderBlocksTable();
  renderTasksTable();
}

function setSelectedBlock(id) {
  selectedBlockId = id;
  renderBlocksTable();
  renderTasksTable();
}

function openTopicEdit(id) {
  const topic = topics.find((t) => t.id === id);
  const form = document.getElementById("topic-edit-form");
  if (!topic || !form) return;
  form.id.value = topic.id;
  form.name.value = topic.name;
  form.description.value = topic.description || "";
  form.difficulty.value = topic.difficulty || "";
  form.is_active.checked = Boolean(topic.is_active);
  topicEditModal?.show();
}

function openTopicDelete(id) {
  const input = document.getElementById("topic-delete-id");
  if (!input) return;
  input.value = id;
  topicDeleteModal?.show();
}

function prepareBlockCreateForm() {
  const form = document.getElementById("topic-block-create-form");
  const label = document.getElementById("block-topic-label");
  if (!form) return;
  form.reset();
  form.classList.remove("was-validated");
  form.topic.value = selectedTopicId ?? "";
  if (label) label.textContent = `Tema seleccionado: ${topicLabel(selectedTopicId)}`;
}

function openBlockEdit(id) {
  const block = blocks.find((b) => b.id === id);
  const form = document.getElementById("topic-block-edit-form");
  const label = document.getElementById("block-edit-topic-label");
  if (!block || !form) return;
  form.id.value = block.id;
  form.topic.value = topicId(block) ?? "";
  form.number.value = block.number;
  form.title.value = block.title;
  form.description.value = block.description || "";
  form.estimated_minutes.value = block.estimated_minutes || "";
  form.is_published.checked = Boolean(block.is_published);
  if (label) label.textContent = `Tema seleccionado: ${topicLabel(topicId(block))}`;
  blockEditModal?.show();
}

function openBlockDelete(id) {
  const input = document.getElementById("block-delete-id");
  if (!input) return;
  input.value = id;
  blockDeleteModal?.show();
}

function prepareTaskCreateForm() {
  const form = document.getElementById("topic-task-create-form");
  const label = document.getElementById("task-block-label");
  if (!form) return;
  form.reset();
  form.classList.remove("was-validated");
  form.block.value = selectedBlockId ?? "";
  if (label) label.textContent = `Bloque seleccionado: ${blockLabel(selectedBlockId)}`;
}

function openTaskEdit(id) {
  const task = tasks.find((t) => t.id === id);
  const form = document.getElementById("topic-task-edit-form");
  const label = document.getElementById("task-edit-block-label");
  if (!task || !form) return;
  form.id.value = task.id;
  form.block.value = blockId(task) ?? "";
  form.order.value = task.order ?? "";
  form.title.value = task.title;
  form.estimated_minutes.value = task.estimated_minutes || "";
  form.status.value = task.status || "";
  form.instructions.value = task.instructions || "";
  form.resources.value = task.resources || "";
  if (label) label.textContent = `Bloque seleccionado: ${blockLabel(blockId(task))}`;
  taskEditModal?.show();
}

function openTaskDelete(id) {
  const input = document.getElementById("task-delete-id");
  if (!input) return;
  input.value = id;
  taskDeleteModal?.show();
}

function updateTasksLabel() {
  const label = document.getElementById("tasks-block-label");
  if (!label) return;
  if (!selectedBlockId) {
    label.textContent = "Selecciona un bloque para ver sus tareas.";
    return;
  }
  label.textContent = `Bloque seleccionado: ${blockLabel(selectedBlockId)}`;
}

function formToTopic(form) {
  return {
    name: form.name.value.trim(),
    description: form.description.value.trim(),
    difficulty: normalizeDifficulty(form.difficulty.value),
    is_active: form.is_active.checked,
  };
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

function topicId(block) {
  return typeof block.topic === "object" ? block.topic?.id : block.topic;
}

function blockId(task) {
  const ref = task.block ?? task.block_detail;
  return typeof ref === "object" ? ref?.id : ref;
}

function topicLabel(id) {
  const record = topics.find((t) => t.id === id);
  return record?.name || "-";
}

function blockLabel(id) {
  const record = blocks.find((b) => b.id === id);
  if (!record) return "-";
  const numberPart = record.number ? `#${record.number} ` : "";
  return `${numberPart}${record.title || "Bloque"}`;
}

function difficultyLabel(value) {
  if (value === "beginner") return "Principiante";
  if (value === "intermediate") return "Intermedio";
  if (value === "advanced") return "Avanzado";
  return "-";
}

function difficultyBadge(value) {
  if (value === "beginner") return "bg-success-subtle text-success";
  if (value === "intermediate") return "bg-warning-subtle text-warning";
  if (value === "advanced") return "bg-danger-subtle text-danger";
  return "bg-light text-secondary";
}

function normalizeDifficulty(raw) {
  const v = (raw || "").toLowerCase();
  if (v === "easy") return "beginner";
  if (v === "medium") return "intermediate";
  if (v === "hard") return "advanced";
  if (["beginner", "intermediate", "advanced"].includes(v)) return v;
  return "";
}

function toArray(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
}

function handleError(err, message) {
  console.error(err);
  showAlert(message, "danger");
}

function showAlert(message, type = "success") {
  const box = document.getElementById("topics-alert");
  if (!box) return;
  box.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>`;
}
