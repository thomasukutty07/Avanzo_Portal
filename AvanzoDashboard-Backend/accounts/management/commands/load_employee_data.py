from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from accounts.models import AccessRole, Employee
from organization.models import Designation

EMPLOYEE_DATA = [
    {
        "first_name": "Jayesh",
        "last_name": "",
        "designation": "Senior Cyber Security Analyst",
        "date_of_joining": "2024-09-07",
        "role": "Employee",
    },
    {
        "first_name": "Rahul",
        "last_name": "",
        "designation": "Cyber Security System Admin",
        "date_of_joining": "2024-11-01",
        "role": "Employee",
    },
    {
        "first_name": "Soju",
        "last_name": "",
        "designation": "Cyber Security Analyst",
        "date_of_joining": "2025-10-01",
        "role": "Employee",
    },
    {
        "first_name": "Rumzin",
        "last_name": "",
        "designation": "Cyber Security Analyst",
        "date_of_joining": "2025-10-01",
        "role": "Employee",
    },
    {
        "first_name": "Joyal",
        "last_name": "",
        "designation": "Cyber Security Analyst",
        "date_of_joining": "2025-11-01",
        "role": "Employee",
    },
    {
        "first_name": "Abhirami",
        "last_name": "",
        "designation": "Cyber Security Analyst",
        "date_of_joining": "2026-02-04",
        "role": "Employee",
    },
    {
        "first_name": "Sreehari",
        "last_name": "",
        "designation": "Cyber Security Analyst",
        "date_of_joining": "2025-11-01",
        "role": "Employee",
    },
    {
        "first_name": "Deepika",
        "last_name": "",
        "designation": "Cyber Security Analyst Intern",
        "date_of_joining": "2025-12-22",
        "role": "Employee",
    },
    {
        "first_name": "Akhila",
        "last_name": "",
        "designation": "Senior Software Developer",
        "date_of_joining": "2024-06-05",
        "role": "Employee",
    },
    {
        "first_name": "Midhun",
        "last_name": "",
        "designation": "Backend Developer",
        "date_of_joining": "2024-11-11",
        "role": "Employee",
    },
    {
        "first_name": "Amal",
        "last_name": "",
        "designation": "Software Developer",
        "date_of_joining": "2025-05-26",
        "role": "Employee",
    },
    {
        "first_name": "Akash",
        "last_name": "",
        "designation": "Backend Developer",
        "date_of_joining": "2025-01-10",
        "role": "Employee",
    },
    {
        "first_name": "Sangeeth",
        "last_name": "",
        "designation": "Software Developer",
        "date_of_joining": "2024-11-11",
        "role": "Employee",
    },
    {
        "first_name": "Viswajith",
        "last_name": "",
        "designation": "Technical Assistant",
        "date_of_joining": "2024-10-28",
        "role": "Employee",
    },
    {
        "first_name": "Tinu",
        "last_name": "",
        "designation": "Graphic Designer",
        "date_of_joining": "2025-05-21",
        "role": "Employee",
    },
    {
        "first_name": "Athira",
        "last_name": "",
        "designation": "Software Developer",
        "date_of_joining": "2024-11-11",
        "role": "Employee",
    },
    {
        "first_name": "Aindrik",
        "last_name": "",
        "designation": "Backend Developer",
        "date_of_joining": "2025-12-01",
        "role": "Employee",
    },
    {
        "first_name": "Ajith",
        "last_name": "",
        "designation": "Backend Developer",
        "date_of_joining": "2025-12-01",
        "role": "Employee",
    },
    {
        "first_name": "Vikas",
        "last_name": "Gopinath",
        "designation": "Chief of Academic Operations",
        "date_of_joining": None,
        "role": "Team Lead",
    },
    {
        "first_name": "Delisha",
        "last_name": "Joy",
        "designation": "HR",
        "date_of_joining": "2025-12-01",
        "role": "HR",
    },
    {
        "first_name": "Nandhana",
        "last_name": "",
        "designation": "Freelance Digital Marketer",
        "date_of_joining": "2025-11-01",
        "role": "Employee",
    },
    {
        "first_name": "Jessy",
        "last_name": "",
        "designation": "Facilities Maintenance Associate",
        "date_of_joining": "2016-07-28",
        "role": "Employee",
    },
    {
        "first_name": "Sindhu",
        "last_name": "",
        "designation": "Office Assistant",
        "date_of_joining": "2010-06-10",
        "role": "Employee",
    },
    {
        "first_name": "Sheela",
        "last_name": "",
        "designation": "Creative Desk Lead",
        "date_of_joining": None,
        "role": "Team Lead",
    },
]


class Command(BaseCommand):
    help = "Load test employee data into the database"

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting to load employees...")

        with transaction.atomic():
            for data in EMPLOYEE_DATA:
                first_name = data["first_name"]
                last_name = data["last_name"]
                designation_name = data["designation"]
                date_of_joining = data["date_of_joining"]
                role_name = data["role"]

                # Generate a mock unique email
                email = f"{first_name.lower()}.{slugify(designation_name)}@example.com"
                if last_name:
                    email = f"{first_name.lower()}.{last_name.lower()}@example.com"

                # Get or create Designation
                designation, _ = Designation.objects.get_or_create(name=designation_name)

                # Get AccessRole
                role, _ = AccessRole.objects.get_or_create(name=role_name)

                if Employee.objects.filter(email=email).exists():
                    self.stdout.write(
                        self.style.WARNING(f"Employee {email} already exists. Skipping.")
                    )
                    continue

                employee = Employee(
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    designation=designation,
                    access_role=role,
                    date_of_joining=date_of_joining,
                )
                employee.set_password("Password123!")  # Set a default password
                employee.save()

                self.stdout.write(
                    self.style.SUCCESS(f"Created employee: {first_name} {last_name} ({email})")
                )

        self.stdout.write(self.style.SUCCESS("Finished loading employees!"))
