# GenPass - Password Generator

A password generator with a Rust server and client-side generation in the interactive UI.

🔗 **Live site**: [https://genpass.yuriko-aya.cc](https://genpass.yuriko-aya.cc)

Legacy GitHub Pages URLs redirect to the live site:

| GitHub Pages | Redirects to |
|---|---|
| [yuriko-aya.github.io/genpass](https://yuriko-aya.github.io/genpass) | `/` |
| […/genpass/v2](https://yuriko-aya.github.io/genpass/v2) | `/v2/` |
| […/genpass/api](https://yuriko-aya.github.io/genpass/api) | `/api/` |
| […/genpass/api_v2](https://yuriko-aya.github.io/genpass/api_v2) | `/api_v2/` |

## Features

- **Version 1**: Customizable length (8–64), selectable character types, optional hyphens every 8 characters
- **Version 2**: 16-character passwords with uppercase, lowercase, digits, and symbols
- **Interactive UI** generates passwords in the browser
- **Plaintext API** for scripts: `GET /api/` and `GET /api_v2/`
- **Password strength analysis** with visual feedback
- **Cryptographically secure generation**: `crypto.getRandomValues` in the browser, OS randomness on the API

## Available Interfaces

### Interactive UI

- **Main**: [https://genpass.yuriko-aya.cc](https://genpass.yuriko-aya.cc)
- **Version 2**: [https://genpass.yuriko-aya.cc/v2/](https://genpass.yuriko-aya.cc/v2/)

### API Endpoints

Both endpoints return `text/plain` and are rate limited (default 30 requests per minute per client).

```bash
curl https://genpass.yuriko-aya.cc/api/
curl https://genpass.yuriko-aya.cc/api_v2/
```

- **API v1**: 32 characters from letters and digits, with at least one uppercase letter, one lowercase letter, and one digit
- **API v2**: 16 characters with uppercase, lowercase, a digit, and a symbol from `!@#$%^&*`

## Project Structure

```
genpass/
├── index.html              # GitHub Pages redirect → live site
├── v2/index.html           # GitHub Pages redirect
├── api/index.html          # GitHub Pages redirect
├── api_v2/index.html       # GitHub Pages redirect
├── src/                    # Rust server and API generator
├── static/                 # UI pages, CSS, and browser generator
├── Dockerfile
└── docker-compose.yml
```

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for more detail.

## Local Development

```bash
git clone https://github.com/yuriko-aya/genpass.git
cd genpass
cargo run
```

Visit [http://localhost:8000](http://localhost:8000). Set `PORT` to listen elsewhere.

### Production / Docker

```bash
docker compose up --build
```

The container listens on port 8000.

## Security

- Browser passwords are created with `crypto.getRandomValues` and are not sent to the server
- API passwords are created with OS randomness (`OsRng`)
- Guaranteed character-class coverage when types are enabled
- Letter-only passwords are rejected in the UI
- Rate limiting on `/api/` and `/api_v2/`
- Security headers (CSP, `X-Frame-Options`, and others)
- HTML escaping in the UI
- Passwords are not stored

### Privacy

The interactive pages create the password in your browser. It stays on the device. `GET /api/` and `GET /api_v2/` create a password on the server and return it as plain text for scripts, so that password travels over the connection.

`RATE_LIMIT_API` controls the API limit. Use a number, or a value such as `30 per minute`.

## Testing

```bash
cargo test
node --test tests/password.test.mjs
```

## Author

**yuriko-aya**
- GitHub: [@yuriko-aya](https://github.com/yuriko-aya)
