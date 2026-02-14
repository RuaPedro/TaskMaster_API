from django.contrib import admin

from .models import BlockTask, StudyBlock, StudyTopic


@admin.register(StudyTopic)
class StudyTopicAdmin(admin.ModelAdmin):
    list_display = ("name", "difficulty", "is_active", "created_at", "updated_at")
    search_fields = ("name", "description")
    list_filter = ("difficulty", "is_active")
    ordering = ("name",)


@admin.register(StudyBlock)
class StudyBlockAdmin(admin.ModelAdmin):
    list_display = ("title", "topic", "number", "is_published", "estimated_minutes")
    list_filter = ("topic", "is_published")
    search_fields = ("title", "description", "topic__name")
    ordering = ("topic", "number")
    autocomplete_fields = ("topic",)


@admin.register(BlockTask)
class BlockTaskAdmin(admin.ModelAdmin):
    list_display = ("title", "block", "status", "order", "estimated_minutes")
    list_filter = ("status", "block__topic")
    search_fields = ("title", "instructions", "block__title", "block__topic__name")
    ordering = ("block", "order")
    autocomplete_fields = ("block",)
    
