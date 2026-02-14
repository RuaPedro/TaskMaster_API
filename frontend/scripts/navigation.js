import { init as loginInit } from "../pages/login/login.js";
import { init as homeInit } from "../pages/home/home.js";

// Tabla de páginas con su template y función init
const PAGES = {
  login: { label: "Login", path: "pages/login/login.html", init: loginInit },
  home: { label: "Home", path: "pages/home/home.html", init: homeInit },
};

let currentPage = "login";

export function init() {
  console.log("inicializando la navegación");
  buildNav();              // pinta el navbar
  displayPage("login");    // arranca en login
  window.addEventListener("tm:navigate", (e) => {
    const target = e.detail?.page || "login";
    displayPage(target);   // navegación (ej. desde login)
    const authBtn = document.getElementById("auth-btn");
    if (authBtn) updateAuthButton(authBtn);
  });
}

function buildNav() {
  const nav = document.getElementById("app-nav");
  if (!nav) return;

  nav.innerHTML = "";

  const left = document.createElement("div");
  left.className = "d-flex gap-2";

  const right = document.createElement("div");
  right.className = "ms-auto";

  // Enlaces a la izquierda (por ahora solo Home)
  ["home"].forEach((key) => {
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

  // Botón de login/logout a la derecha
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
  const logged = Boolean(localStorage.getItem("tm_user"));
  btn.textContent = logged ? "Logout" : "Login";
}

async function displayPage(pageKey) {
  const page = PAGES[pageKey];
  if (!page) return;

  const main = document.getElementById("app-content");
  if (!main) return;

  try {
    const response = await fetch(page.path);      // carga el template HTML
    const html = await response.text();

    const temp = document.createElement("div");
    temp.innerHTML = html;
    const template = temp.querySelector("template");
    if (!template) throw new Error(`No se encontró <template> en ${page.path}`);

    main.innerHTML = "";
    main.appendChild(template.content.cloneNode(true)); // inserta contenido

    currentPage = pageKey;
    if (typeof page.init === "function") page.init();   // inicializa JS de la página
  } catch (err) {
    console.error(err);
    main.innerHTML = `<div class="alert alert-danger">No se pudo cargar la página ${pageKey}</div>`;
  }
}

function handleAuthClick(e) {
  const logged = Boolean(localStorage.getItem("tm_user"));
  if (logged) {
    localStorage.removeItem("tm_user");  // logout
    updateAuthButton(e.currentTarget);
    displayPage("login");
  } else {
    displayPage("login");                // ir a login si no hay sesión
  }
  updateAuthButton(e.currentTarget);
}
