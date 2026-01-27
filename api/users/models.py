from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    """Usuario base del sistema TaskMaster."""

    bio = models.TextField(
        blank=True,
        null=True,
        help_text="Biografia o descripcion del usuario",
    )
    avatar = models.ImageField(
        upload_to="avatars/",
        blank=True,
        null=True,
        help_text="Foto de perfil",
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Telefono de contacto",
    )
    department = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Departamento o equipo",
    )
    is_active = models.BooleanField(
        default=True,
        help_text="Indica si el usuario esta activo",
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Fecha de creacion del usuario",
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Fecha de ultima actualizacion",
    )

    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.username
