import logging
import uuid

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Standardizes all API errors into a consistent Enterprise Error Envelope.

    Structure:
    {
        "error": {
            "code": "SEMANTIC_ERROR_CODE",
            "message": "Human readable message",
            "details": {...},
            "request_id": "uuid-v4"
        }
    }
    """
    # 1. Get the standard DRF response first
    response = exception_handler(exc, context)
    request_id = str(uuid.uuid4())

    if response is not None:
        # Standardize the error code based on status code
        code_mapping = {
            status.HTTP_400_BAD_REQUEST: "VALIDATION_ERROR",
            status.HTTP_401_UNAUTHORIZED: "NOT_AUTHENTICATED",
            status.HTTP_403_FORBIDDEN: "PERMISSION_DENIED",
            status.HTTP_404_NOT_FOUND: "NOT_FOUND",
            status.HTTP_409_CONFLICT: "STATE_CONFLICT",
            status.HTTP_429_TOO_MANY_REQUESTS: "THROTTLED",
        }

        status_code = response.status_code
        error_code = code_mapping.get(status_code, "API_ERROR")

        # Extract data from the original DRF response
        data = response.data
        message = "An error occurred."
        details = {}

        if isinstance(data, dict):
            # If 'detail' is present, it's a generic error (401, 403, 404, etc.)
            # Otherwise, it's likely field-specific validation errors.
            message = data.pop("detail", message)
            details = data
        elif isinstance(data, list):
            # Rarely, DRF returns a flat list (e.g., non_field_errors)
            message = "Multiple errors occurred."
            details = {"non_field_errors": data}

        # Rewrite response data into the standardized envelope
        response.data = {
            "error": {
                "code": error_code,
                "message": message,
                "details": details,
                "request_id": request_id,
            }
        }
    else:
        # 2. Handle 500 Errors (Unhandled Exceptions)
        # 🚨 SECURITY: We must NEVER leak traceback to the client.

        # Log the full traceback internally for debugging
        logger.error(
            f"Unhandled Exception [Request ID: {request_id}]: {str(exc)}",
            exc_info=True,
            extra={"request_id": request_id},
        )

        response = Response(
            {
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "A server error occurred. Our engineers have been notified.",
                    "request_id": request_id,
                }
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return response
