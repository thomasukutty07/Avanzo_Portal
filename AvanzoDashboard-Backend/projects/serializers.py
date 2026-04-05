from rest_framework import serializers

from leaves.models import LeaveRequest

from .models import Client, Project, Service, Task


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = "__all__"


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = "__all__"


class ProjectSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source="client.name", read_only=True, default=None)
    service_name = serializers.CharField(source="service.name", read_only=True, default=None)
    department_name = serializers.CharField(source="owning_department.name", read_only=True)
    progress = serializers.IntegerField(source="mathematical_progress", read_only=True)

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
            "team",
            "status",
            "start_date",
            "target_end_date",
            "progress",
            "created_at",
        ]

    def validate(self, data):
        is_internal = data.get("is_internal", False)
        client = data.get("client")
        department = data.get("owning_department")
        service = data.get("service")

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
            "start_date",
            "due_date",
            "force_assign",
            "created_at",
        ]

    def validate(self, data):
        project = data.get("project")
        assignee = data.get("assignee")
        start_date = data.get("start_date")
        due_date = data.get("due_date")
        force_assign = data.get("force_assign")

        if start_date and due_date and start_date > due_date:
            raise serializers.ValidationError({"due_date": "Due date cannot be before start date."})

        # SECURE: Employee must explicitly be on the Project Team
        if project and assignee and not project.team.filter(id=assignee.id).exists():
            raise serializers.ValidationError(
                {"assignee": f"{assignee.get_full_name()} is not assigned to this project's team."}
            )

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
