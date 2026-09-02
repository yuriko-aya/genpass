"""
GenPass - Secure Password Generator
Flask application for password generation with Gunicorn support
"""

import os
from flask import Flask, render_template, jsonify, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from password_generator import (
    make_password,
    make_password_v2,
    generate_custom_password,
    validate_password_strength,
)

app = Flask(__name__,
            static_folder='static',
            static_url_path='/static',
            template_folder='templates')

app.config['JSON_SORT_KEYS'] = False

limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=[os.environ.get('RATE_LIMIT_DEFAULT', '200 per hour')],
    storage_uri=os.environ.get('RATE_LIMIT_STORAGE_URI', 'memory://'),
)


@app.after_request
def set_security_headers(response):
    """Apply baseline security headers to all responses."""
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Content-Security-Policy'] = (
        "default-src 'self'; "
        "script-src 'self' https://cdn.jsdelivr.net; "
        "style-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; "
        "img-src 'self' data:; "
        "font-src 'self' https://cdn.jsdelivr.net; "
        "connect-src 'self'; "
        "frame-ancestors 'none'; "
        "base-uri 'self'"
    )
    return response


def _password_response(password):
    """Build a JSON response with password and strength metadata."""
    return jsonify({
        'password': password,
        'length': len(password.replace('-', '')),
        'strength': validate_password_strength(password),
    })


@app.route('/', methods=['GET'])
def index():
    """Main interactive UI (v1)"""
    return render_template('index.html')


@app.route('/v2/', methods=['GET'])
def v2():
    """Interactive UI with v2 algorithm"""
    return render_template('v2/index.html')


@app.route('/api/', methods=['GET'])
@limiter.limit(os.environ.get('RATE_LIMIT_API', '30 per minute'))
def api_v1():
    """Simple API endpoint - returns v1 password as plain text"""
    try:
        password = make_password(32, add_hyphens=False)
        return password, 200, {'Content-Type': 'text/plain'}
    except Exception as e:
        app.logger.error(f"API v1 error: {e}")
        return "ERROR_GENERATION_FAILED", 500, {'Content-Type': 'text/plain'}


@app.route('/api_v2/', methods=['GET'])
@limiter.limit(os.environ.get('RATE_LIMIT_API', '30 per minute'))
def api_v2():
    """Simple API endpoint - returns v2 password as plain text"""
    try:
        password = make_password_v2(16)
        return password, 200, {'Content-Type': 'text/plain'}
    except Exception as e:
        app.logger.error(f"API v2 error: {e}")
        return "ERROR_GENERATION_FAILED", 500, {'Content-Type': 'text/plain'}


@app.route('/api/generate', methods=['POST'])
@limiter.limit(os.environ.get('RATE_LIMIT_API', '30 per minute'))
def api_generate_custom():
    """API endpoint for custom password generation"""
    try:
        data = request.get_json() or {}

        length = data.get('length', 32)
        include_uppercase = data.get('include_uppercase', True)
        include_lowercase = data.get('include_lowercase', True)
        include_numbers = data.get('include_numbers', True)
        include_symbols = data.get('include_symbols', True)
        add_hyphens = data.get('add_hyphens', True)

        if not isinstance(length, int) or length < 8 or length > 64:
            return jsonify({'error': 'Invalid length. Must be between 8 and 64.'}), 400

        password = generate_custom_password(
            length=length,
            include_uppercase=include_uppercase,
            include_lowercase=include_lowercase,
            include_numbers=include_numbers,
            include_symbols=include_symbols,
            add_hyphens=add_hyphens,
        )

        return _password_response(password), 200
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        app.logger.error(f"API custom generation error: {e}")
        return jsonify({'error': 'Failed to generate password'}), 500


@app.route('/api/generate/v2', methods=['POST'])
@limiter.limit(os.environ.get('RATE_LIMIT_API', '30 per minute'))
def api_generate_v2():
    """API endpoint for v2 password generation"""
    try:
        password = make_password_v2(16)
        return _password_response(password), 200
    except Exception as e:
        app.logger.error(f"API v2 generation error: {e}")
        return jsonify({'error': 'Failed to generate password'}), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Not found'}), 404


@app.errorhandler(500)
def server_error(error):
    """Handle 500 errors"""
    app.logger.error(f"Server error: {error}")
    return jsonify({'error': 'Internal server error'}), 500


@app.errorhandler(429)
def rate_limit_exceeded(error):
    """Handle rate limit errors"""
    return jsonify({'error': 'Rate limit exceeded. Please try again later.'}), 429


if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 5000)),
        debug=os.environ.get('FLASK_ENV') == 'development',
    )
