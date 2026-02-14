from django.contrib import admin

from .models import Student, StudentTaskProgress


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("full_name", "user", "started_at")
    search_fields = ("full_name", "user__username", "user__email")
    ordering = ("full_name",)
    autocomplete_fields = ("user",)


@admin.register(StudentTaskProgress)
class StudentTaskProgressAdmin(admin.ModelAdmin):
    list_display = ("student", "task", "status", "started_at", "completed_at")
    list_filter = ("status", "task__block__topic")
    search_fields = ("student__full_name", "task__title", "task__block__title", "notes")
    ordering = ("-started_at",)
    autocomplete_fields = ("student", "task")
