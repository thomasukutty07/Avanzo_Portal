import os
import django
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from clients.models import Client, Domain

def create_tenants():
    print("--- Creating Public Tenant ---")
    # Create the public tenant
    # The schema name MUST be 'public'
    public_tenant, created = Client.objects.get_or_create(
        schema_name='public',
        defaults={'name': 'Avanzo Public'}
    )
    if created:
        print(f"Created public tenant: {public_tenant.name}")
    else:
        print(f"Public tenant already exists: {public_tenant.name}")

    # Create the domain for public
    # This is used for public access or when no tenant is matched
    domain_name = 'localhost' # or your local IP
    public_domain, created = Domain.objects.get_or_create(
        domain=domain_name,
        defaults={'tenant': public_tenant, 'is_primary': True}
    )
    if created:
        print(f"Created public domain: {public_domain.domain}")
    else:
        print(f"Public domain already exists: {public_domain.domain}")

    print("\n--- Creating Demo Tenant ---")
    # Create a demo tenant
    demo_tenant, created = Client.objects.get_or_create(
        schema_name='demo',
        defaults={'name': 'Avanzo Demo Corp'}
    )
    if created:
        print(f"Created demo tenant: {demo_tenant.name}")
    else:
        print(f"Demo tenant already exists: {demo_tenant.name}")

    # Create domain for demo
    # Usually you access this via demo.localhost or similar
    demo_domain_name = 'demo.localhost'
    demo_domain, created = Domain.objects.get_or_create(
        domain=demo_domain_name,
        defaults={'tenant': demo_tenant, 'is_primary': True}
    )
    if created:
        print(f"Created demo domain: {demo_domain.domain}")
    else:
        print(f"Demo domain already exists: {demo_domain.domain}")

    print("\nAll set! You can now access:")
    print(f"- Public: http://{domain_name}:8000")
    print(f"- Demo:   http://{demo_domain_name}:8000")

if __name__ == "__main__":
    create_tenants()
