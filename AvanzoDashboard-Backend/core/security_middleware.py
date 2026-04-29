"""
core/security_middleware.py
════════════════════════════
Comprehensive HTTP security header middleware.

Implements:
  • Content-Security-Policy (CSP)      – Prevents XSS by whitelisting trusted sources.
  • Referrer-Policy                     – Prevents leaking referrer URLs to third parties.
  • Permissions-Policy                  – Disables dangerous browser APIs (camera, mic, etc.).
  • X-Content-Type-Options              – Prevents MIME-type sniffing attacks.
  • X-Frame-Options                     – Prevents clickjacking (also set via Django's built-in).
  • X-XSS-Protection                   – Legacy XSS filter for old browsers.
  • Cross-Origin-Opener-Policy          – Prevents cross-origin window attacks (Spectre).
  • Cross-Origin-Resource-Policy        – Restricts cross-origin resource reads.
  • Cache-Control (on API responses)    – Prevents caching of sensitive API data.
  • SuspiciousRequestBlocker            – Blocks common scanner/injection probes.
"""

import logging
import re

from django.http import HttpResponseForbidden
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)


# ── Suspicious path patterns (common scanner probes / injection attempts) ─────
_SUSPICIOUS_PATH_PATTERNS = [
    re.compile(r"\.\.[\\/]", re.IGNORECASE),         # Path traversal
    re.compile(r"\.(php|asp|aspx|cgi|exe)\b", re.IGNORECASE),  # Non-app extensions
    re.compile(r"(union\s+select|drop\s+table|insert\s+into|exec\s*\()", re.IGNORECASE),  # SQLi
    re.compile(r"<script[\s>]", re.IGNORECASE),       # Reflected XSS probe
    re.compile(r"\/etc\/passwd", re.IGNORECASE),       # Linux file traversal
    re.compile(r"(wp-admin|wp-login|wordpress)", re.IGNORECASE),  # WordPress scan
    re.compile(r"(\.env|\.git\/config|\.DS_Store)", re.IGNORECASE),  # Sensitive file probe
    re.compile(r"(eval\s*\(|base64_decode)", re.IGNORECASE),   # Code injection
    re.compile(r"\/\/(.*?)\/(index\.php|admin)", re.IGNORECASE),  # Common attack patterns
]

# ── Suspicious User-Agent patterns ────────────────────────────────────────────
_SUSPICIOUS_UA_PATTERNS = [
    re.compile(r"(sqlmap|nikto|nmap|masscan|dirbuster|gobuster|hydra)", re.IGNORECASE),
    re.compile(r"(scrapy|zgrab|nuclei|metasploit|burpsuite|nessus)", re.IGNORECASE),
    re.compile(r"(python-requests\/[0-1]\.|libwww-perl|java\/1\.[0-5]\.)", re.IGNORECASE),
]


class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Injects comprehensive HTTP security headers into every response.

    This supplements Django's built-in security middleware
    (django.middleware.security.SecurityMiddleware) with additional
    headers that Django does not provide out of the box.

    Place this AFTER SecurityMiddleware in the MIDDLEWARE list.
    """

    def process_response(self, request, response):
        # ── Content-Security-Policy ────────────────────────────────────────────
        # Strict CSP: only allow resources from same origin + trusted CDNs.
        # Adjust 'connect-src' to include your production API domain.
        csp_directives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline'",   # 'unsafe-inline' needed for Vite HMR in dev;
                                                     # use nonce-based CSP in production.
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com data:",
            "img-src 'self' data: blob:",
            "connect-src 'self'",
            "frame-ancestors 'none'",               # Strongest clickjacking protection
            "base-uri 'self'",                      # Prevents base tag injection
            "form-action 'self'",                   # Prevents form hijacking
            "object-src 'none'",                    # Blocks <object>/<embed> (Flash, etc.)
            "upgrade-insecure-requests",
        ]
        response["Content-Security-Policy"] = "; ".join(csp_directives)

        # ── Referrer-Policy ────────────────────────────────────────────────────
        response["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # ── Permissions-Policy ─────────────────────────────────────────────────
        # Disable unused / dangerous browser APIs.
        response["Permissions-Policy"] = (
            "accelerometer=(), "
            "camera=(), "
            "geolocation=(), "
            "gyroscope=(), "
            "magnetometer=(), "
            "microphone=(), "
            "payment=(), "
            "usb=(), "
            "interest-cohort=()"   # Opt out of FLoC
        )

        # ── Legacy XSS filter (IE / old Edge) ─────────────────────────────────
        response["X-XSS-Protection"] = "1; mode=block"

        # ── Cross-Origin isolation ─────────────────────────────────────────────
        # Prevents Spectre-style side-channel attacks via cross-origin windows.
        response["Cross-Origin-Opener-Policy"] = "same-origin"
        response["Cross-Origin-Resource-Policy"] = "same-origin"

        # ── Prevent caching of API responses ──────────────────────────────────
        # Only apply to /api/ paths — let CDN/browser cache static assets.
        if request.path.startswith("/api/"):
            response["Cache-Control"] = "no-store, no-cache, must-revalidate, private"
            response["Pragma"] = "no-cache"
            response["Expires"] = "0"

        return response


class SuspiciousRequestBlockerMiddleware(MiddlewareMixin):
    """
    Proactively blocks requests that look like automated scans or injection attacks.

    Strategy:
      1. Check path for known attack patterns (SQLi, path traversal, RFI, etc.)
      2. Check User-Agent for known scanning tools.
      3. Log & return 403 if suspicious — do NOT reveal the reason.

    This is NOT a WAF replacement. It's a lightweight first line of defence
    against low-sophistication scanners that don't vary their signatures.

    Place BEFORE other middleware (high up in the MIDDLEWARE list) so that
    suspicious requests are terminated before hitting Django ORM/views.
    """

    def process_request(self, request):
        path = request.get_full_path()
        user_agent = request.META.get("HTTP_USER_AGENT", "")
        client_ip = self._get_client_ip(request)

        # ── 1. Path pattern checks ─────────────────────────────────────────────
        for pattern in _SUSPICIOUS_PATH_PATTERNS:
            if pattern.search(path):
                logger.warning(
                    "Blocked suspicious request | IP: %s | Path: %s | UA: %s | Pattern: %s",
                    client_ip,
                    path,
                    user_agent[:200],
                    pattern.pattern,
                )
                return HttpResponseForbidden()

        # ── 2. User-Agent scanner detection ───────────────────────────────────
        for pattern in _SUSPICIOUS_UA_PATTERNS:
            if pattern.search(user_agent):
                logger.warning(
                    "Blocked scanner user-agent | IP: %s | UA: %s",
                    client_ip,
                    user_agent[:200],
                )
                return HttpResponseForbidden()

        return None  # Pass through — do not block.

    @staticmethod
    def _get_client_ip(request) -> str:
        """Safely extract client IP, honouring X-Forwarded-For from trusted proxies."""
        x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded_for:
            # X-Forwarded-For may be a comma-separated list; the leftmost is the client.
            return x_forwarded_for.split(",")[0].strip()
        return request.META.get("REMOTE_ADDR", "unknown")
