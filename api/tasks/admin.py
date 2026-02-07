from django.contrib import admin
from .models import Project, Tag, Task, TaskTag

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("name", "created_at", "updated_at")
    search_fields = ("name", "description")
    ordering = ("-created_at",)
    
@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "created_at", "updated_at")
    search_fields = ("name",)
    ordering = ("created_at",)
    
@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "status",
        "priority",
        "due_date",
        "created_by",
        "assigned_to"
    )
    list_filter = ("status", "priority", "assigned_to", "is_locked")
    search_fields = ("title", "assigned_to", "tags")
    autocomplete_fields = ("project", "created_by", "assigned_to")
    ordering = ("-created_at",)
    date_hierarchy = "created_at"
    
@admin.register(TaskTag)
class TaskTagAdmin(admin.ModelAdmin):
    list_display = ("task", "tag", "created_at", "updated_at")
    search_fields = ("task__title", "tag__name")
    autocomplete_fields = ("task", "tag")
    ordering = ("-created_at",)
    