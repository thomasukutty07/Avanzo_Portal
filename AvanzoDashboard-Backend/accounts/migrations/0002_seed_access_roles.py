from django.db import migrations


def seed_roles(apps, schema_editor):
    AccessRole = apps.get_model("accounts", "AccessRole")
    roles = [
        ("Employee", "Standard employee with basic access"),
        ("Team Lead", "Team management and Tier-1 approvals"),
        ("HR", "Human resources, directory management, Tier-2 approvals"),
        ("Admin", "Full system administrator"),
    ]
    for name, description in roles:
        AccessRole.objects.get_or_create(name=name, defaults={"description": description})


def reverse_roles(apps, schema_editor):
    pass  # Don't delete roles on reverse — too dangerous


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_roles, reverse_roles),
    ]
