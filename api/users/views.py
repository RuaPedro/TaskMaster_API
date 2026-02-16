from django.contrib.auth import get_user_model
from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .models import Student, StudentTaskProgress
from .serializers import (
    StudentSerializer,
    StudentTaskProgressSerializer,
    UserSerializer,
)

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
    """CRUD básico sobre el usuario Django por defecto."""

    queryset = User.objects.all().order_by("id")
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"
    search_fields = ["username", "email", "first_name", "last_name"]
    ordering_fields = ["date_joined", "username", "id"]


class StudentViewSet(viewsets.ModelViewSet):
    """CRUD para estudiantes."""

    queryset = Student.objects.select_related("user").all()
    serializer_class = StudentSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"
    search_fields = ["full_name", "user__username", "user__email"]
    ordering_fields = ["full_name", "started_at"]


class StudentTaskProgressViewSet(viewsets.ModelViewSet):
    """Asignación y seguimiento de tareas para estudiantes."""

    queryset = (
        StudentTaskProgress.objects.select_related("student", "task", "task__block")
        .all()
    )
    serializer_class = StudentTaskProgressSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"
    filterset_fields = ["student", "task", "status", "task__block", "task__block__topic"]
    search_fields = [
        "student__full_name",
        "task__title",
        "task__block__title",
        "notes",
    ]
    ordering_fields = ["started_at", "completed_at", "status"]
