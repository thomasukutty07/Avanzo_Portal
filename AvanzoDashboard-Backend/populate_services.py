import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from projects.models import Service
from organization.models import Department

def add_services():
    cyber_dept = Department.objects.filter(name="Cybersecurity").first()
    tech_dept = Department.objects.filter(name__icontains="Technical").first() or Department.objects.filter(name="Engineering").first()
    
    if not cyber_dept:
        print("Cybersecurity department not found")
        return

    cyber_services = [
        "Vulnerability assessment & Penetration Testing (VAPT)",
        "Infrastructure Security Audit",
        "Application Security Review",
        "Incident Response & Management",
        "Compliance Audits (ISO 27001, SOC2)",
    ]

    tech_services = [
        "Web application development",
        "Mobile App Development",
        "Backend API Refresh",
        "Cloud Migration Project",
        "System Architecture Design",
    ]

    for name in cyber_services:
        Service.objects.get_or_create(name=name, department=cyber_dept)
        print(f"Added Cyber Service: {name}")

    if tech_dept:
        for name in tech_services:
            Service.objects.get_or_create(name=name, department=tech_dept)
            print(f"Added Tech Service: {name} (Dept: {tech_dept.name})")
    else:
        print("Technical department not found, using global for tech services")
        for name in tech_services:
            Service.objects.get_or_create(name=name, department=None)

if __name__ == '__main__':
    add_services()
