#!/bin/bash
# Verification script to check if all required files are in place

echo "GenPass Flask-Gunicorn Conversion Verification"
echo "=============================================="
echo ""

# Check required files
required_files=(
    "app.py"
    "password_generator.py"
    "gunicorn_config.py"
    "requirements.txt"
    "run_dev.sh"
    "run_prod.sh"
    "Dockerfile"
    "docker-compose.yml"
    ".env.example"
    ".gitignore"
    "FLASK_SETUP.md"
    "MIGRATION.md"
    "QUICKSTART.md"
    "CONVERSION_SUMMARY.md"
    "templates/index.html"
    "templates/v2/index.html"
    "static/css/style.css"
)

echo "Checking required files..."
echo ""

missing_files=()
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file"
    else
        echo "✗ $file (MISSING)"
        missing_files+=("$file")
    fi
done

echo ""
echo "=============================================="

if [ ${#missing_files[@]} -eq 0 ]; then
    echo "✓ All files present!"
    echo ""
    echo "Next steps:"
    echo "1. Read QUICKSTART.md for getting started"
    echo "2. Create virtual environment: python3 -m venv venv"
    echo "3. Activate: source venv/bin/activate"
    echo "4. Install: pip install -r requirements.txt"
    echo "5. Run: ./run_dev.sh"
    exit 0
else
    echo "✗ Missing ${#missing_files[@]} file(s):"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
    exit 1
fi
