from django.urls import path

from .views import HealthStatusView

urlpatterns = [
    path("", HealthStatusView.as_view(), name="heath"),
]
