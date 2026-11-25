//! A tiny scripted HTTP/1.1 server on 127.0.0.1 for tests. Each request is
//! matched to the first route with the same method and path that still has
//! uses left, so concurrent clients and ordered scripts both work.
#![allow(dead_code)]

use std::io::{BufRead, BufReader, Read, Write};
use std::net::{TcpListener, TcpStream};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

#[derive(Debug, Clone)]
pub struct Route {
    method: String,
    path: String,
    status: u16,
    body: String,
    content_type: String,
    delay: Duration,
    remaining: Option<usize>,
}

impl Route {
    pub fn new(method: &str, path: &str) -> Self {
        Self {
            method: method.to_owned(),
            path: path.to_owned(),
            status: 200,
            body: String::new(),
            content_type: "application/json".to_owned(),
            delay: Duration::ZERO,
            remaining: None,
        }
    }

    pub fn status(mut self, status: u16) -> Self {
        self.status = status;
        self
    }

    pub fn json(mut self, body: &str) -> Self {
        self.body = body.to_owned();
        self.content_type = "application/json".to_owned();
        self
    }

    pub fn text(mut self, content_type: &str, body: &str) -> Self {
        self.body = body.to_owned();
        self.content_type = content_type.to_owned();
        self
    }

    pub fn delay(mut self, delay: Duration) -> Self {
        self.delay = delay;
        self
    }

    /// Serves this route `n` times, then falls through to later routes.
    pub fn times(mut self, n: usize) -> Self {
        self.remaining = Some(n);
        self
    }
}

#[derive(Debug, Clone)]
pub struct Recorded {
    pub method: String,
    pub path: String,
    pub headers: Vec<(String, String)>,
    pub body: String,
}

impl Recorded {
    pub fn header(&self, name: &str) -> Option<&str> {
        self.headers
            .iter()
            .find(|(k, _)| k.eq_ignore_ascii_case(name))
            .map(|(_, v)| v.as_str())
    }
}

struct State {
    routes: Vec<Route>,
    requests: Vec<Recorded>,
}

pub struct MockServer {
    port: u16,
    state: Arc<Mutex<State>>,
}

impl MockServer {
    pub fn start(routes: Vec<Route>) -> Self {
        let listener = TcpListener::bind("127.0.0.1:0").expect("bind mock server");
        let port = listener.local_addr().unwrap().port();
        let state = Arc::new(Mutex::new(State {
            routes,
            requests: Vec::new(),
        }));
        let shared = state.clone();
        thread::spawn(move || {
            for stream in listener.incoming().flatten() {
                let state = shared.clone();
                thread::spawn(move || handle(stream, &state));
            }
        });
        Self { port, state }
    }

    pub fn url(&self) -> String {
        format!("http://127.0.0.1:{}", self.port)
    }

    pub fn requests(&self) -> Vec<Recorded> {
        self.state.lock().unwrap().requests.clone()
    }

    pub fn count(&self, method: &str, path: &str) -> usize {
        self.requests()
            .iter()
            .filter(|r| r.method == method && r.path == path)
            .count()
    }
}

fn handle(stream: TcpStream, state: &Mutex<State>) {
    let _ = stream.set_read_timeout(Some(Duration::from_secs(10)));
    let mut reader = BufReader::new(match stream.try_clone() {
        Ok(s) => s,
        Err(_) => return,
    });
    let mut writer = stream;

    let Some(request) = read_request(&mut reader) else {
        return;
    };
    let route = {
        let mut state = state.lock().unwrap();
        state.requests.push(request.clone());
        let found = state.routes.iter_mut().find(|r| {
            r.method == request.method
                && r.path == request.path
                && r.remaining.is_none_or(|n| n > 0)
        });
        found.map(|r| {
            if let Some(n) = r.remaining.as_mut() {
                *n -= 1;
            }
            r.clone()
        })
    };
    let route = route.unwrap_or_else(|| {
        Route::new(&request.method, &request.path)
            .status(599)
            .text("text/plain", "no scripted route")
    });
    if !route.delay.is_zero() {
        thread::sleep(route.delay);
    }
    let response = format!(
        "HTTP/1.1 {} Scripted\r\nContent-Type: {}\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{}",
        route.status,
        route.content_type,
        route.body.len(),
        route.body
    );
    let _ = writer.write_all(response.as_bytes());
    let _ = writer.flush();
}

fn read_request(reader: &mut BufReader<TcpStream>) -> Option<Recorded> {
    let mut line = String::new();
    if reader.read_line(&mut line).ok()? == 0 {
        return None;
    }
    let mut parts = line.split_whitespace();
    let method = parts.next()?.to_owned();
    let path = parts.next()?.to_owned();

    let mut headers = Vec::new();
    loop {
        let mut header = String::new();
        if reader.read_line(&mut header).ok()? == 0 {
            return None;
        }
        let header = header.trim_end();
        if header.is_empty() {
            break;
        }
        if let Some((name, value)) = header.split_once(':') {
            headers.push((name.trim().to_owned(), value.trim().to_owned()));
        }
    }

    let length = headers
        .iter()
        .find(|(k, _)| k.eq_ignore_ascii_case("content-length"))
        .and_then(|(_, v)| v.parse::<usize>().ok())
        .unwrap_or(0);
    let mut body = vec![0; length];
    reader.read_exact(&mut body).ok()?;

    Some(Recorded {
        method,
        path,
        headers,
        body: String::from_utf8_lossy(&body).into_owned(),
    })
}
