from rest_framework.routers import DefaultRouter

from .views import BlockTaskViewSet, StudyBlockViewSet, StudyTopicViewSet

router = DefaultRouter()
router.register(r"topics", StudyTopicViewSet, basename="study-topics")
router.register(r"blocks", StudyBlockViewSet, basename="study-blocks")
router.register(r"block-tasks", BlockTaskViewSet, basename="block-tasks")

urlpatterns = router.urls
