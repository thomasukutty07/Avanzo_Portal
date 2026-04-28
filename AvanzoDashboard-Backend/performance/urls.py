from django.urls import path

from . import views

app_name = "performance"

urlpatterns = [
    path("my-score/",         views.MyScoreView.as_view(),         name="my-score"),
    path("team-scores/",      views.TeamScoresView.as_view(),      name="team-scores"),
    path("leaderboard/",      views.LeaderboardView.as_view(),     name="leaderboard"),
    path("live-leaderboard/", views.LiveLeaderboardView.as_view(), name="live-leaderboard"),
    path("history/",          views.HistoryView.as_view(),         name="history"),
    path("config/",           views.PerformanceConfigView.as_view(), name="config"),
]
