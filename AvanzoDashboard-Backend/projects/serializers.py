from rest_framework import serializers

from leaves.models import LeaveRequest

from .models import ExternalClient, Project, Service, Task
from accounts.models import Employee


class ProjectMemberSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="get_full_name", read_only=True)

    class Meta:
        model = Employee
        fields = ["id", "full_name", "avatar", "email"]


class ExternalClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExternalClient
        fields = "__all__"


class ServiceSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)

    class Meta:
        model = Service
        fields = ["id", "name", "description", "department", "department_name", "is_active"]


class ProjectSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.name", read_only=True, default=None)
    service_name = serializers.CharField(source="service.name", read_only=True, default=None)
    department_name = serializers.CharField(source="owning_department.name", read_only=True)
    manager = ProjectMemberSerializer(read_only=True)
    manager_name = serializers.SerializerMethodField()
    progress = serializers.IntegerField(source="weighted_progress", read_only=True)
    team_members = ProjectMemberSerializer(source="team", many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "is_internal",
            "client",
            "client_name",
            "service",
            "service_name",
            "owning_department",
            "department_name",
            "manager",
            "manager_name",
            "team",
            "team_members",
            "status",
            "start_date",
            "target_end_date",
            "progress",
            "created_at",
        ]
        read_only_fields = ["manager", "status"]

    def get_manager_name(self, obj) -> str | None:
        if obj.manager:
            name = obj.manager.get_full_name().strip()
            return name if name else obj.manager.email
        return None

    def validate(self, data):
        is_internal = data.get("is_internal", getattr(self.instance, "is_internal", False))
        client = data.get("client", getattr(self.instance, "client", None))

        user = self.context["request"].user if "request" in self.context else None

        if self.instance:
            department = self.instance.owning_department
        else:
            provided_dept = data.get("owning_department")

            if provided_dept:
                if user and not user.is_admin and provided_dept != user.department:
                    raise serializers.ValidationError(
                        {
                            "owning_department": (
                                "Only Admins can create projects for other departments."
                            )
                        }
                    )
                department = provided_dept
            else:
                department = user.department if user else None

            if not department:
                raise serializers.ValidationError(
                    {
                        "owning_department": (
                            "Must provide a department or belong to one to create a project."
                        )
                    }
                )

            data["owning_department"] = department

        service = data.get("service", getattr(self.instance, "service", None))

        if is_internal and client:
            raise serializers.ValidationError({"client": "Internal projects cannot have a client."})
        if not is_internal and not client:
            raise serializers.ValidationError({"client": "External projects must have a client."})
        if department and department.name == "Cybersecurity" and not service:
            raise serializers.ValidationError(
                {"service": "Cybersecurity projects require a Service."}
            )

        return data


class TaskSerializer(serializers.ModelSerializer):
    assignee_name = serializers.CharField(source="assignee.get_full_name", read_only=True)
    project_name = serializers.CharField(source="project.title", read_only=True)
    force_assign = serializers.BooleanField(write_only=True, default=False)

    class Meta:
        model = Task
        fields = [
            "id",
            "project",
            "project_name",
            "title",
            "description",
            "assignee",
            "assignee_name",
            "priority",
            "status",
            "complexity",
            "complexity_locked",
            "complexity_locked_at",
            "completion_pct",
            "start_date",
            "due_date",
            "force_assign",
            "created_at",
        ]
        read_only_fields = ["complexity_locked", "complexity_locked_at"]

    def validate_complexity(self, value):
        """Reject complexity changes once locked."""
        if self.instance and self.instance.complexity_locked:
            if value != self.instance.complexity:
                raise serializers.ValidationError(
                    "Complexity is locked and cannot be changed after the first progress update."
                )
        return value

    def validate(self, data):
        project = data.get("project", getattr(self.instance, "project", None))
        assignee = data.get("assignee", getattr(self.instance, "assignee", None))
        start_date = data.get("start_date", getattr(self.instance, "start_date", None))
        due_date = data.get("due_date", getattr(self.instance, "due_date", None))
        force_assign = data.get("force_assign", False)

        if start_date and due_date and start_date > due_date:
            raise serializers.ValidationError({"due_date": "Due date cannot be before start date."})

        # OVERLAP ENGINE: Prevent assignment during approved leaves
        if assignee and start_date and due_date and not force_assign:
            overlapping_leaves = LeaveRequest.objects.filter(
                employee=assignee,
                status=LeaveRequest.Status.APPROVED,
                start_date__lte=due_date,
                end_date__gte=start_date,
            )
            if overlapping_leaves.exists():
                leave = overlapping_leaves.first()
                raise serializers.ValidationError(
                    {
                        "conflict": (
                            f"Employee is on approved leave from {leave.start_date} "
                            f"to {leave.end_date}."
                        ),
                        "code": "EMPLOYEE_ON_LEAVE",
                    }
                )

        return data

    def create(self, validated_data):
        """Remove write-only virtual field before hitting DB."""
        validated_data.pop("force_assign", None)
        return super().create(validated_data)


class TaskProgressSerializer(serializers.Serializer):
    """Used for the PATCH /tasks/{id}/progress/ endpoint."""

    completion_pct = serializers.IntegerField(min_value=0, max_value=100)


class ProjectProgressSerializer(serializers.Serializer):
    """Read-only serializer for the GET /projects/{id}/progress/ endpoint."""

    project_id = serializers.UUIDField()
    project_name = serializers.CharField()
    weighted_progress = serializers.IntegerField()
    total_tasks = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
    total_complexity_points = serializers.IntegerField()
    earned_points = serializers.IntegerField()
    formula = serializers.CharField()
