from django.conf import settings
from django.db import models

from tasks.models import BlockTask


class Student(models.Model):
    """Perfil extendido para estudiantes."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="student_profile",
    )
    full_name = models.CharField(max_length=150, help_text="Nombre completo del estudiante")
    started_at = models.DateField(auto_now_add=True)

    class Meta:
        verbose_name = "Estudiante"
        verbose_name_plural = "Estudiantes"

    def __str__(self) -> str:
        return self.full_name


class StudentTaskProgress(models.Model):
    """Seguimiento de progreso de un estudiante sobre una tarea."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pendiente"
        IN_PROGRESS = "in_progress", "En progreso"
        COMPLETED = "completed", "Completada"

    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name="task_progress",
    )
    task = models.ForeignKey(
        BlockTask,
        on_delete=models.CASCADE,
        related_name="student_progress",
    )
    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.PENDING,
    )
    started_at = models.DateTimeField(blank=True, null=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True)

    class Meta:
        verbose_name = "Progreso de tarea"
        verbose_name_plural = "Progresos de tarea"
        unique_together = ("student", "task")
        ordering = ["-completed_at", "-started_at"]
        indexes = [
            models.Index(fields=["student", "task"]),
            models.Index(fields=["status"]),
        ]

    def __str__(self) -> str:
        return f"{self.student} · {self.task} · {self.status}"
