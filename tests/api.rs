use axum::body::Body;
use axum::http::{Request, StatusCode};
use http_body_util::BodyExt;
use tower::ServiceExt;

async fn body_bytes(response: axum::response::Response) -> Vec<u8> {
    response
        .into_body()
        .collect()
        .await
        .expect("body")
        .to_bytes()
        .to_vec()
}

async fn get(path: &str) -> axum::response::Response {
    genpass::app()
        .oneshot(Request::builder().uri(path).body(Body::empty()).unwrap())
        .await
        .unwrap()
}

#[tokio::test]
async fn index_and_v2_pages_are_served() {
    for path in ["/", "/v2/"] {
        let response = get(path).await;
        assert_eq!(response.status(), StatusCode::OK);
        assert_eq!(
            response.headers().get("x-content-type-options").unwrap(),
            "nosniff"
        );
        assert_eq!(response.headers().get("x-frame-options").unwrap(), "DENY");
        assert!(response
            .headers()
            .get("content-security-policy")
            .unwrap()
            .to_str()
            .unwrap()
            .contains("cdn.jsdelivr.net"));
        let html = String::from_utf8(body_bytes(response).await).unwrap();
        assert!(!html.contains("onclick="));
        assert!(!html.contains("oninput="));
        assert!(html.contains("generates your password in the browser"));
    }
}

#[tokio::test]
async fn api_v1_returns_plain_text_password() {
    let response = get("/api/").await;
    assert_eq!(response.status(), StatusCode::OK);
    let content_type = response
        .headers()
        .get("content-type")
        .unwrap()
        .to_str()
        .unwrap();
    assert!(content_type.starts_with("text/plain"));
    let password = String::from_utf8(body_bytes(response).await).unwrap();
    assert_eq!(password.len(), 32);
    assert!(!password.contains('-'));
    assert!(password.chars().all(|ch| ch.is_ascii_alphanumeric()));
}

#[tokio::test]
async fn api_v2_returns_plain_text_password() {
    let response = get("/api_v2/").await;
    assert_eq!(response.status(), StatusCode::OK);
    let content_type = response
        .headers()
        .get("content-type")
        .unwrap()
        .to_str()
        .unwrap();
    assert!(content_type.starts_with("text/plain"));
    let password = String::from_utf8(body_bytes(response).await).unwrap();
    assert_eq!(password.chars().count(), 16);
    assert!(password.chars().any(|ch| ch.is_ascii_uppercase()));
    assert!(password.chars().any(|ch| ch.is_ascii_lowercase()));
    assert!(password.chars().any(|ch| ch.is_ascii_digit()));
    assert!(password.chars().any(|ch| "!@#$%^&*".contains(ch)));
}

#[tokio::test]
async fn unknown_path_is_json_404() {
    let response = get("/missing").await;
    assert_eq!(response.status(), StatusCode::NOT_FOUND);
    let body = String::from_utf8(body_bytes(response).await).unwrap();
    assert_eq!(body, r#"{"error":"Not found"}"#);
}

#[tokio::test]
async fn static_javascript_is_served() {
    let response = get("/static/js/password.js").await;
    assert_eq!(response.status(), StatusCode::OK);
    let content_type = response
        .headers()
        .get("content-type")
        .unwrap()
        .to_str()
        .unwrap();
    assert!(content_type.starts_with("text/javascript"));
    let source = String::from_utf8(body_bytes(response).await).unwrap();
    assert!(source.contains("crypto.getRandomValues"));
}
