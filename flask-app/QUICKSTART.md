# Quick Start Guide

Get GenPass running in 5 minutes!

## Option 1: Local Development (Fastest)

```bash
# 1. Create virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Run development server
chmod +x run_dev.sh
./run_dev.sh
```

Visit: http://localhost:5000

## Option 2: Docker (Recommended for Production)

```bash
# 1. Build Docker image
docker build -t genpass .

# 2. Run container
docker run -p 8000:8000 genpass
```

Visit: http://localhost:8000

## Option 3: Docker Compose (Best for Development)

```bash
# 1. Start services
docker-compose up -d

# 2. View logs
docker-compose logs -f
```

Visit: http://localhost:8000

## Option 4: Production with Gunicorn

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Run production server
chmod +x run_prod.sh
./run_prod.sh
```

Visit: http://localhost:8000

## Verify Installation

Test that everything is working:

```bash
# Test main page
curl http://localhost:8000/

# Test v1 API
curl http://localhost:8000/api/

# Test v2 API
curl http://localhost:8000/api_v2/

# Test custom password API
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "length": 32,
    "include_uppercase": true,
    "include_lowercase": true,
    "include_numbers": true,
    "include_symbols": true
  }'
```

## Common Issues

### Port Already in Use
```bash
# Change port in run_dev.sh or use:
FLASK_ENV=development python -m flask run --port=5001
```

### ModuleNotFoundError
```bash
# Ensure virtual environment is activated
source venv/bin/activate
pip install -r requirements.txt
```

### Permission Denied (run_dev.sh)
```bash
chmod +x run_dev.sh run_prod.sh
```

## Next Steps

- Read [FLASK_SETUP.md](FLASK_SETUP.md) for detailed configuration
- Read [MIGRATION.md](MIGRATION.md) for technical details
- Review [README.md](README.md) for feature overview

## Support

For issues, check:
1. Flask/Gunicorn logs for errors
2. Browser console (F12) for client-side errors
3. FLASK_SETUP.md troubleshooting section
