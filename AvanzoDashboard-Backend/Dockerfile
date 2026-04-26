# Use a Python image with uv pre-installed
FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_PROJECT_ENVIRONMENT="/opt/venv" \
    PATH="/opt/venv/bin:/app/scripts:${PATH}"

# Install system dependencies (e.g. for PostgreSQL, building wheels)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy the dependency files first to leverage Docker cache
COPY pyproject.toml uv.lock ./

# Install dependencies using uv into a virtual environment
RUN uv sync --frozen --no-dev

# Copy the rest of the application
COPY . .

# Ensure entrypoint is executable
RUN chmod +x /app/entrypoint.sh

# Create a non-root user and switch to it for security
RUN useradd -m appuser \
    && chown -R appuser:appuser /app \
    && chown -R appuser:appuser /opt/venv

USER appuser

# Expose port
EXPOSE 8000

# Set entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]
