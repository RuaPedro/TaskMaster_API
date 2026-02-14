from django.conf import settings
from django.db import models


class StudyTopic(models.Model):
    """Tema general de estudio (ej. Python Básico, Álgebra)."""

    class Difficulty(models.TextChoices):
        BEGINNER = "beginner", "Principiante"
        INTERMEDIATE = "intermediate", "Intermedio"
        ADVANCED = "advanced", "Avanzado"

    name = models.CharField(max_length=120, unique=True, help_text="Nombre del tema de estudio")
    description = models.TextField(blank=True, help_text="Descripción breve del tema")
    difficulty = models.CharField(
        max_length=15,
        choices=Difficulty.choices,
        default=Difficulty.BEGINNER,
        help_text="Nivel sugerido de dificultad",
    )
    is_active = models.BooleanField(default=True, help_text="Permite ocultar un tema sin borrarlo")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Tema de estudio"
        verbose_name_plural = "Temas de estudio"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class StudyBlock(models.Model):
    """Bloque secuencial dentro de un tema."""

    topic = models.ForeignKey(
        StudyTopic,
        on_delete=models.CASCADE,
        related_name="blocks",
        help_text="Tema al que pertenece el bloque",
    )
    number = models.PositiveSmallIntegerField(help_text="Orden dentro del tema (1, 2, 3...).")
    title = models.CharField(max_length=120, help_text="Título del bloque")
    description = models.TextField(blank=True, help_text="Descripción del bloque")
    estimated_minutes = models.PositiveSmallIntegerField(default=30, help_text="Tiempo estimado de estudio")
    is_published = models.BooleanField(default=True, help_text="Si es falso, el bloque no se expone")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Bloque"
        verbose_name_plural = "Bloques"
        ordering = ["topic", "number"]
        unique_together = ("topic", "number")
        indexes = [
            models.Index(fields=["topic", "number"]),
        ]

    def __str__(self) -> str:
        return f"{self.topic.name} · Bloque {self.number}"


class BlockTask(models.Model):
    """Tarea concreta dentro de un bloque."""

    class Status(models.TextChoices):
        AVAILABLE = "available", "Disponible"
        ARCHIVED = "archived", "Archivada"

    block = models.ForeignKey(
        StudyBlock,
        on_delete=models.CASCADE,
        related_name="tasks",
        help_text="Bloque al que pertenece la tarea",
    )
    title = models.CharField(max_length=200, help_text="Título de la tarea")
    instructions = models.TextField(help_text="Instrucciones de la tarea")
    resources = models.JSONField(
        blank=True,
        null=True,
        help_text="Lista o diccionario de recursos (links, IDs de material, etc.)",
    )
    estimated_minutes = models.PositiveSmallIntegerField(default=15, help_text="Tiempo estimado para completar")
    order = models.PositiveSmallIntegerField(default=1, help_text="Posición dentro del bloque")
    status = models.CharField(
        max_length=12,
        choices=Status.choices,
        default=Status.AVAILABLE,
        help_text="Estado de publicación de la tarea",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Tarea de bloque"
        verbose_name_plural = "Tareas de bloque"
        ordering = ["block", "order", "-created_at"]
        unique_together = ("block", "order")
        indexes = [
            models.Index(fields=["block", "order"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self) -> str:
        return f"{self.block} · {self.title}"
