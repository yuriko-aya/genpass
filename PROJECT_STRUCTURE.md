# GenPass - Project Structure

## Root (GitHub Pages redirects)

Static redirect pages only. Each file sends visitors to [genpass.yuriko-aya.cc](https://genpass.yuriko-aya.cc):

- `index.html` → `/`
- `v2/index.html` → `/v2/`
- `api/index.html` → `/api/`
- `api_v2/index.html` → `/api_v2/`

No application logic lives here.

## flask-app/ (application)

The Flask/Gunicorn application that powers the live site.

```
flask-app/
├── app.py                  # Routes and API handlers
├── password_generator.py   # Password generation logic
├── gunicorn_config.py      # Gunicorn production config
├── requirements.txt        # Python dependencies
├── run_dev.sh              # Flask dev server (port 5000)
├── run_prod.sh             # Gunicorn (port 8000)
├── Dockerfile
├── docker-compose.yml
├── templates/
│   ├── index.html          # Main UI
│   └── v2/index.html       # Version 2 UI
├── static/
│   ├── css/style.css
│   └── js/                 # Shared + page-specific scripts
└── tests/
    ├── test_password_generator.py
    └── test_app.py
```

### Quick Start

```bash
cd flask-app
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
./run_dev.sh
```

See [flask-app/README.md](flask-app/README.md) for run and deployment options.
