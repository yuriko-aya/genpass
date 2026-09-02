import json

import pytest

from app import app


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_api_v1_returns_plain_text_password(client):
    response = client.get('/api/')
    assert response.status_code == 200
    assert response.content_type.startswith('text/plain')
    password = response.get_data(as_text=True)
    assert len(password) == 32
    assert '-' not in password


def test_api_generate_returns_strength_metadata(client):
    response = client.post(
        '/api/generate',
        data=json.dumps({'length': 16}),
        content_type='application/json',
    )
    assert response.status_code == 200
    data = response.get_json()
    assert 'password' in data
    assert 'strength' in data
    assert data['strength']['score'] >= 40


def test_api_generate_rejects_letters_only(client):
    response = client.post(
        '/api/generate',
        data=json.dumps({
            'length': 16,
            'include_numbers': False,
            'include_symbols': False,
        }),
        content_type='application/json',
    )
    assert response.status_code == 400
    assert 'letter-only' in response.get_json()['error']


def test_security_headers_present(client):
    response = client.get('/')
    assert response.headers['X-Content-Type-Options'] == 'nosniff'
    assert response.headers['X-Frame-Options'] == 'DENY'
    assert 'Content-Security-Policy' in response.headers


def test_templates_do_not_use_inline_event_handlers(client):
    for path in ('/', '/v2/'):
        response = client.get(path)
        html = response.get_data(as_text=True)
        assert 'onclick=' not in html
        assert 'oninput=' not in html
