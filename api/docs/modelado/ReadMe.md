# Modelado del dominio — TaskMaster API

Este directorio contiene los diagramas de modelado del proyecto basados en los modelos actuales.

- DER: `DER.mmd`
- UML de Clases: `UML_Clases.mmd`

## Explicacion breve del dominio

TaskMaster API resuelve la necesidad basica de **gestionar usuarios, proyectos y tareas** en un equipo. Permite registrar a los usuarios del sistema, agrupar tareas por proyecto y administrar tareas con su estado, prioridad, fechas y etiquetas.

## Decisiones clave

- Se usa una entidad **CustomUser** para centralizar la informacion del usuario (nombre, contacto, departamento) y servir como referencia en las tareas.
- La entidad principal del negocio es **Task**, que modela el ciclo de vida de una tarea (status, prioridad, fechas, bloqueo).
- Se agrego **Project** para agrupar tareas de forma simple.
- Se agrego **Tag** y una entidad puente **TaskTag** para cumplir la relacion N–N.
- Se definieron dos relaciones 1–N desde usuario hacia tareas:
  - `created_by`: un usuario puede crear muchas tareas.
  - `assigned_to`: un usuario puede tener muchas tareas asignadas.
- Se incluyeron campos de auditoria (`created_at`, `updated_at`) para trazabilidad en ambos modelos.
- Se usan enums (status y priority) para controlar valores validos y mantener consistencia.

## Supuestos (assumptions)

- Un usuario puede existir sin tareas creadas o asignadas.
- Una tarea siempre tiene **created_by** definido; **assigned_to** es opcional.
- No se modelan autenticacion ni permisos en esta etapa.
- Un proyecto puede no tener tareas al inicio.
- Una tarea puede no tener proyecto ni etiquetas.
