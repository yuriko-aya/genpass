#!/bin/bash
# Production server runner with Gunicorn
# Run the Gunicorn application server

export GUNICORN_BIND=0.0.0.0:8000
export GUNICORN_WORKERS=4
export GUNICORN_LOG_LEVEL=info

gunicorn -c gunicorn_config.py "app:app"
