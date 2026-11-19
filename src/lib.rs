mod password;

use std::collections::HashMap;
use std::net::SocketAddr;
use std::path::{Component, Path as FsPath, PathBuf};
use std::sync::Mutex;
use std::time::{Duration, Instant};

use axum::body::Body;
use axum::extract::connect_info::ConnectInfo;
use axum::extract::Path as UrlPath;
use axum::http::{header, HeaderValue, Request, StatusCode};
use axum::middleware::{self, Next};
use axum::response::{IntoResponse, Response};
use axum::routing::get;
use axum::Router;
use serde_json::json;

pub use password::{make_password, make_password_v2};

const CSP: &str = "\
default-src 'self'; \
script-src 'self' https://cdn.jsdelivr.net; \
style-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; \
img-src 'self' data:; \
font-src 'self' https://cdn.jsdelivr.net; \
connect-src 'self'; \
frame-ancestors 'none'; \
base-uri 'self'";

struct RateLimiter {
    limit: u32,
    window: Duration,
    hits: Mutex<HashMap<String, Vec<Instant>>>,
}

impl RateLimiter {
    fn from_env() -> Self {
        Self {
            limit: parse_rate_limit(std::env::var("RATE_LIMIT_API").ok().as_deref()),
            window: Duration::from_secs(60),
            hits: Mutex::new(HashMap::new()),
        }
    }

    fn allow(&self, key: &str) -> bool {
        let mut hits = self.hits.lock().unwrap_or_else(|err| err.into_inner());
        let now = Instant::now();
        let window = self.window;
        let entry = hits.entry(key.to_string()).or_default();
        entry.retain(|seen| now.saturating_duration_since(*seen) < window);
        if entry.len() as u32 >= self.limit {
            return false;
        }
        entry.push(now);
        true
    }
}

fn parse_rate_limit(value: Option<&str>) -> u32 {
    let Some(value) = value.map(str::trim).filter(|value| !value.is_empty()) else {
        return 30;
    };
    if let Ok(limit) = value.parse::<u32>() {
        return limit.max(1);
    }
    let mut parts = value.split_whitespace();
    match (parts.next(), parts.next(), parts.next(), parts.next()) {
        (Some(count), Some("per"), Some("minute"), None) => {
            count.parse::<u32>().unwrap_or(30).max(1)
        }
        _ => 30,
    }
}

fn limiter() -> &'static RateLimiter {
    use std::sync::OnceLock;
    static LIMITER: OnceLock<RateLimiter> = OnceLock::new();
    LIMITER.get_or_init(RateLimiter::from_env)
}

fn client_key(req: &Request<Body>) -> String {
    req.extensions()
        .get::<ConnectInfo<SocketAddr>>()
        .map(|info| info.0.ip().to_string())
        .unwrap_or_else(|| "local".to_string())
}

fn is_api_path(path: &str) -> bool {
    matches!(path, "/api" | "/api/" | "/api_v2" | "/api_v2/")
}

async fn rate_limit_api(req: Request<Body>, next: Next) -> Response {
    if is_api_path(req.uri().path()) && !limiter().allow(&client_key(&req)) {
        return (
            StatusCode::TOO_MANY_REQUESTS,
            json_headers(),
            json!({"error": "Rate limit exceeded. Please try again later."}).to_string(),
        )
            .into_response();
    }
    next.run(req).await
}

async fn security_headers(req: Request<Body>, next: Next) -> Response {
    let mut response = next.run(req).await;
    let headers = response.headers_mut();
    headers.insert(
        header::X_CONTENT_TYPE_OPTIONS,
        HeaderValue::from_static("nosniff"),
    );
    headers.insert(header::X_FRAME_OPTIONS, HeaderValue::from_static("DENY"));
    headers.insert(
        header::REFERRER_POLICY,
        HeaderValue::from_static("strict-origin-when-cross-origin"),
    );
    headers.insert(
        header::CONTENT_SECURITY_POLICY,
        HeaderValue::from_static(CSP),
    );
    response
}

fn json_headers() -> [(header::HeaderName, &'static str); 1] {
    [(header::CONTENT_TYPE, "application/json")]
}

async fn not_found() -> Response {
    (
        StatusCode::NOT_FOUND,
        json_headers(),
        json!({"error": "Not found"}).to_string(),
    )
        .into_response()
}

async fn html_page(path: &str) -> Response {
    match tokio::fs::read_to_string(path).await {
        Ok(body) => (
            StatusCode::OK,
            [(header::CONTENT_TYPE, "text/html; charset=utf-8")],
            body,
        )
            .into_response(),
        Err(_) => not_found().await,
    }
}

async fn index() -> Response {
    html_page("static/index.html").await
}

async fn v2() -> Response {
    html_page("static/v2/index.html").await
}

fn plain_password(result: Result<String, password::PasswordError>) -> Response {
    match result {
        Ok(password) => (
            StatusCode::OK,
            [(header::CONTENT_TYPE, "text/plain; charset=utf-8")],
            password,
        )
            .into_response(),
        Err(error) => {
            eprintln!("password generation failed: {}", error.0);
            (
                StatusCode::INTERNAL_SERVER_ERROR,
                [(header::CONTENT_TYPE, "text/plain; charset=utf-8")],
                "ERROR_GENERATION_FAILED",
            )
                .into_response()
        }
    }
}

async fn api_v1() -> Response {
    plain_password(make_password(32, false))
}

async fn api_v2() -> Response {
    plain_password(make_password_v2(16))
}

fn content_type_for(path: &FsPath) -> &'static str {
    match path.extension().and_then(|ext| ext.to_str()) {
        Some("css") => "text/css; charset=utf-8",
        Some("js" | "mjs") => "text/javascript; charset=utf-8",
        Some("html") => "text/html; charset=utf-8",
        Some("json") => "application/json",
        Some("svg") => "image/svg+xml",
        Some("png") => "image/png",
        Some("jpg" | "jpeg") => "image/jpeg",
        Some("webp") => "image/webp",
        Some("ico") => "image/x-icon",
        Some("txt") => "text/plain; charset=utf-8",
        _ => "application/octet-stream",
    }
}

fn resolve_static(rel: &str) -> Option<PathBuf> {
    if rel.is_empty() || rel.contains('\0') {
        return None;
    }
    let relative = FsPath::new(rel);
    if relative.is_absolute()
        || relative
            .components()
            .any(|component| component == Component::ParentDir)
    {
        return None;
    }
    let root = FsPath::new("static").canonicalize().ok()?;
    let full = root.join(relative);
    if full.is_file() {
        let canonical = full.canonicalize().ok()?;
        if canonical.starts_with(&root) {
            return Some(canonical);
        }
    }
    None
}

async fn static_file(UrlPath(path): UrlPath<String>) -> Response {
    let Some(file) = resolve_static(&path) else {
        return not_found().await;
    };
    match tokio::fs::read(&file).await {
        Ok(bytes) => (
            StatusCode::OK,
            [(header::CONTENT_TYPE, content_type_for(&file))],
            bytes,
        )
            .into_response(),
        Err(_) => not_found().await,
    }
}

pub fn app() -> Router {
    Router::new()
        .route("/", get(index))
        .route("/v2", get(v2))
        .route("/v2/", get(v2))
        .route("/api", get(api_v1))
        .route("/api/", get(api_v1))
        .route("/api_v2", get(api_v2))
        .route("/api_v2/", get(api_v2))
        .route("/static/{*path}", get(static_file))
        .fallback(not_found)
        .layer(middleware::from_fn(rate_limit_api))
        .layer(middleware::from_fn(security_headers))
}

#[cfg(test)]
mod tests {
    use super::parse_rate_limit;

    #[test]
    fn rate_limit_defaults_and_parses_per_minute() {
        assert_eq!(parse_rate_limit(None), 30);
        assert_eq!(parse_rate_limit(Some("")), 30);
        assert_eq!(parse_rate_limit(Some("15")), 15);
        assert_eq!(parse_rate_limit(Some("45 per minute")), 45);
        assert_eq!(parse_rate_limit(Some("nope")), 30);
    }
}
