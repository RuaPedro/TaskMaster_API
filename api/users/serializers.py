from django.contrib.auth import get_user_model
from rest_framework import serializers

from tasks.serializers import BlockTaskSerializer
from .models import Student, StudentTaskProgress

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_active",
            "date_joined",
        ]
        read_only_fields = ["id", "is_active", "date_joined"]


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ["id", "user", "full_name", "started_at"]
        read_only_fields = ["id", "started_at"]


class StudentTaskProgressSerializer(serializers.ModelSerializer):
    task_detail = BlockTaskSerializer(source="task", read_only=True)

    class Meta:
        model = StudentTaskProgress
        fields = [
            "id",
            "student",
            "task",
            "status",
            "started_at",
            "completed_at",
            "notes",
            "task_detail",
        ]
        read_only_fields = ["id", "task_detail"]
