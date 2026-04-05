from django.contrib.auth.models import BaseUserManager


class EmployeeManager(BaseUserManager):
    """Custom manager — uses email instead of username."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required.")
        email = self.normalize_email(email)
        extra_fields.setdefault("is_active", True)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        # Auto-assign Admin AccessRole if not provided
        if "access_role" not in extra_fields or extra_fields["access_role"] is None:
            from accounts.models import AccessRole

            admin_role, _ = AccessRole.objects.get_or_create(
                name="Admin",
                defaults={"description": "Full system administrator"},
            )
            extra_fields["access_role"] = admin_role

        return self.create_user(email, password, **extra_fields)
