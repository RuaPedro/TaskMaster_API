import { init as loginInit } from "../pages/login/login.js";
import { init as homeInit } from "../pages/home/home.js";
import { init as usersInit } from "../pages/users/users.js";
import { init as studentsInit } from "../pages/students/students.js";
import { init as progressInit } from "../pages/progress/progress.js";
import { init as topicsInit } from "../pages/topics/topics.js";
import { init as blocksInit } from "../pages/blocks/blocks.js";
import { init as tasksInit } from "../pages/tasks/tasks.js";

const PAGES = {
  login:   { label: "Login",     path: "pages/login/login.html",     init: loginInit,    requiresAuth: false },
  home:    { label: "Home",      path: "pages/home/home.html",       init: homeInit,     requiresAuth: true },
  topics:  { label: "Temas",     path: "pages/topics/topics.html",   init: topicsInit,   requiresAuth: true },
  blocks:  { label: "Bloques",   path: "pages/blocks/blocks.html",   init: blocksInit,   requiresAuth: true },
  tasks:   { label: "Tareas",    path: "pages/tasks/tasks.html",     init: tasksInit,    requiresAuth: true },
  students:{ label: "Estudiantes",path: "pages/students/students.html", init: studentsInit, requiresAuth: true },
  progress:{ label: "Progreso",  path: "pages/progress/progress.html", init: progressInit, requiresAuth: true },
  users:   { label: "Usuarios",  path: "pages/users/users.html",     init: usersInit,    requiresAuth: true },
};

let currentPage = "login";

export function init() {
  console.log("inicializando la navegacion");
  refreshNav();
  displayPage(isLoggedIn() ? "home" : "login");

  window.addEventListener("tm:navigate", (e) => {
    const target = e.detail?.page || "login";
    displayPage(target);
    refreshNav();
  });

  window.addEventListener("tm:auth-changed", () => {
    refreshNav();
    displayPage(isLoggedIn() ? "home" : "login");
  });
}

function refreshNav() {
  buildNav();
}

function buildNav() {
  const nav = document.getElementById("app-nav");
  if (!nav) return;

  const logged = isLoggedIn();
  nav.innerHTML = "";

  const left = document.createElement("div");
  left.className = "d-flex gap-2";

  const right = document.createElement("div");
  right.className = "ms-auto";

  const order = ["home", "topics", "blocks", "tasks", "students", "progress", "users"];
  if (logged) {
    order.forEach((key) => {
      const page = PAGES[key];
      if (!page) return;
      const link = document.createElement("a");
      link.href = "#";
      link.textContent = page.label;
      link.className = "nav-link d-inline-block";
      link.addEventListener("click", (e) => {
        e.preventDefault();
        displayPage(key);
      });
      left.appendChild(link);
    });
  }

  const authBtn = document.createElement("button");
  authBtn.id = "auth-btn";
  authBtn.className = "btn btn-outline-primary btn-sm";
  authBtn.addEventListener("click", handleAuthClick);
  updateAuthButton(authBtn);

  nav.appendChild(left);
  nav.appendChild(right);
  right.appendChild(authBtn);
}

function updateAuthButton(btn) {
  btn.textContent = isLoggedIn() ? "Logout" : "Login";
}

async function displayPage(pageKey) {
  const logged = isLoggedIn();
  const page = PAGES[pageKey];
  const fallback = logged ? "home" : "login";
  if (!page || (page.requiresAuth && !logged)) {
    if (pageKey !== fallback) return displayPage(fallback);
    return;
  }

  const main = document.getElementById("app-content");
  if (!main) return;

  try {
    const response = await fetch(page.path);
    const html = await response.text();

    const temp = document.createElement("div");
    temp.innerHTML = html;
    const template = temp.querySelector("template");
    if (!template) throw new Error(`No se encontró <template> en ${page.path}`);

    main.innerHTML = "";
    main.appendChild(template.content.cloneNode(true));

    currentPage = pageKey;
    if (typeof page.init === "function") page.init();
  } catch (err) {
    console.error(err);
    main.innerHTML = `<div class="alert alert-danger">No se pudo cargar la pagina ${pageKey}</div>`;
  }
}

function handleAuthClick(e) {
  const logged = isLoggedIn();
  if (logged) {
    localStorage.removeItem("tm_user");
    window.dispatchEvent(new Event("tm:auth-changed"));
  } else {
    displayPage("login");
  }
  updateAuthButton(e.currentTarget);
}

function isLoggedIn() {
  return Boolean(localStorage.getItem("tm_user"));
}
