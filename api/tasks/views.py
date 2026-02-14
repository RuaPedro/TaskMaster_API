from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from .models import BlockTask, StudyBlock, StudyTopic
from .serializers import (
    BlockTaskSerializer,
    StudyBlockSerializer,
    StudyTopicSerializer,
)


class StudyTopicViewSet(viewsets.ModelViewSet):
    """CRUD de temas de estudio."""

    queryset = StudyTopic.objects.prefetch_related("blocks__tasks").all()
    serializer_class = StudyTopicSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"
    filterset_fields = ["difficulty", "is_active"]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "created_at", "updated_at"]


class StudyBlockViewSet(viewsets.ModelViewSet):
    """CRUD de bloques dentro de un tema."""

    queryset = (
        StudyBlock.objects.select_related("topic")
        .prefetch_related("tasks")
        .all()
    )
    serializer_class = StudyBlockSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"
    filterset_fields = ["topic", "is_published"]
    search_fields = ["title", "description", "topic__name"]
    ordering_fields = ["topic", "number", "created_at", "updated_at"]


class BlockTaskViewSet(viewsets.ModelViewSet):
    """CRUD de tareas dentro de un bloque."""

    queryset = (
        BlockTask.objects.select_related("block", "block__topic").all()
    )
    serializer_class = BlockTaskSerializer
    permission_classes = [AllowAny]
    lookup_field = "id"
    filterset_fields = ["block", "status", "block__topic"]
    search_fields = ["title", "instructions", "block__title"]
    ordering_fields = ["block", "order", "created_at", "updated_at"]
