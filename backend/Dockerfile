# ArkhosAI Backend Dockerfile for WSL2 Ubuntu
# Optimized for development with hot-reloading

FROM python:3.12-slim as base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    git \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

# Install Python dependencies
COPY pyproject.toml ./
COPY uv.lock ./

# Install uv for faster dependency resolution
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH "/root/.cargo/bin:${PATH}"

RUN uv pip install --system --no-cache

# Copy the rest of the application
COPY . .

# Create and set permissions for data directory
RUN mkdir -p /app/data && chown -R www-data:www-data /app/data

# Set environment variables
ENV PYTHONPATH=/app/backend
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Run as non-root user
USER www-data:www-data

# Development entrypoint with hot-reloading
CMD ["uvicorn", "arkhos.app:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]