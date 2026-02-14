# TaskMaster API

API REST para gestionar **temas de estudio**, **bloques**, **tareas de bloque** y el progreso de **estudiantes**. Es la capa de backend que servirá datos a un frontend y a futuros consumidores.

## A) Descripción corta

TaskMaster API organiza contenido educativo en temas → bloques → tareas. Permite exponer tareas listas para usarse, asignarlas a estudiantes y seguir su estado.

## B) Alcance (Scope) y Recursos (MVP)

Recursos principales del MVP:

### 1) Study Topics
Estructuran el plan de estudio.
- `GET /api/topics/` — listar temas
- `POST /api/topics/` — crear tema
- `GET /api/topics/{id}/` — detalle
- `PATCH /api/topics/{id}/` — actualizar

### 2) Study Blocks
Bloques secuenciales dentro de un tema.
- `GET /api/blocks/` — listar bloques
- `POST /api/blocks/` — crear bloque
- `GET /api/blocks/{id}/` — detalle
- `PATCH /api/blocks/{id}/` — actualizar

### 3) Block Tasks
Tareas concretas dentro de un bloque.
- `GET /api/block-tasks/` — listar tareas de bloque
- `POST /api/block-tasks/` — crear tarea
- `GET /api/block-tasks/{id}/` — detalle
- `PATCH /api/block-tasks/{id}/` — actualizar

### 4) Students & Progress
Gestión de estudiantes y su avance.
- `GET /api/students/` — listar/crear estudiantes
- `GET /api/student-task-progress/` — ver/crear progreso por tarea
- `PATCH /api/student-task-progress/{id}/` — actualizar estado (pending, in_progress, completed)

### 5) Users (auth_user)
CRUD básico sobre el usuario Django por defecto.
- `GET /api/users/` — listar usuarios
- `POST /api/users/` — crear usuario
- `GET /api/users/{id}/` — detalle
- `PATCH /api/users/{id}/` — actualizar

## C) Reglas de negocio (iniciales)

- Un bloque siempre pertenece a un tema y su número (`number`) es único dentro del tema.
- Una tarea siempre pertenece a un bloque y su `order` es único dentro del bloque.
- Estados de tarea de bloque: `available`, `archived`.
- Estados de progreso de estudiante: `pending`, `in_progress`, `completed`.
- Un estudiante solo puede tener un registro de progreso por tarea (`unique_together student + task`).

## D) Contrato preliminar (ejemplos)

### Endpoint — Crear tarea de bloque

**Request**
```http
POST /api/block-tasks/
Content-Type: application/json

{
  "block": 1,
  "title": "Resolver 5 ejercicios de listas",
  "instructions": "Usa comprensión de listas y documenta tu solución.",
  "estimated_minutes": 20,
  "order": 1
}
```

**Response (201 Created)**
```json
{
  "id": 10,
  "block": 1,
  "title": "Resolver 5 ejercicios de listas",
  "instructions": "Usa comprensión de listas y documenta tu solución.",
  "resources": null,
  "estimated_minutes": 20,
  "order": 1,
  "status": "available",
  "created_at": "2026-02-14T05:40:00Z",
  "updated_at": "2026-02-14T05:40:00Z"
}
```

### Endpoint — Registrar progreso de estudiante

**Request**
```http
POST /api/student-task-progress/
Content-Type: application/json

{
  "student": 3,
  "task": 10,
  "status": "in_progress"
}
```

**Response (201 Created)**
```json
{
  "id": 42,
  "student": 3,
  "task": 10,
  "status": "in_progress",
  "started_at": null,
  "completed_at": null,
  "notes": "",
  "task_detail": {
    "id": 10,
    "block": 1,
    "title": "Resolver 5 ejercicios de listas",
    "instructions": "Usa comprensión de listas y documenta tu solución.",
    "resources": null,
    "estimated_minutes": 20,
    "order": 1,
    "status": "available",
    "created_at": "2026-02-14T05:40:00Z",
    "updated_at": "2026-02-14T05:40:00Z"
  }
}
```

## E) Instalación y ejecución local

Este proyecto usa **Python + virtual environment (venv)**.

### Requisitos
- Python 3.11+ recomendado
- pip

### 1. Crear y activar el virtual environment

macOS / Linux:
```bash
python3 -m venv .venv
source .venv/bin/activate
```
Windows (PowerShell):
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
python3 manage.py migrate
```

### 4. Correr el servidor
```bash
python3 manage.py runserver
```

Servidor local:
- API base DRF: `http://127.0.0.1:8000/api/`
- Swagger UI: `http://127.0.0.1:8000/api/swagger/`
- ReDoc: `http://127.0.0.1:8000/api/redoc/`
- Health: `http://127.0.0.1:8000/api/health/`

Notas:
- Se usa SQLite en desarrollo.
- No subas `.env` ni credenciales reales al repositorio.

## F) Tecnologías elegidas

- Framework: Django + Django REST Framework (DRF)
- Documentación: drf-spectacular (OpenAPI/Swagger)
- Base de datos dev: SQLite (sugerida a futuro: PostgreSQL)

---

## Actividad 2.1 — Documentación técnica: rutas y controladores

### A) Estructura y responsabilidades

- `api/config/urls.py`: enrutado global.
- `api/health/views.py`, `api/health/urls.py`: healthcheck `GET /api/health/`.
- `api/tasks/models.py`: `StudyTopic`, `StudyBlock`, `BlockTask`.
- `api/tasks/serializers.py`: serializers para topics, blocks y block-tasks.
- `api/tasks/views.py`: viewsets `StudyTopicViewSet`, `StudyBlockViewSet`, `BlockTaskViewSet`.
- `api/tasks/urls.py`: router DRF para `/topics/`, `/blocks/`, `/block-tasks/`.
- `api/users/models.py`: `Student`, `StudentTaskProgress`.
- `api/users/serializers.py`: serializers de usuario, estudiante y progreso.
- `api/users/views.py`: viewsets `UserViewSet`, `StudentViewSet`, `StudentTaskProgressViewSet`.
- `api/users/urls.py`: router DRF para `/users/`, `/students/`, `/student-task-progress/`.

Separación aplicada:
- Rutas en `*/urls.py`.
- Lógica/controladores en `*/views.py`.
- Transformación/validación en `*/serializers.py`.
- Estructura de datos en `*/models.py`.

### B) Paso a paso técnico

1) Definir modelos por recurso (topics, blocks, block-tasks, students, progress).  
2) Crear serializers DRF por recurso.  
3) Implementar viewsets para CRUD + filtros/búsqueda.  
4) Registrar rutas con `DefaultRouter()` en cada app y agregarlas en `config/urls.py`.  
5) Generar y aplicar migraciones: `python3 manage.py makemigrations && python3 manage.py migrate`.  
6) Documentar con drf-spectacular (Swagger/ReDoc) y probar en `/api/swagger/` o `/api/redoc/`.

### C) Endpoints implementados (mínimo)

1) Healthcheck  
- Método: `GET`  
- Ruta: `/api/health/`

2) Study Topics  
- `GET /api/topics/`  
- `POST /api/topics/`  
- `GET /api/topics/{id}/`  
- `PATCH /api/topics/{id}/`

3) Study Blocks  
- `GET /api/blocks/`  
- `POST /api/blocks/`  
- `GET /api/blocks/{id}/`  
- `PATCH /api/blocks/{id}/`

4) Block Tasks  
- `GET /api/block-tasks/`  
- `POST /api/block-tasks/`  
- `GET /api/block-tasks/{id}/`  
- `PATCH /api/block-tasks/{id}/`

5) Students  
- `GET /api/students/`  
- `POST /api/students/`  
- `GET /api/students/{id}/`  
- `PATCH /api/students/{id}/`

6) Student Task Progress  
- `GET /api/student-task-progress/`  
- `POST /api/student-task-progress/`  
- `PATCH /api/student-task-progress/{id}/`
