import { User } from "../../models/users/user.model.js";
import { UserService } from "../../services/users/user.service.js";

let users = [];
const service = new UserService();

export function init() {
  console.log("inicializando componente login");
  getUsers();
  setupLoginForm();
  setupRegisterForm();
  setupModeToggle();
  setMode("login");
}

function setupLoginForm() {
  const form = document.getElementById("login-form");
  const btn = document.getElementById("login-btn");
  const spinner = btn?.querySelector(".spinner-border");
  const label = btn?.querySelector(".btn-label");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    form.classList.add("was-validated");
    if (!form.checkValidity()) return;

    toggleLoading(btn, spinner, label, true);

    const username = form.username.value.trim();
    const match = users.find((u) => u.username === username);
    if (match) {
      localStorage.setItem("tm_user", JSON.stringify(match));
      window.dispatchEvent(new CustomEvent("tm:auth-changed", { detail: { user: match } }));
      showAlert("Bienvenido " + (match.first_name || match.username), "success");
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("tm:navigate", { detail: { page: "home" } }));
      }, 400);
    } else {
      showAlert("Usuario no encontrado en /api/users/", "danger");
    }

    toggleLoading(btn, spinner, label, false);
  });
}

function setupRegisterForm() {
  const form = document.getElementById("register-form");
  const btn = document.getElementById("register-btn");
  const spinner = btn?.querySelector(".spinner-border");
  const label = btn?.querySelector(".btn-label");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    form.classList.add("was-validated");
    if (!form.checkValidity()) return;

    toggleLoading(btn, spinner, label, true);
    const payload = {
      username: form.username.value.trim(),
      email: form.email.value.trim(),
      first_name: form.first_name.value.trim(),
      last_name: form.last_name.value.trim(),
      password: form.password.value,
    };

    try {
      const created = await service.insert(payload);
      users.push(new User(created));
      displayUsers();
      showAlert("Usuario creado. Ahora puedes iniciar sesión.", "success");
      setMode("login");
      form.reset();
      form.classList.remove("was-validated");
    } catch (err) {
      console.error(err);
      const msg = parseApiError(err) || "No se pudo crear el usuario";
      showAlert(msg, "danger");
    } finally {
      toggleLoading(btn, spinner, label, false);
    }
  });
}

function setupModeToggle() {
  const loginBtn = document.getElementById("btn-mode-login");
  const registerBtn = document.getElementById("btn-mode-register");
  loginBtn?.addEventListener("click", () => setMode("login"));
  registerBtn?.addEventListener("click", () => setMode("register"));
}

function setMode(mode) {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const loginBtn = document.getElementById("btn-mode-login");
  const registerBtn = document.getElementById("btn-mode-register");

  const isLogin = mode === "login";
  loginForm?.classList.toggle("d-none", !isLogin);
  registerForm?.classList.toggle("d-none", isLogin);

  if (loginBtn && registerBtn) {
    loginBtn.classList.toggle("btn-primary", isLogin);
    loginBtn.classList.toggle("btn-outline-primary", !isLogin);
    registerBtn.classList.toggle("btn-primary", !isLogin);
    registerBtn.classList.toggle("btn-outline-primary", isLogin);
  }
}

function getUsers() {
  service
    .getAll()
    .then((data) => {
      const raw = Array.isArray(data?.results) ? data.results : data;
      users = raw.map((userParams) => new User(userParams));
      displayUsers();
    })
    .catch((error) => {
      console.log(error);
      showAlert("No se pudieron cargar usuarios", "danger");
    });
}

function displayUsers() {
  const dataList = document.getElementById("user-list");
  if (!dataList) return;

  dataList.innerHTML = "";
  users.forEach((u) => {
    const option = document.createElement("option");
    option.value = u.username;
    option.label = `${u.username} (${u.email || "sin email"})`;
    dataList.appendChild(option);
  });
}

function toggleLoading(btn, spinner, label, isLoading) {
  if (!btn || !spinner || !label) return;
  btn.disabled = isLoading;
  spinner.classList.toggle("d-none", !isLoading);
  label.classList.toggle("d-none", isLoading);
}

function showAlert(message, type = "success") {
  const container = document.getElementById("login-alerts");
  if (!container) return;

  const alert = document.createElement("div");
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  container.innerHTML = "";
  container.appendChild(alert);

  setTimeout(() => alert.remove(), 3500);
}

function parseApiError(err) {
  if (!err?.message) return "";
  const idx = err.message.indexOf("{");
  if (idx === -1) return "";
  try {
    const json = JSON.parse(err.message.slice(idx));
    if (typeof json === "string") return json;
    return Object.entries(json)
      .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
      .join(" | ");
  } catch {
    return "";
  }
}
