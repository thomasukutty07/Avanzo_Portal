from django.urls import path

from . import views

app_name = "activity"

urlpatterns = [
    path("feed/", views.ActivityFeedView.as_view(), name="feed"),
    path("summary/", views.ActivitySummaryView.as_view(), name="summary"),
]
