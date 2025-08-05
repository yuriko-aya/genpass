# GenPass - Password Generator

A client-side password generator web application that creates secure passwords using JavaScript. GenPass offers multiple interfaces and algorithms to suit different password generation needs.

🔗 **Live Demo**: [https://yuriko-aya.github.io/genpass](https://yuriko-aya.github.io/genpass)

## Features

- **Enhanced Password Generation Algorithms**
  - **Version 1**: Customizable length (8-64 chars) with selectable character types and optional hyphens
  - **Version 2**: 16-character passwords with special characters and strength validation
- **Multiple Interfaces**: Interactive UI and API-style endpoints
- **Advanced Customization**: Choose character types, length, and formatting options
- **Password Strength Analysis**: Real-time strength scoring and visual feedback
- **Modern Copy Experience**: Toast notifications instead of intrusive alerts
- **Responsive Design**: Bootstrap-powered mobile-friendly interface
- **Cryptographically Secure**: Uses `crypto.getRandomValues()` when available
- **Client-Side Only**: No server communication, passwords never leave your browser

## Available Interfaces

### Interactive UI
- **Main Interface**: [https://yuriko-aya.github.io/genpass](https://yuriko-aya.github.io/genpass) - Enhanced customizable password generator
- **Version 2 Interface**: [https://yuriko-aya.github.io/genpass/v2](https://yuriko-aya.github.io/genpass/v2) - Advanced algorithm with strength validation

### API-Style Endpoints
- **API v1**: [https://yuriko-aya.github.io/genpass/api](https://yuriko-aya.github.io/genpass/api) - Simple password output (v1)
- **API v2**: [https://yuriko-aya.github.io/genpass/api_v2](https://yuriko-aya.github.io/genpass/api_v2) - Simple password output (v2)

## Password Algorithms

### Version 1 (`make_password` + Custom Generator)
- **Length**: Customizable 8-64 characters
- **Character Set**: Selectable (A-Z, a-z, 0-9, special characters)
- **Format**: Optional hyphens every 8 characters
- **Features**: Real-time strength analysis, custom character type selection
- **Use Case**: Flexible passwords for various security requirements

### Version 2 (`make_password_v2`)
- **Length**: 16 characters
- **Character Set**: A-Z, a-z, 0-9, special characters (`~!@#$%^&*()_-+={[}]|\:;<,>.?/`)
- **Validation**: Ensures password contains uppercase, lowercase, digits, and special characters
- **Use Case**: High-security applications requiring complex passwords

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES5)
- **Styling**: Bootstrap 5.0.2
- **Dependencies**: jQuery 3.6.0
- **Hosting**: GitHub Pages

## Project Structure

```
genpass/
├── index.html           # Main interactive UI (v1)
├── v2/index.html        # Interactive UI with v2 algorithm  
├── api/index.html       # Simple API-style output (v1)
├── api_v2/index.html    # Simple API-style output (v2)
├── src/
│   ├── js/genpass.js    # Core password generation logic
│   └── css/style.css    # Styling for the UI
└── README.md            # Project documentation
```

## Security Features

- **Cryptographically Secure Generation**: Uses `crypto.getRandomValues()` when available, with Math.random() fallback
- **Client-Side Generation**: Passwords are generated entirely in your browser
- **No Data Transmission**: Passwords never leave your device
- **HTML Escaping**: Protection against XSS attacks
- **Error Handling**: Robust error handling with user feedback
- **No Storage**: Passwords are not stored anywhere
- **Strength Validation**: Real-time password strength analysis and scoring

## Usage

### Interactive Interface
1. Visit one of the interactive interfaces
2. **Main Interface**: Customize password length (8-64 characters) and select character types
3. **Version 2**: Generate cryptographically strong 16-character passwords
4. Click "Generate Password" to create a new password
5. View the password strength indicator
6. Copy the password using the "Copy Password" button (shows toast notification)
7. Generate additional passwords as needed

### API-Style Usage
Simply visit the API endpoints to get a password directly displayed on the page. Useful for:
- Embedding in other applications
- Quick password generation
- Automated scripts (with appropriate CORS handling)

## Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/yuriko-aya/genpass.git
   cd genpass
   ```

2. Open `index.html` in a web browser or serve with a local web server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   ```

3. Navigate to `http://localhost:8000` in your browser

## Browser Compatibility

- Modern browsers with JavaScript support
- Clipboard API support for copy functionality
- Bootstrap 5 compatible browsers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test across different browsers
5. Submit a pull request

## License

This project is open source. Feel free to use, modify, and distribute.

## Author

**yuriko-aya**
- GitHub: [@yuriko-aya](https://github.com/yuriko-aya)
- Project: [genpass](https://github.com/yuriko-aya/genpass)