#!/bin/bash
# Development server runner
# Run the Flask development server

export FLASK_ENV=development
export FLASK_APP=app.py

python -m flask run --host=0.0.0.0 --port=5000
