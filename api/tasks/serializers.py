from rest_framework import serializers

from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "status",
            "priority",
            "due_date",
            "created_at",
            "updated_at",
            "completed_at",
            "is_locked",
            "tags",
            "created_by",
            "assigned_to",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "completed_at"]
