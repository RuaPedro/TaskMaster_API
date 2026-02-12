# TaskMaster API

API REST para gestionar **usuarios** y **tareas**. Esta API es la parte “maestra” del proyecto de backend y está pensada para conectarse más adelante con otra API llamada **TaskRunner API**.

El problema que resuelve es simple y real: llevar el control de quiénes son los usuarios del sistema y qué tareas existen, quién las crea y a quién se asignan.

## A) Descripción corta

TaskMaster API centraliza la información base del dominio: usuarios y tareas. En esta etapa inicial, el objetivo es tener una base clara, documentada y fácil de correr en local.

## B) Alcance (Scope) y Recursos (MVP)

Recursos principales del MVP:

### 1) Users
Operaciones REST planeadas:
- `GET /api/users/` — listar usuarios
- `POST /api/users/` — crear usuario
- `GET /api/users/{id}/` — ver detalle de usuario
- `PATCH /api/users/{id}/` — actualizar parcialmente un usuario

### 2) Tasks
Operaciones REST planeadas:
- `GET /api/tasks/` — listar tareas
- `POST /api/tasks/` — crear tarea
- `GET /api/tasks/{id}/` — ver detalle de tarea
- `PATCH /api/tasks/{id}/` — actualizar estado/prioridad/asignación

Nota: por ahora el MVP se enfoca solo en **users** y **tasks**.

## C) Reglas de negocio (iniciales)

Estas reglas están definidas para el MVP y pueden evolucionar:

- Una tarea siempre debe tener `title`.
- Toda tarea debe tener un `created_by` válido (un usuario existente).
- `assigned_to` es opcional, pero si se envía debe ser un usuario existente.
- Los estados válidos de una tarea son: `pending`, `in_progress`, `completed`, `archived`.
- Una tarea archivada (`archived`) no debería volver a estados anteriores.
- Si una tarea está bloqueada (`is_locked = true`), no debe poder editarse.

## D) Contrato preliminar (simple)

A continuación se muestran endpoints propuestos y ejemplos JSON *mock* (todavía pueden cambiar).

### Endpoint 1 — Crear tarea

**Request**

```http
POST /api/tasks/
Content-Type: application/json

{
  "title": "Preparar demo",
  "description": "Armar un ejemplo mínimo para la clase",
  "created_by": 1,
  "assigned_to": 2,
  "priority": "medium",
  "status": "pending"
}
```

**Response (201 Created)**

```json
{
  "id": 10,
  "title": "Preparar demo",
  "description": "Armar un ejemplo mínimo para la clase",
  "created_by": 1,
  "assigned_to": 2,
  "priority": "medium",
  "status": "pending",
  "is_locked": false,
  "created_at": "2026-01-27T05:00:00Z",
  "updated_at": "2026-01-27T05:00:00Z"
}
```

### Endpoint 2 — Listar tareas

**Request**

```http
GET /api/tasks/?status=pending&assigned_to=2
```

**Response (200 OK)**

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 10,
      "title": "Preparar demo",
      "priority": "medium",
      "status": "pending",
      "created_by": 1,
      "assigned_to": 2
    }
  ]
}
```

## E) Instalación y ejecución local (OBLIGATORIO)

Este proyecto usa **Python + virtual environment (venv)**.

### Requisitos
- Python 3.11+ recomendado
- pip

### 1. Crear y activar el virtual environment

En macOS / Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

En Windows (PowerShell):

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

### 2. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 3. Ejecutar migraciones

```bash
cd api
python manage.py migrate
```

### 4. Correr el servidor

```bash
python manage.py runserver
```

Servidor local:
- API base DRF: `http://127.0.0.1:8000/api/`
- Swagger UI: `http://127.0.0.1:8000/api/swagger/`
- ReDoc: `http://127.0.0.1:8000/api/redoc/`
- Heath: `http://127.0.0.1:8000/api/health/`

Nota importante sobre secretos:
- No subas `.env` ni credenciales reales al repositorio.
- En esta etapa inicial se usa SQLite y configuración local.

## F) Tecnologías elegidas

Stack seleccionado y justificación breve:

- Framework: Django + Django REST Framework.
  Razón: estructura sólida tipo industria, autenticación y permisos robustos, buen ecosistema.
- Lenguaje/runtime: Python.
  Razón: velocidad de desarrollo y claridad.
- Documentación: drf-spectacular (OpenAPI/Swagger).
  Razón: documentación automática desde el código.
- Base de datos (actual): SQLite.
  Base de datos (sugerida a futuro): PostgreSQL.

---

Este README está pensado como versión inicial. El contrato y las reglas pueden ajustarse conforme se implementen los endpoints.

## Actividad 2.1 — Documentacion tecnica: rutas y controladores

Esta seccion documenta la configuracion tecnica minima de **rutas (endpoints)** y **controladores** usando Django REST Framework (DRF) con ViewSets y routers.

### A) Estructura y responsabilidades

Estructura relevante del proyecto:
- `api/config/urls.py`: rutas principales del proyecto (registro global).
- `api/health/views.py`: controlador simple para `GET /api/health/`.
- `api/health/urls.py`: rutas del recurso health.
- `api/users/models.py`: modelo `UserProfile`.
- `api/users/serializers.py`: serializer de usuarios.
- `api/users/views.py`: controlador `UserViewSet`.
- `api/users/urls.py`: router DRF para usuarios.
- `api/tasks/models.py`: modelo `Task`.
- `api/tasks/serializers.py`: serializer de tareas.
- `api/tasks/views.py`: controlador `TaskViewSet`.
- `api/tasks/urls.py`: router DRF para tareas.

Separacion aplicada:
- Rutas en `*/urls.py`.
- Logica/controladores en `*/views.py`.
- Transformacion/validacion en `*/serializers.py`.
- Estructura de datos en `*/models.py`.

### B) Paso a paso tecnico (mini tutorial)

1. Se definieron los modelos base por recurso:
   `UserProfile` en `api/users/models.py` y `Task` en `api/tasks/models.py`.
2. Se crearon serializers DRF por recurso:
   `UserSerializer` y `TaskSerializer`.
3. Se implementaron controladores con DRF ViewSets:
   `UserViewSet` y `TaskViewSet` en `api/users/views.py` y `api/tasks/views.py`.
4. Se registraron rutas con routers DRF:
   `DefaultRouter()` en `api/users/urls.py` y `api/tasks/urls.py`.
5. Se conectaron todas las rutas en el registro global:
   `api/config/urls.py` incluye:
   - `path("api/health", include("health.urls"))`
   - `path("api/", include("users.urls"))`
   - `path("api/", include("tasks.urls"))`

### C) Endpoints implementados (minimo requerido)

1) Healthcheck
- Metodo: `GET`
- Ruta: `/api/health/`
- Que hace: confirma que la API responde.
- Respuesta JSON ejemplo:

```json
{
  "status": "ok",
  "service": "taskmaster-api",
}
```

2) Listar usuarios
- Metodo: `GET`
- Ruta: `/api/users/`
- Que hace: devuelve la lista de usuarios.
- Respuesta JSON ejemplo (estructura DRF):

```json
{
  "count": 0,
  "next": null,
  "previous": null,
  "results": []
}
```

3) Crear tarea
- Metodo: `POST`
- Ruta: `/api/tasks/`
- Que hace: crea una tarea nueva.
- Request JSON ejemplo:

```json
{
  "title": "Primera tarea",
  "created_by": 1,
  "priority": "medium",
  "status": "pending"
}
```

- Response JSON ejemplo (201 Created):

```json
{
  "id": 1,
  "title": "Primera tarea",
  "status": "pending",
  "priority": "medium",
  "created_by": 1,
  "assigned_to": null,
  "is_locked": false
}
```

### D) Como probar los endpoints

1. Levantar el servidor (desde `api/`):

```bash
python3 manage.py migrate
python3 manage.py runserver
```

2. URL base local:
- `http://127.0.0.1:8000`

3. Pruebas rapidas con curl:

Ping:

```bash
curl -i http://127.0.0.1:8000/api/ping/
```

Listar usuarios:

```bash
curl -i http://127.0.0.1:8000/api/users/
```

Crear tarea:

```bash
curl -i -X POST http://127.0.0.1:8000/api/tasks/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Primera tarea",
    "created_by": 1,
    "priority": "medium",
    "status": "pending"
  }'
```

Tip: tambien puedes usar Swagger UI en:
- `http://127.0.0.1:8000/api/schema/swagger-ui/`

