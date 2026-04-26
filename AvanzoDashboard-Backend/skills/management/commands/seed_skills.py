from django.core.management.base import BaseCommand
from skills.models import Skill


SKILLS = [
    # Development
    ("Python", "development"),
    ("Django", "development"),
    ("JavaScript", "development"),
    ("React", "development"),
    ("Node.js", "development"),
    ("TypeScript", "development"),
    ("REST API Design", "development"),
    ("SQL / PostgreSQL", "development"),
    ("Docker / Containers", "development"),
    ("Git & Version Control", "development"),
    # Cybersecurity
    ("Network Security", "cybersecurity"),
    ("Penetration Testing", "cybersecurity"),
    ("Incident Response", "cybersecurity"),
    ("SIEM / Log Analysis", "cybersecurity"),
    ("Vulnerability Assessment", "cybersecurity"),
    ("Cloud Security", "cybersecurity"),
    ("Ethical Hacking", "cybersecurity"),
    ("Risk Management", "cybersecurity"),
    # Design
    ("UI/UX Design", "design"),
    ("Figma", "design"),
    ("Graphic Design", "design"),
    ("Wireframing", "design"),
    ("Prototyping", "design"),
    # Management
    ("Project Management", "management"),
    ("Agile / Scrum", "management"),
    ("Team Leadership", "management"),
    ("Stakeholder Communication", "management"),
    ("Strategic Planning", "management"),
    # Compliance
    ("ISO 27001", "compliance"),
    ("GDPR Compliance", "compliance"),
    ("Audit & Risk", "compliance"),
    ("Data Privacy", "compliance"),
]


class Command(BaseCommand):
    help = "Seed the Skill catalog with default skills for all tenants."

    def handle(self, *args, **kwargs):
        from clients.models import Client

        tenants = Client.objects.exclude(schema_name="public")
        if not tenants.exists():
            # Single-tenant / public setup — seed without tenant FK
            tenants = [None]

        created_total = 0
        for tenant in tenants:
            for name, category in SKILLS:
                kwargs_filter = {"name": name}
                if tenant:
                    kwargs_filter["tenant"] = tenant

                if not Skill.objects.filter(**kwargs_filter).exists():
                    Skill.objects.create(
                        name=name,
                        category=category,
                        tenant=tenant if tenant else None,
                        is_active=True,
                    )
                    created_total += 1

        if created_total:
            self.stdout.write(self.style.SUCCESS(f"✅ Created {created_total} skills."))
        else:
            self.stdout.write(self.style.WARNING("ℹ️  All skills already exist — nothing to seed."))
