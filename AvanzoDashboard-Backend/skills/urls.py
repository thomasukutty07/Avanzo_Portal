from rest_framework.routers import DefaultRouter

from .views import (
    EmployeeSkillViewSet,
    ProjectSkillRequirementViewSet,
    SkillMatchViewSet,
    SkillViewSet,
)

router = DefaultRouter()
router.register(r"catalog", SkillViewSet, basename="skill")
router.register(r"employees", EmployeeSkillViewSet, basename="employee-skill")
router.register(r"requirements", ProjectSkillRequirementViewSet, basename="project-skill-req")
router.register(r"", SkillMatchViewSet, basename="skill-match")

urlpatterns = router.urls
