# ruff: noqa: E402
import os
import sys

import django

# 1. Setup Django environment FIRST before any DRF imports
sys.path.append(os.getcwd())
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

# 2. Now we can import DRF and other local modules
from rest_framework import serializers, status
from rest_framework.exceptions import Throttled
from rest_framework.test import APITestCase

from core.exceptions import custom_exception_handler


class ExceptionHandlerTests(APITestCase):
    def test_throttled_error_standardization(self):
        """Verify 429 errors are wrapped in the 'error' envelope."""
        exc = Throttled(wait=15)
        context = {}

        response = custom_exception_handler(exc, context)

        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertIn("error", response.data)
        self.assertEqual(response.data["error"]["code"], "THROTTLED")
        self.assertIn("request_id", response.data["error"])
        # Message should contain the wait time
        self.assertIn("15 seconds", response.data["error"]["message"])

    def test_validation_error_standardization(self):
        """Verify 400 errors are wrapped in the 'error' envelope."""
        exc = serializers.ValidationError({"email": ["This field is required."]})
        context = {}

        response = custom_exception_handler(exc, context)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("error", response.data)
        self.assertEqual(response.data["error"]["code"], "VALIDATION_ERROR")
        self.assertIn("email", response.data["error"]["details"])
        self.assertIn("request_id", response.data["error"])

    def test_500_error_standardization(self):
        """Verify unhandled exceptions return a safe 500 envelope."""
        exc = Exception("Unhandled database error")
        context = {}

        response = custom_exception_handler(exc, context)

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertEqual(response.data["error"]["code"], "INTERNAL_SERVER_ERROR")
        self.assertEqual(
            response.data["error"]["message"],
            "A server error occurred. Our engineers have been notified.",
        )
        self.assertIn("request_id", response.data["error"])


if __name__ == "__main__":
    import unittest

    suite = unittest.TestLoader().loadTestsFromTestCase(ExceptionHandlerTests)
    unittest.TextTestRunner().run(suite)
