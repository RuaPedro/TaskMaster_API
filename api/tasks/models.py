from django.conf import settings
from django.db import models


class Project(models.Model):
    name = models.CharField(
        max_length=120,
        unique=True,
        help_text="Nombre del proyecto",
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text="Descripcion del proyecto",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Fecha de creacion del proyecto",
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Fecha de ultima actualizacion",
    )

    class Meta:
        verbose_name = "Proyecto"
        verbose_name_plural = "Proyectos"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.name


class Tag(models.Model):
    name = models.CharField(
        max_length=50,
        unique=True,
        help_text="Nombre unico de la etiqueta",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Fecha de creacion de la etiqueta",
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Fecha de ultima actualizacion",
    )

    class Meta:
        verbose_name = "Etiqueta"
        verbose_name_plural = "Etiquetas"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class Task(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pendiente"
        IN_PROGRESS = "in_progress", "En progreso"
        COMPLETED = "completed", "Completada"
        ARCHIVED = "archived", "Archivada"

    class Priority(models.TextChoices):
        LOW = "low", "Baja"
        MEDIUM = "medium", "Media"
        HIGH = "high", "Alta"
        CRITICAL = "critical", "Critica"

    title = models.CharField(
        max_length=200,
        help_text="Titulo descriptivo de la tarea",
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text="Descripcion detallada de la tarea",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        help_text="Estado actual de la tarea",
    )
    priority = models.CharField(
        max_length=10,
        choices=Priority.choices,
        default=Priority.MEDIUM,
        help_text="Nivel de prioridad de la tarea",
    )
    due_date = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Fecha limite para completar la tarea",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Fecha de creacion de la tarea",
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Fecha de ultima actualizacion",
    )
    completed_at = models.DateTimeField(
        blank=True,
        null=True,
        help_text="Fecha en que se completo la tarea",
    )
    is_locked = models.BooleanField(
        default=False,
        help_text="Si es True, la tarea no puede ser modificada",
    )
    tags = models.CharField(
        max_length=500,
        blank=True,
        help_text="Etiquetas separadas por comas (ej: bug,urgent,backend)",
    )

    project = models.ForeignKey(
        Project,
        on_delete=models.SET_NULL,
        related_name="tasks",
        blank=True,
        null=True,
        help_text="Proyecto al que pertenece la tarea",
    )
    created_by = models.ForeignKey(
        "auth.User",
        on_delete=models.PROTECT,
        related_name="tasks_created",
        help_text="Usuario que creo la tarea",
    )
    assigned_to = models.ForeignKey(
        "auth.User",
        on_delete=models.SET_NULL,
        related_name="tasks_assigned",
        blank=True,
        null=True,
        help_text="Usuario asignado a la tarea",
    )

    class Meta:
        verbose_name = "Tarea"
        verbose_name_plural = "Tareas"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["assigned_to"]),
            models.Index(fields=["created_by"]),
            models.Index(fields=["priority"]),
        ]

    def __str__(self) -> str:
        return self.title


class TaskTag(models.Model):
    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="task_tags",
        help_text="Tarea asociada",
    )
    tag = models.ForeignKey(
        Tag,
        on_delete=models.CASCADE,
        related_name="task_tags",
        help_text="Etiqueta asociada",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Fecha de creacion de la relacion",
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Fecha de ultima actualizacion",
    )

    class Meta:
        verbose_name = "Relacion Tarea-Etiqueta"
        verbose_name_plural = "Relaciones Tarea-Etiqueta"
        constraints = [
            models.UniqueConstraint(
                fields=["task", "tag"],
                name="unique_task_tag",
            )
        ]

    def __str__(self) -> str:
        return f"{self.task_id}:{self.tag_id}"
