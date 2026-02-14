from rest_framework import serializers

from .models import BlockTask, StudyBlock, StudyTopic


class BlockTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = BlockTask
        fields = [
            "id",
            "block",
            "title",
            "instructions",
            "resources",
            "estimated_minutes",
            "order",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class StudyBlockSerializer(serializers.ModelSerializer):
    tasks = BlockTaskSerializer(many=True, read_only=True)

    class Meta:
        model = StudyBlock
        fields = [
            "id",
            "topic",
            "number",
            "title",
            "description",
            "estimated_minutes",
            "is_published",
            "created_at",
            "updated_at",
            "tasks",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "tasks"]


class StudyTopicSerializer(serializers.ModelSerializer):
    blocks = StudyBlockSerializer(many=True, read_only=True)

    class Meta:
        model = StudyTopic
        fields = [
            "id",
            "name",
            "description",
            "difficulty",
            "is_active",
            "created_at",
            "updated_at",
            "blocks",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "blocks"]
