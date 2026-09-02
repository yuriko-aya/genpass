# GenPass Flask Application

Server-side password generator powered by Flask and Gunicorn.

## Quick Start

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
./run_dev.sh
```

Visit [http://localhost:5000](http://localhost:5000).

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

**Tests:**

```bash
pytest
```

## Routes

| Route | Method | Description |
|---|---|---|
| `/` | GET | Main UI (custom password options) |
| `/v2/` | GET | Version 2 UI |
| `/api/` | GET | Plain-text v1 password (no hyphens) |
| `/api_v2/` | GET | Plain-text v2 password |
| `/api/generate` | POST | JSON custom password + strength |
| `/api/generate/v2` | POST | JSON v2 password + strength |

## Configuration

| Variable | Default | Description |
|---|---|---|
| `RATE_LIMIT_DEFAULT` | `200 per hour` | Default limit for all routes |
| `RATE_LIMIT_API` | `30 per minute` | Limit for API endpoints |
| `RATE_LIMIT_STORAGE_URI` | `memory://` | Flask-Limiter storage backend |

## Privacy

Passwords are generated server-side and sent to the browser over HTTPS. They are not stored, but do travel over the network during generation.

## Project Layout

```
flask-app/
├── app.py
├── password_generator.py
├── gunicorn_config.py
├── requirements.txt
├── tests/
├── templates/
├── static/
├── Dockerfile
└── docker-compose.yml
```
