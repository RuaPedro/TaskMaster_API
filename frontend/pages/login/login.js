import { User } from "../../models/user.model.js";
import { UserService } from "../../services/user.service.js";

let users = [];

export function init() {
    console.log('inicializando componente login');
    getUsers();
    setupForm();
}

function setupForm() {
    const form = document.getElementById('login-form');
    const btn = document.getElementById('login-btn');
    const spinner = btn?.querySelector('.spinner-border');
    const label = btn?.querySelector('.btn-label');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        form.classList.add('was-validated');
        if (!form.checkValidity()) return;

        toggleLoading(btn, spinner, label, true);

        const username = form.username.value.trim();
        const password = form.password.value; // no se valida contra el backend en este demo

        const match = users.find(u => u.username === username);
        if (match) {
            localStorage.setItem('tm_user', JSON.stringify(match));
            showAlert('Bienvenido ' + (match.first_name || match.username), 'success');
            // Navegar a home después de un pequeño delay para ver el mensaje
            setTimeout(() => {
                window.dispatchEvent(new CustomEvent('tm:navigate', { detail: { page: 'home' } }));
            }, 400);
        } else {
            showAlert('Usuario no encontrado en /api/users/', 'danger');
        }

        toggleLoading(btn, spinner, label, false);
    });
}

function getUsers() {
    const service = new UserService();

    service.getAll()
        .then(data => {
            // API puede devolver .results (paginado) o lista simple
            const raw = Array.isArray(data?.results) ? data.results : data;
            users = raw.map(userParams => new User(userParams));
            displayUsers();
        }).catch(error => {
            console.log(error);
            showAlert('Unexpected error. Please try later', 'danger');
        });
}

function displayUsers() {
    const dataList = document.getElementById('user-list');
    if (!dataList) return;

    dataList.innerHTML = '';
    users.forEach(u => {
        const option = document.createElement('option');
        option.value = u.username;
        option.label = `${u.username} (${u.email || 'sin email'})`;
        dataList.appendChild(option);
    });
}

function toggleLoading(btn, spinner, label, isLoading) {
    if (!btn || !spinner || !label) return;
    btn.disabled = isLoading;
    spinner.classList.toggle('d-none', !isLoading);
    label.classList.toggle('d-none', isLoading);
}

function showAlert(message, type = 'success') {
    const container = document.getElementById('login-alerts');
    if (!container) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    container.innerHTML = '';
    container.appendChild(alert);

    setTimeout(() => alert.remove(), 3500);
}
