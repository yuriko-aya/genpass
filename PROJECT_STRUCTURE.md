# GenPass - Project Structure

## Root (GitHub Pages redirects)

Static redirect pages only. Each file sends visitors to [genpass.yuriko-aya.cc](https://genpass.yuriko-aya.cc):

- `index.html` → `/`
- `v2/index.html` → `/v2/`
- `api/index.html` → `/api/`
- `api_v2/index.html` → `/api_v2/`

The running server does not use these files. Its pages live in `static/`.

## Application

A Rust server serves the UI and the plaintext APIs. The interactive pages generate passwords in the browser.

```
genpass/
├── Cargo.toml
├── src/
│   ├── main.rs             # Process entry; binds PORT (default 8000)
│   ├── lib.rs              # Routes, security headers, API rate limit
│   └── password.rs         # API password generation
├── static/
│   ├── index.html          # Main UI
│   ├── v2/index.html       # Version 2 UI
│   ├── css/style.css
│   └── js/
│       ├── password.js     # Browser generator and strength scoring
│       ├── genpass.js      # Copy, display, and strength bar
│       ├── index.js
│       └── v2.js
├── tests/
│   ├── api.rs              # HTTP tests
│   └── password.test.mjs   # Browser-generator tests
├── Dockerfile
└── docker-compose.yml
```

### Quick Start

```bash
cargo run
```

Open [http://localhost:8000](http://localhost:8000).

See [README.md](README.md) for the API and Docker.
