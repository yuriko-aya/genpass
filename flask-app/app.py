"""
GenPass - Secure Password Generator
Flask application for password generation with Gunicorn support
"""

import os
import json
from flask import Flask, render_template, jsonify, request
from password_generator import (
    make_password,
    make_password_v2,
    generate_custom_password
)

app = Flask(__name__, 
            static_folder='static',
            static_url_path='/static',
            template_folder='templates')

app.config['JSON_SORT_KEYS'] = False


@app.route('/', methods=['GET'])
def index():
    """Main interactive UI (v1)"""
    return render_template('index.html')


@app.route('/v2/', methods=['GET'])
def v2():
    """Interactive UI with v2 algorithm"""
    return render_template('v2/index.html')


@app.route('/api/', methods=['GET'])
def api_v1():
    """Simple API endpoint - returns v1 password as plain text"""
    try:
        password = make_password(32)
        return password, 200, {'Content-Type': 'text/plain'}
    except Exception as e:
        app.logger.error(f"API v1 error: {e}")
        return "ERROR_GENERATION_FAILED", 500, {'Content-Type': 'text/plain'}


@app.route('/api_v2/', methods=['GET'])
def api_v2():
    """Simple API endpoint - returns v2 password as plain text"""
    try:
        password = make_password_v2(16)
        return password, 200, {'Content-Type': 'text/plain'}
    except Exception as e:
        app.logger.error(f"API v2 error: {e}")
        return "ERROR_GENERATION_FAILED", 500, {'Content-Type': 'text/plain'}


@app.route('/api/generate', methods=['POST'])
def api_generate_custom():
    """API endpoint for custom password generation"""
    try:
        data = request.get_json() or {}
        
        length = data.get('length', 32)
        include_uppercase = data.get('include_uppercase', True)
        include_lowercase = data.get('include_lowercase', True)
        include_numbers = data.get('include_numbers', True)
        include_symbols = data.get('include_symbols', False)
        add_hyphens = data.get('add_hyphens', False)
        
        # Validate length
        if not isinstance(length, int) or length < 8 or length > 64:
            return jsonify({'error': 'Invalid length. Must be between 8 and 64.'}), 400
        
        password = generate_custom_password(
            length=length,
            include_uppercase=include_uppercase,
            include_lowercase=include_lowercase,
            include_numbers=include_numbers,
            include_symbols=include_symbols,
            add_hyphens=add_hyphens
        )
        
        return jsonify({
            'password': password,
            'length': len(password.replace('-', ''))
        }), 200
    except Exception as e:
        app.logger.error(f"API custom generation error: {e}")
        return jsonify({'error': 'Failed to generate password'}), 500


@app.route('/api/generate/v2', methods=['POST'])
def api_generate_v2():
    """API endpoint for v2 password generation"""
    try:
        password = make_password_v2(16)
        return jsonify({
            'password': password,
            'length': len(password)
        }), 200
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


if __name__ == '__main__':
    # Development server
    app.run(
        host='0.0.0.0',
        port=int(os.environ.get('PORT', 5000)),
        debug=os.environ.get('FLASK_ENV') == 'development'
    )
