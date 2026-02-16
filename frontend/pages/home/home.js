import { StudentService } from "../../services/users/student.service.js";
import { StudyTopicService } from "../../services/tasks/study_topic.service.js";
import { StudyBlockService } from "../../services/tasks/study_block.service.js";
import { BlockTaskService } from "../../services/tasks/block_task.service.js";
import { StudentTaskProgressService } from "../../services/users/student_task_progress.service.js";
import { StudyTopic } from "../../models/tasks/study_topic.model.js";
import { StudyBlock } from "../../models/tasks/study_block.model.js";
import { BlockTask } from "../../models/tasks/block_task.model.js";

let currentUser = null;
let studentProfile = null;
let topics = [];
let blocks = [];
let tasks = [];
let selectedTopicId = null;
let selectedBlockId = null;
let selectedTaskId = null;

const studentService = new StudentService();
const topicService = new StudyTopicService();
const blockService = new StudyBlockService();
const taskService = new BlockTaskService();
const progressService = new StudentTaskProgressService();

export function init() {
  console.log("home listo");
  currentUser = getLoggedUser();
  wireStudentForm();
  loadStudentProfile();
  loadCatalog();
}

function getLoggedUser() {
  try {
    const stored = localStorage.getItem("tm_user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

async function loadStudentProfile() {
  if (!currentUser) return updateStudentStatus("Necesitas iniciar sesión", "bg-warning-subtle text-warning");
  try {
    const data = await studentService.getAll();
    const all = Array.isArray(data?.results) ? data.results : data;
    studentProfile = all.find((s) => s.user === currentUser.id || s.user?.id === currentUser.id) || null;
    if (studentProfile) {
      const name = studentProfile.full_name || currentUser.username;
      updateStudentStatus(`Bienvenido, ${name}`, "bg-success-subtle text-success");
      fillStudentForm(name);

    } else {
      updateStudentStatus("No registrado", "bg-secondary-subtle text-secondary");

    }
  } catch (err) {
    console.error(err);
    updateStudentStatus("Error al cargar estado", "bg-danger-subtle text-danger");
  }
}

function wireStudentForm() {
  const form = document.getElementById("student-form");
  const btn = document.getElementById("student-btn");
  const spinner = btn?.querySelector(".spinner-border");
  const label = btn?.querySelector(".btn-label");
  const openBtn = document.getElementById("open-student-modal");
  const modalEl = document.getElementById("studentModal");
  const modal = modalEl ? new bootstrap.Modal(modalEl) : null;

  openBtn?.addEventListener("click", () => modal?.show());

  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    form.classList.add("was-validated");
    if (!form.checkValidity() || !currentUser) return;
    toggleLoading(btn, spinner, label, true);
    const payload = { user: currentUser.id, full_name: form.full_name.value.trim() };
    try {
      studentProfile = await studentService.insert(payload);
      updateStudentStatus(`Bienvenido, ${studentProfile.full_name}`, "bg-success-subtle text-success");
      showStudentAlert("Registrado como estudiante.", "success");
      modal?.hide();
      renderProgress();
    } catch (err) {
      console.error(err);
      showStudentAlert("No se pudo registrar el estudiante", "danger");
    } finally {
      toggleLoading(btn, spinner, label, false);
    }
  });
}

function fillStudentForm(name) {
  const form = document.getElementById("student-form");
  if (!form) return;
  form.full_name.value = name;
}

function updateStudentStatus(text, classes) {
  const badge = document.getElementById("student-status");
  if (!badge) return;
  badge.textContent = text;
  badge.className = `badge ${classes}`;
}

function showStudentAlert(msg, type = "success") {
  const box = document.getElementById("student-alerts");
  if (!box) return;
  box.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
    ${msg}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>`;
}

async function loadCatalog() {
  try {
    const [topicsData, blocksData, tasksData] = await Promise.all([
      topicService.getAll(),
      blockService.getAll(),
      taskService.getAll(),
    ]);
    topics = toArray(topicsData).map((t) => new StudyTopic(t));
    blocks = toArray(blocksData).map((b) => new StudyBlock(b));
    tasks = toArray(tasksData).map((t) => new BlockTask(t));
    renderTopics();
    renderProgress();
  } catch (err) {
    console.error(err);
  }
}

function renderTopics() {
  const wrap = document.getElementById("topics-cards");
  if (!wrap) return;
  if (!topics.length) {
    wrap.innerHTML = `<div class="col-12"><div class="alert alert-info mb-0">No hay temas disponibles.</div></div>`;
    return;
  }
  wrap.innerHTML = topics
    .map(
      (t) => `
    <div class="col-12 col-md-6 col-xl-4">
      <div class="card h-100 topic-card" data-id="${t.id}">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h5 class="card-title mb-1">${t.name}</h5>
              <p class="text-muted small mb-2">${t.description || "Sin descripción"}</p>
            </div>
            <span class="badge bg-light text-secondary">${difficultyLabel(t.difficulty)}</span>
          </div>
          <div class="d-flex gap-2 mt-auto">
            <button class="btn btn-sm btn-outline-primary w-100" data-action="open-workspace" data-id="${t.id}">Workspace</button>
          </div>
        </div>
      </div>
    </div>`
    )
    .join("");

  wrap.querySelectorAll("[data-action='open-workspace']").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.id);
      const firstBlock = blocks.find((b) => topicId(b) === id);
      const firstTask = firstBlock ? tasks.find((t) => blockId(t) === firstBlock.id) : null;
      if (firstTask) {
        localStorage.setItem("tm_workspace_task", String(firstTask.id));
      }
      window.dispatchEvent(new CustomEvent("tm:navigate", { detail: { page: "workspace" } }));
    });
  });
}

function setTopic(id) {
  selectedTopicId = id;
  selectedBlockId = null;
  selectedTaskId = null;
  const label = document.getElementById("current-topic-label");
  if (label) label.textContent = topicLabel(id);
}

function renderBlocks() {
  /* Se removió listado de bloques en Home */
}

function setBlock(id) {
  selectedBlockId = id;
  selectedTaskId = null;
  const label = document.getElementById("current-block-label");
  if (label) label.textContent = blockLabel(id);
}

function renderTasks() {
  /* Se removió listado de tareas en Home */
}

function setTask(id) {
  selectedTaskId = id;
  const task = tasks.find((t) => t.id === id);
  // only selection for context; workspace lives elsewhere
}

function toggleLoading(btn, spinner, label, isLoading) {
  if (!btn || !spinner || !label) return;
  btn.disabled = isLoading;
  spinner.classList.toggle("d-none", !isLoading);
  label.classList.toggle("d-none", isLoading);
}

function difficultyLabel(value) {
  if (value === "beginner") return "Principiante";
  if (value === "intermediate") return "Intermedio";
  if (value === "advanced") return "Avanzado";
  return value || "-";
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
  return record?.name || "Sin tema";
}

function blockLabel(id) {
  const record = blocks.find((b) => b.id === id);
  const numberPart = record?.number ? `#${record.number} ` : "";
  return record ? `${numberPart}${record.title}` : "Sin bloque";
}

function toArray(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
}

function defaultSnippet() {
  return `<!doctype html>
<html>
<head>
  <style>
    body { font-family: system-ui; padding: 16px; }
    .box { padding: 12px; background:#e0e7ff; border-radius:8px; }
  </style>
</head>
<body>
  <div class="box">
    <h3>Hola TaskMaster</h3>
    <p>Edita este HTML, CSS o agrega JS para probar tu solución.</p>
  </div>
</body>
</html>`;
}

function renderProgress() {
  const box = document.getElementById("progress-list");
  if (!box) return;
  if (!studentProfile) {
    box.innerHTML = `<div class="list-group-item text-muted">Regístrate como estudiante para ver tu progreso.</div>`;
    return;
  }
  progressService
    .getAll()
    .then((data) => {
      const rows = toArray(data).filter((p) => p.student === studentProfile.id || p.student?.id === studentProfile.id);
      if (!rows.length) {
        box.innerHTML = `<div class="list-group-item text-muted">Aún no tienes tareas registradas.</div>`;
        return;
      }
      box.innerHTML = rows
        .map((p) => {
          const task = tasks.find((t) => t.id === (p.task?.id ?? p.task));
          const block = task ? blocks.find((b) => b.id === blockId(task)) : null;
          const topic = block ? topics.find((tp) => tp.id === topicId(block)) : null;
          return `
            <div class="list-group-item d-flex justify-content-between align-items-center">
              <div class="me-2">
                <div><strong>${task?.title || "Tarea"}</strong></div>
                <small class="text-muted">${topic?.name || "-"} · ${block?.title || "-"}</small>
              </div>
              <span class="badge ${progressBadge(p.status)}">${p.status}</span>
            </div>`;
        })
        .join("");
    })
    .catch((err) => {
      console.error(err);
      box.innerHTML = `<div class="list-group-item text-muted">No se pudo cargar progreso.</div>`;
    });
}

function progressBadge(status) {
  if (status === "completed") return "bg-success-subtle text-success";
  if (status === "in_progress") return "bg-warning-subtle text-warning";
  return "bg-secondary-subtle text-secondary";
}
