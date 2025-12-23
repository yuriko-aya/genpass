# GenPass - Flask/Gunicorn Conversion

This is the Flask-Gunicorn version of the GenPass password generator. The password generation logic has been moved from client-side JavaScript to a Python backend, with Gunicorn for production deployment.

## Changes from Original

- **Backend**: Password generation moved from JavaScript to Python (`password_generator.py`)
- **Frontend**: Converted from pure client-side to client-side with API calls to backend
- **Server**: Added Flask application server with Gunicorn for production
- **Structure**: 
  - `templates/` - HTML templates (Flask)
  - `static/` - Static CSS and other assets
  - `app.py` - Flask application
  - `password_generator.py` - Python password generation logic

## Installation

### Requirements
- Python 3.7+
- pip

### Setup

1. Create a virtual environment (recommended):
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create `.env` file from example:
```bash
cp .env.example .env
```

## Running the Application

### Development Mode
```bash
chmod +x run_dev.sh
./run_dev.sh
```

Or manually:
```bash
export FLASK_ENV=development
python -m flask run --host=0.0.0.0 --port=5000
```

The app will be available at `http://localhost:5000`

### Production Mode with Gunicorn
```bash
chmod +x run_prod.sh
./run_prod.sh
```

Or manually:
```bash
gunicorn -c gunicorn_config.py "app:app"
```

The app will be available at `http://localhost:8000`

## API Endpoints

### Interactive Pages
- `GET /` - Main password generator (Version 1)
- `GET /v2/` - Advanced password generator (Version 2)

### API Endpoints (Plain Text)
- `GET /api/` - Generate v1 password (plain text)
- `GET /api_v2/` - Generate v2 password (plain text)

### API Endpoints (JSON)
- `POST /api/generate` - Generate custom password with options
  ```json
  {
    "length": 32,
    "include_uppercase": true,
    "include_lowercase": true,
    "include_numbers": true,
    "include_symbols": false,
    "add_hyphens": false
  }
  ```

- `POST /api/generate/v2` - Generate v2 password (16 chars with special chars)

## Configuration

### Environment Variables

Edit `.env` or set these variables:

- `FLASK_ENV` - Set to `development` or `production`
- `FLASK_DEBUG` - Enable debug mode (development only)
- `PORT` - Flask development server port (default: 5000)
- `GUNICORN_BIND` - Gunicorn bind address (default: 0.0.0.0:8000)
- `GUNICORN_WORKERS` - Number of Gunicorn workers (default: CPU cores * 2 + 1)
- `GUNICORN_LOG_LEVEL` - Log level: debug, info, warning, error (default: info)

### Gunicorn Configuration

Edit `gunicorn_config.py` for advanced settings:
- Worker processes and connections
- Logging configuration
- Timeouts and request limits
- Application preloading

## Project Structure

```
genpass/
├── app.py                      # Flask application
├── password_generator.py       # Python password generation logic
├── gunicorn_config.py         # Gunicorn configuration
├── requirements.txt           # Python dependencies
├── run_dev.sh                 # Development server runner
├── run_prod.sh                # Production server runner
├── .env.example               # Environment variables example
├── templates/
│   ├── index.html             # Main UI (v1)
│   └── v2/
│       └── index.html         # Advanced UI (v2)
├── static/
│   └── css/
│       └── style.css          # CSS styling
└── src/
    ├── js/
    │   └── genpass.js         # Original JS (kept for reference)
    └── css/
        └── style.css          # Original CSS (kept for reference)
```

## Features

### Password Generation Algorithms

**Version 1:**
- Customizable length (8-64 characters)
- Selectable character types (uppercase, lowercase, numbers, symbols)
- Optional hyphens every 8 characters
- Real-time strength scoring

**Version 2:**
- 16-character passwords
- Always includes uppercase, lowercase, numbers, and special characters
- Cryptographically secure generation
- High-strength passwords

### Security
- Cryptographically secure random generation using Python's `secrets` module
- Server-side validation of parameters
- Input length validation (8-64 characters)
- HTML escaping to prevent XSS attacks
- CORS-ready (can be configured for specific origins)

## Deployment

### Local Deployment
1. Install Python dependencies
2. Run `./run_prod.sh`
3. Access at `http://localhost:8000`

### Docker Deployment
Create a Dockerfile:
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV GUNICORN_BIND=0.0.0.0:8000
CMD ["gunicorn", "-c", "gunicorn_config.py", "app:app"]
```

Build and run:
```bash
docker build -t genpass .
docker run -p 8000:8000 genpass
```

### Cloud Deployment (Heroku, AWS, etc.)
1. Set environment variables
2. Install dependencies: `pip install -r requirements.txt`
3. Start server: `gunicorn -c gunicorn_config.py "app:app"`

## Testing

Test password endpoints:
```bash
# Test v1 API
curl http://localhost:8000/api/

# Test v2 API
curl http://localhost:8000/api_v2/

# Test custom password generation
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"length": 32, "include_uppercase": true, "include_lowercase": true, "include_numbers": true}'
```

## Original JavaScript Files

The original JavaScript files are preserved in the `src/` directory for reference:
- `src/js/genpass.js` - Original JavaScript implementation
- `src/css/style.css` - Original CSS

## License

This conversion maintains the same license as the original project.
