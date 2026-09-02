# GenPass - Password Generator

A secure password generator with a Flask backend, interactive UI, and plain-text API endpoints.

🔗 **Live site**: [https://genpass.yuriko-aya.cc](https://genpass.yuriko-aya.cc)

Legacy GitHub Pages URLs redirect to the live site:

| GitHub Pages | Redirects to |
|---|---|
| [yuriko-aya.github.io/genpass](https://yuriko-aya.github.io/genpass) | `/` |
| […/genpass/v2](https://yuriko-aya.github.io/genpass/v2) | `/v2/` |
| […/genpass/api](https://yuriko-aya.github.io/genpass/api) | `/api/` |
| […/genpass/api_v2](https://yuriko-aya.github.io/genpass/api_v2) | `/api_v2/` |

## Features

- **Version 1**: Customizable length (8–64 chars), selectable character types, optional hyphens
- **Version 2**: 16-character passwords with guaranteed uppercase, lowercase, digits, and symbols
- **Interactive UI** and **API endpoints** (plain text and JSON)
- **Password strength analysis** with visual feedback
- **Cryptographically secure generation** via Python `secrets`
- **Production-ready**: Gunicorn, Docker, health checks

## Available Interfaces

### Interactive UI

- **Main**: [https://genpass.yuriko-aya.cc](https://genpass.yuriko-aya.cc)
- **Version 2**: [https://genpass.yuriko-aya.cc/v2/](https://genpass.yuriko-aya.cc/v2/)

### API Endpoints

- **API v1** (plain text): [https://genpass.yuriko-aya.cc/api/](https://genpass.yuriko-aya.cc/api/)
- **API v2** (plain text): [https://genpass.yuriko-aya.cc/api_v2/](https://genpass.yuriko-aya.cc/api_v2/)
- **JSON custom**: `POST /api/generate`
- **JSON v2**: `POST /api/generate/v2`

## Project Structure

```
genpass/
├── index.html              # GitHub Pages redirect → live site
├── v2/index.html           # GitHub Pages redirect
├── api/index.html          # GitHub Pages redirect
├── api_v2/index.html       # GitHub Pages redirect
└── flask-app/              # Flask application (source of truth)
    ├── app.py
    ├── password_generator.py
    ├── templates/
    ├── static/
    ├── Dockerfile
    └── docker-compose.yml
```

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for more detail.

## Local Development

```bash
git clone https://github.com/yuriko-aya/genpass.git
cd genpass/flask-app
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
./run_dev.sh
```

Visit [http://localhost:5000](http://localhost:5000).

### Production / Docker

```bash
cd flask-app
./run_prod.sh          # Gunicorn on port 8000
# or
docker-compose up      # Docker on port 8000
```

## Security

- Server-side generation with Python `secrets`
- Guaranteed character-class coverage when types are enabled
- Letter-only passwords are rejected by the API
- Rate limiting on API endpoints
- Security headers (CSP, X-Frame-Options, etc.)
- HTML escaping in the UI
- Passwords are not stored

### Privacy note

Passwords are generated on the server and transmitted to your browser over HTTPS. They are never stored, but the plaintext password does travel over the network during generation. If you need passwords that never leave your device, use an offline generator instead.

## Testing

```bash
cd flask-app
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pytest
```

## Author

**yuriko-aya**
- GitHub: [@yuriko-aya](https://github.com/yuriko-aya)
