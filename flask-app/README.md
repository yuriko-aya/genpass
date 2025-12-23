# GenPass - Flask/Gunicorn Version

This directory contains the Flask-Gunicorn conversion of the GenPass password generator.

## Quick Start

```bash
# From this directory (flask-app/)
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
./run_dev.sh
```

Visit: http://localhost:5000

## Documentation

- **[START_HERE.md](START_HERE.md)** - Quick entry point
- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute setup
- **[FLASK_SETUP.md](FLASK_SETUP.md)** - Complete guide
- **[MIGRATION.md](MIGRATION.md)** - Technical details
- **[CONVERSION_STATUS.txt](CONVERSION_STATUS.txt)** - Full overview

## Project Structure

```
flask-app/
├── app.py                      # Flask application
├── password_generator.py       # Python password logic
├── gunicorn_config.py         # Gunicorn config
├── requirements.txt           # Dependencies
├── templates/                 # HTML templates
├── static/                    # CSS/JS assets
├── Dockerfile                 # Docker image
├── docker-compose.yml         # Docker Compose
└── Documentation files...
```

## Running

**Development:**
```bash
./run_dev.sh
```

**Production:**
```bash
./run_prod.sh
```

**Docker:**
```bash
docker-compose up
```

## Features

- Flask backend with Gunicorn
- REST API endpoints
- Password generation (v1 & v2)
- Docker containerization
- Production-ready configuration
- Comprehensive documentation

See **START_HERE.md** for complete setup instructions.
