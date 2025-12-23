# GenPass - Project Structure

This project now contains two versions:

## 📂 Original JavaScript Version (Current Directory)

The original client-side JavaScript password generator:
- **index.html** - Main UI
- **v2/index.html** - Advanced UI
- **api/index.html** - API v1
- **api_v2/index.html** - API v2
- **src/js/genpass.js** - JavaScript logic
- **src/css/style.css** - Styling

This version runs entirely in the browser with no server required.

## 🐍 Flask/Gunicorn Version (flask-app/ directory)

A production-ready Flask backend conversion:
- Server-side password generation with Python
- REST API endpoints
- Gunicorn production server
- Docker containerization
- Comprehensive documentation

### Quick Start (Flask Version)

```bash
cd flask-app
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
./run_dev.sh
# Visit http://localhost:5000
```

See **[flask-app/START_HERE.md](flask-app/START_HERE.md)** for complete setup instructions.

## 🔄 Choose Your Version

### Use Original (JavaScript) if:
- You want a simple static website
- No server setup needed
- Client-side only
- Easy deployment to GitHub Pages

### Use Flask Version if:
- You need a production backend
- Want REST API endpoints
- Need server-side validation
- Want to deploy with Docker
- Need centralized password generation

## 📚 Documentation

### Original Project:
- [README.md](README.md) - Feature overview

### Flask Version:
- [flask-app/START_HERE.md](flask-app/START_HERE.md) - Quick start
- [flask-app/QUICKSTART.md](flask-app/QUICKSTART.md) - 5-minute setup
- [flask-app/FLASK_SETUP.md](flask-app/FLASK_SETUP.md) - Complete guide
- [flask-app/MIGRATION.md](flask-app/MIGRATION.md) - Technical details
- [flask-app/CONVERSION_STATUS.txt](flask-app/CONVERSION_STATUS.txt) - Status

Both versions provide the same password generation functionality!
