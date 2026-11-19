use std::net::SocketAddr;

#[tokio::main]
async fn main() {
    let port = match listen_port() {
        Ok(port) => port,
        Err(message) => {
            eprintln!("{message}");
            std::process::exit(1);
        }
    };
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    let listener = match tokio::net::TcpListener::bind(addr).await {
        Ok(listener) => listener,
        Err(error) => {
            eprintln!("failed to bind {addr}: {error}");
            std::process::exit(1);
        }
    };

    println!("GenPass listening on http://{addr}");
    if let Err(error) = axum::serve(
        listener,
        genpass::app().into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await
    {
        eprintln!("server error: {error}");
        std::process::exit(1);
    }
}

fn listen_port() -> Result<u16, String> {
    match std::env::var("PORT") {
        Ok(value) if !value.trim().is_empty() => value
            .trim()
            .parse::<u16>()
            .map_err(|_| format!("PORT must be a number, got {value}")),
        _ => Ok(8000),
    }
}
