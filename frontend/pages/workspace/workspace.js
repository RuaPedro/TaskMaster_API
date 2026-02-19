import { StudyTopicService } from "../../services/tasks/study_topic.service.js";
import { StudyBlockService } from "../../services/tasks/study_block.service.js";
import { BlockTaskService } from "../../services/tasks/block_task.service.js";
import { StudentService } from "../../services/users/student.service.js";
import { StudentTaskProgressService } from "../../services/users/student_task_progress.service.js";
import { StudyTopic } from "../../models/tasks/study_topic.model.js";
import { StudyBlock } from "../../models/tasks/study_block.model.js";
import { BlockTask } from "../../models/tasks/block_task.model.js";

let topics = [];
let blocks = [];
let tasks = [];
let studentProfile = null;
let currentUser = null;
let selectedTaskId = null;
let selectedTopicId = null;
let selectedBlockId = null;
let editorMode = "web"; // web | python
let skulptReady = false;
let activeWebPane = "html"; // html | css | js
let lastCssJsPane = "css";

const topicService = new StudyTopicService();
const blockService = new StudyBlockService();
const taskService = new BlockTaskService();
const studentService = new StudentService();
const progressService = new StudentTaskProgressService();

export function init() {
  currentUser = getLoggedUser();
  wireButtons();
  loadCatalog().then(() => preloadFromStorage());
  loadStudentProfile();
}

function getLoggedUser() {
  try {
    return JSON.parse(localStorage.getItem("tm_user") || "null");
  } catch {
    return null;
  }
}

function wireButtons() {
  document.getElementById("ws-run-btn")?.addEventListener("click", runCode);
  document.getElementById("ws-complete-btn")?.addEventListener("click", markCompleted);
  document.getElementById("ws-back-home")?.addEventListener("click", () => {
    window.dispatchEvent(new CustomEvent("tm:navigate", { detail: { page: "home" } }));
  });
  document.getElementById("mode-web")?.addEventListener("change", () => switchMode("web"));
  document.getElementById("mode-py")?.addEventListener("change", () => switchMode("python"));
  wireWebTabs();
  wireAutosave();
  document.getElementById("ws-cycle-editor")?.addEventListener("click", cycleWebPane);
  // ensure initial state only shows HTML
  setActiveWebPane(activeWebPane);
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
    if (!selectedTopicId && topics.length) selectedTopicId = topics[0].id;
    renderTopicList();
    renderBlockList();
    renderTaskList();
  } catch (err) {
    console.error(err);
    showAlert(parseError(err) || "No se pudieron cargar tareas", "danger");
  }
}

async function loadStudentProfile() {
  if (!currentUser) return;
  try {
    const data = await studentService.getAll();
    const all = Array.isArray(data?.results) ? data.results : data;
    studentProfile = all.find((s) => s.user === currentUser.id || s.user?.id === currentUser.id) || null;
    updateCompleteButton();
  } catch (err) {
    console.error(err);
  }
}

function renderTaskList() {
  const box = document.getElementById("ws-task-list");
  if (!box) return;
  const filtered = selectedBlockId
    ? tasks.filter((t) => blockId(t) === selectedBlockId)
    : tasks;
  if (!filtered.length) {
    box.innerHTML = `<div class="list-group-item text-muted">No hay tareas.</div>`;
    return;
  }
  box.innerHTML = filtered
    .map((t) => {
      const block = blocks.find((b) => b.id === blockId(t));
      const topic = block ? topics.find((tp) => tp.id === topicId(block)) : null;
      return `
      <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center" data-ws-task="${t.id}">
        <div class="me-2">
          <div><strong>${t.title}</strong></div>
          <small class="text-muted">${topic?.name || "-"} - ${block?.title || "-"}</small>
        </div>
        <span class="badge bg-light text-secondary">${t.status || "-"}</span>
      </button>`;
    })
    .join("");

  box.querySelectorAll("[data-ws-task]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.dataset.wsTask);
      setTask(id);
      localStorage.setItem("tm_workspace_task", String(id));
    });
  });
}

function renderTopicList() {
  const box = document.getElementById("ws-topic-list");
  if (!box) return;
  if (!topics.length) {
    box.innerHTML = `<div class="list-group-item text-muted">No hay temas.</div>`;
    return;
  }
  box.innerHTML = topics
    .map(
      (t) => `<button class="list-group-item list-group-item-action ${t.id === selectedTopicId ? "active" : ""}" data-ws-topic="${t.id}">
        ${t.name}
      </button>`
    )
    .join("");

  box.querySelectorAll("[data-ws-topic]").forEach((btn) =>
    btn.addEventListener("click", () => {
      selectedTopicId = Number(btn.dataset.wsTopic);
      selectedBlockId = null;
      renderTopicList();
      renderBlockList();
      renderTaskList();
    })
  );
}

function renderBlockList() {
  const box = document.getElementById("ws-block-list");
  if (!box) return;
  if (!selectedTopicId) {
    box.innerHTML = `<div class="list-group-item text-muted">Selecciona un tema.</div>`;
    return;
  }
  const filtered = blocks.filter((b) => topicId(b) === selectedTopicId);
  if (!filtered.length) {
    box.innerHTML = `<div class="list-group-item text-muted">No hay bloques.</div>`;
    return;
  }
  box.innerHTML = filtered
    .map(
      (b) => `<button class="list-group-item list-group-item-action ${b.id === selectedBlockId ? "active" : ""}" data-ws-block="${b.id}">
        #${b.number || "-"} · ${b.title}
      </button>`
    )
    .join("");

  box.querySelectorAll("[data-ws-block]").forEach((btn) =>
    btn.addEventListener("click", () => {
      selectedBlockId = Number(btn.dataset.wsBlock);
      renderBlockList();
      renderTaskList();
    })
  );
}

function preloadFromStorage() {
  const stored = localStorage.getItem("tm_workspace_task");
  if (stored) {
    setTask(Number(stored));
  }
}

function setTask(id) {
  selectedTaskId = id;
  const task = tasks.find((t) => t.id === id);
  const block = task ? blocks.find((b) => b.id === blockId(task)) : null;
  const topic = block ? topics.find((tp) => tp.id === topicId(block)) : null;
  selectedBlockId = block?.id ?? null;
  selectedTopicId = topic?.id ?? null;
  renderTopicList();
  renderBlockList();

  const title = document.getElementById("ws-task-title");
  const desc = document.getElementById("ws-task-desc");
  if (title) title.textContent = task ? task.title : "Selecciona una tarea";
  if (desc) desc.textContent = task ? task.instructions || "Escribe tu solucion." : "Aqui podras escribir codigo y ver el resultado.";
  updateCompleteButton();

  applySnippets(task, topic, block);
}

function runCode() {
  const frame = document.getElementById("ws-preview");
  if (!frame) return;
  if (editorMode === "web") {
    const html = document.getElementById("ws-editor-html")?.value || "";
    const css = document.getElementById("ws-editor-css")?.value || "";
    const js = document.getElementById("ws-editor-js")?.value || "";
    frame.srcdoc = `
      <!doctype html>
      <html>
        <head>
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${js}<\/script>
        </body>
      </html>`;
  } else {
    runPython(frame);
  }
}

async function markCompleted() {
  if (!studentProfile || !selectedTaskId) return showAlert("Registrate como estudiante y selecciona una tarea.", "warning");
  try {
    await progressService.insert({ student: studentProfile.id, task: selectedTaskId, status: "completed" });
    showAlert("Tarea marcada como completada.", "success");
  } catch (err) {
    console.error(err);
    showAlert("No se pudo registrar la tarea.", "danger");
  }
}

async function ensureSkulpt() {
  if (skulptReady) return true;
  await loadScript("https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js");
  await loadScript("https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js");
  skulptReady = true;
  return true;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const tag = document.createElement("script");
    tag.src = src;
    tag.onload = resolve;
    tag.onerror = reject;
    document.body.appendChild(tag);
  });
}

async function runPython(frame) {
  const code = document.getElementById("ws-editor-py")?.value || "";
  const output = [];
  const write = (text) => output.push(text);
  const builtinRead = (x) => {
    if (Sk.builtinFiles === undefined || Sk.builtinFiles["files"][x] === undefined) {
      throw `File not found: '${x}'`;
    }
    return Sk.builtinFiles["files"][x];
  };

  try {
    await ensureSkulpt();
    Sk.configure({ output: write, read: builtinRead });
    await Sk.misceval.asyncToPromise(() => Sk.importMainWithBody("<stdin>", false, code, true));
    const out = output.join("");
    frame.srcdoc = `<html><body style="background:#0b1221;color:#9cdcfe;font-family:Consolas,monospace;padding:12px;white-space:pre-wrap;">${escapeHtml(out)}</body></html>`;
  } catch (err) {
    frame.srcdoc = `<html><body style="background:#0b1221;color:#ff6b6b;font-family:Consolas,monospace;padding:12px;white-space:pre-wrap;">${escapeHtml(String(err))}</body></html>`;
  }
}

function updateCompleteButton() {
  const btn = document.getElementById("ws-complete-btn");
  if (!btn) return;
  btn.disabled = !(studentProfile && selectedTaskId);
}

function showAlert(msg, type = "success") {
  const box = document.getElementById("ws-alerts");
  if (!box) return;
  box.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
    ${msg}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>`;
}

function topicId(block) {
  return typeof block.topic === "object" ? block.topic?.id : block.topic;
}
function blockId(task) {
  const ref = task.block ?? task.block_detail;
  return typeof ref === "object" ? ref?.id : ref;
}

function toArray(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
}

function defaultSnippet(topic, block, task) {
  return {
    html: `<div class="card">
  <h3>${task?.title || "Ejercicio"}</h3>
  <p>${task?.instructions || ""}</p>
</div>`,
    css: `.card { background:#f1f5f9; padding:12px; border-radius:10px; font-family: system-ui; }`,
    js: `console.log('Ejecuta tu solucion aqui');`,
    py: `print("Hola desde Python")`,
  };
}

function applySnippets(task, topic, block) {
  const defaults = defaultSnippet(topic, block, task);
  const draft = loadDraft(task?.id);
  const values = {
    html: draft?.html ?? defaults.html,
    css: draft?.css ?? defaults.css,
    js: draft?.js ?? defaults.js,
    py: draft?.py ?? defaults.py,
  };
  setEditorValues(values, true);
  saveDraft(); // persist current state immediately
}

function setEditorValues(values, overwrite = false) {
  const htmlEl = document.getElementById("ws-editor-html");
  const cssEl = document.getElementById("ws-editor-css");
  const jsEl = document.getElementById("ws-editor-js");
  const pyEl = document.getElementById("ws-editor-py");
  if (htmlEl && (overwrite || !htmlEl.value)) htmlEl.value = values.html ?? "";
  if (cssEl && (overwrite || !cssEl.value)) cssEl.value = values.css ?? "";
  if (jsEl && (overwrite || !jsEl.value)) jsEl.value = values.js ?? "";
  if (pyEl && (overwrite || !pyEl.value)) pyEl.value = values.py ?? "";
}

function wireAutosave() {
  ["ws-editor-html", "ws-editor-css", "ws-editor-js", "ws-editor-py"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", saveDraft);
  });
}

function saveDraft() {
  if (!selectedTaskId) return;
  const payload = {
    html: document.getElementById("ws-editor-html")?.value || "",
    css: document.getElementById("ws-editor-css")?.value || "",
    js: document.getElementById("ws-editor-js")?.value || "",
    py: document.getElementById("ws-editor-py")?.value || "",
  };
  localStorage.setItem(`tm_workspace_draft_${selectedTaskId}`, JSON.stringify(payload));
}

function loadDraft(taskId) {
  if (!taskId) return null;
  try {
    const raw = localStorage.getItem(`tm_workspace_draft_${taskId}`);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return typeof data === "object" ? data : null;
  } catch {
    return null;
  }
}

function switchMode(mode) {
  editorMode = mode;
  const web = document.getElementById("ws-stack-web");
  const py = document.getElementById("ws-stack-py");
  if (web) web.classList.toggle("d-none", mode !== "web");
  if (py) py.classList.toggle("d-none", mode !== "python");
  if (mode === "web") {
    setActiveWebPane(activeWebPane);
  }
}

function wireWebTabs() {
  const tabs = document.querySelectorAll("#ws-web-tabs [data-pane]");
  tabs.forEach((btn) =>
    btn.addEventListener("click", () => {
      setActiveWebPane(btn.dataset.pane);
    })
  );
}

function setActiveWebPane(pane) {
  if (!pane) return;
  activeWebPane = pane;
  if (pane === "css" || pane === "js") lastCssJsPane = pane;
  document.querySelectorAll("#ws-web-tabs [data-pane]").forEach((b) =>
    b.classList.toggle("active", b.dataset.pane === pane)
  );
  showWebPane(pane);
  updateCycleLabel();
}

function showWebPane(pane) {
  document.querySelectorAll(".web-pane").forEach((paneEl) => {
    const isMatch = paneEl.dataset.pane === pane;
    paneEl.classList.toggle("d-none", !isMatch);
    paneEl.classList.toggle("active-pane", isMatch);
  });
}

function cycleWebPane() {
  const order = ["html", "css", "js"];
  const idx = order.indexOf(activeWebPane);
  const next = order[(idx + 1) % order.length];
  setActiveWebPane(next);
}

function updateCycleLabel() {
  const btn = document.getElementById("ws-cycle-editor");
  if (!btn) return;
  const order = ["html", "css", "js"];
  const next = order[(order.indexOf(activeWebPane) + 1) % order.length];
  const label = next === "html" ? "Cambiar a HTML" : next === "css" ? "Cambiar a CSS" : "Cambiar a JS";
  btn.textContent = label;
}

function escapeHtml(str) {
  return (str || "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }[m] || m));
}

function parseError(err) {
  if (!err?.message) return "";
  const idx = err.message.indexOf("{");
  if (idx === -1) return err.message;
  try {
    const json = JSON.parse(err.message.slice(idx));
    if (json.detail) return json.detail;
    return JSON.stringify(json);
  } catch {
    return err.message;
  }
}
