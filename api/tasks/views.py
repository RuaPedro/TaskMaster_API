from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    """CRUD basico de tareas usando DRF ViewSets."""

    queryset = Task.objects.select_related("created_by", "assigned_to").all()
    serializer_class = TaskSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"
    filterset_fields = ["status", "priority", "assigned_to", "created_by", "is_locked"]
    search_fields = ["title", "description", "tags"]
    ordering_fields = ["created_at", "updated_at", "due_date", "priority", "status"]
