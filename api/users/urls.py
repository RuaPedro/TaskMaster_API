from rest_framework.routers import DefaultRouter

from .views import StudentTaskProgressViewSet, StudentViewSet, UserViewSet

router = DefaultRouter()
router.register(r"users", UserViewSet, basename="users")
router.register(r"students", StudentViewSet, basename="students")
router.register(r"student-task-progress", StudentTaskProgressViewSet, basename="student-task-progress")

urlpatterns = router.urls
