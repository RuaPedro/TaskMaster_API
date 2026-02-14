import { UserService } from "../../services/users/user.service.js";
import { User } from "../../models/users/user.model.js";

let users = [];
let createModal;
let editModal;
let deleteModal;

const userService = new UserService();

export function init() {
  const createEl = document.getElementById("userCreateModal");
  const editEl = document.getElementById("userEditModal");
  const deleteEl = document.getElementById("userDeleteModal");

  createModal = createEl ? new bootstrap.Modal(createEl) : null;
  editModal = editEl ? new bootstrap.Modal(editEl) : null;
  deleteModal = deleteEl ? new bootstrap.Modal(deleteEl) : null;

  bindForms();
  bindTableActions();
  loadUsers();
}

function bindForms() {
  const createForm = document.getElementById("user-create-form");
  const editForm = document.getElementById("user-edit-form");
  const deleteBtn = document.getElementById("user-delete-confirm");

  if (createForm) {
    createForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      createForm.classList.add("was-validated");
      if (!createForm.checkValidity()) return;

      const payload = formToUser(createForm);
      await userService.insert(payload);
      createForm.reset();
      createForm.classList.remove("was-validated");
      createModal?.hide();
      showAlert("Usuario creado");
      loadUsers();
    });
  }

  if (editForm) {
    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      editForm.classList.add("was-validated");
      if (!editForm.checkValidity()) return;

      const payload = formToUser(editForm);
      payload.id = Number(editForm.id.value);
      if (!payload.password) delete payload.password; // no cambiar si viene vacío
      await userService.update(payload);
      editModal?.hide();
      showAlert("Usuario actualizado");
      loadUsers();
    });
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      const id = Number(document.getElementById("user-delete-id").value);
      if (!id) return;
      await userService.delete(id);
      deleteModal?.hide();
      showAlert("Usuario eliminado", "warning");
      loadUsers();
    });
  }
}

function bindTableActions() {
  const tbody = document.querySelector("#users-table tbody");
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

async function loadUsers() {
  const tbody = document.querySelector("#users-table tbody");
  if (tbody) tbody.innerHTML = `<tr><td colspan="7">Cargando...</td></tr>`;
  try {
    const data = await userService.getAll();
    const raw = Array.isArray(data?.results) ? data.results : data;
    users = raw.map((u) => new User(u));
    renderTable();
  } catch (err) {
    console.error(err);
    showAlert("No se pudieron cargar usuarios", "danger");
  }
}

function renderTable() {
  const tbody = document.querySelector("#users-table tbody");
  if (!tbody) return;

  if (!users.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">Sin registros</td></tr>`;
    return;
  }

  tbody.innerHTML = users
    .map((u) => {
      return `
        <tr>
          <td>${u.id ?? ""}</td>
          <td>${u.username}</td>
          <td>${u.email || "-"}</td>
          <td>${fullName(u)}</td>
          <td>${u.is_staff ? "Sí" : "No"}</td>
          <td>${u.is_superuser ? "Sí" : "No"}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary me-2" data-action="edit" data-id="${u.id}">Editar</button>
            <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${u.id}">Borrar</button>
          </td>
        </tr>`;
    })
    .join("");
}

function openEdit(id) {
  const user = users.find((u) => u.id === id);
  const form = document.getElementById("user-edit-form");
  if (!user || !form) return;
  form.id.value = user.id;
  form.username.value = user.username;
  form.email.value = user.email || "";
  form.first_name.value = user.first_name || "";
  form.last_name.value = user.last_name || "";
  form.password.value = "";
  form.is_staff.checked = Boolean(user.is_staff);
  form.is_superuser.checked = Boolean(user.is_superuser);
  form.is_active.checked = user.is_active !== false;
  editModal?.show();
}

function openDelete(id) {
  const input = document.getElementById("user-delete-id");
  if (!input) return;
  input.value = id;
  deleteModal?.show();
}

function formToUser(form) {
  return {
    username: form.username.value.trim(),
    email: form.email.value.trim(),
    first_name: form.first_name.value.trim(),
    last_name: form.last_name.value.trim(),
    password: form.password.value,
    is_staff: form.is_staff.checked,
    is_superuser: form.is_superuser.checked,
    is_active: form.is_active.checked,
  };
}

function fullName(user) {
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return name || "-";
}

function showAlert(message, type = "success") {
  const box = document.getElementById("users-alert");
  if (!box) return;
  box.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>`;
}
