// Cryptographically secure random number generator
function getSecureRandom(max) {
    if (window.crypto && window.crypto.getRandomValues) {
        const array = new Uint32Array(1);
        window.crypto.getRandomValues(array);
        return array[0] % max;
    } else {
        // Fallback to Math.random for older browsers
        console.warn('Using Math.random() fallback. Not cryptographically secure.');
        return Math.floor(Math.random() * max);
    }
}

function make_password(length) {
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    var characters_length = characters.length;
    for (var i = 0; i < length; i++) {
        if ((i % 8 === 0) && (i !== 0)) {
            result += '-';
        }
        result += characters.charAt(getSecureRandom(characters_length));
    }
    return result;
}

function make_password_v2(length) {
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789~!@#$%^&*()_-+={[}]|\\:;<,>.?/';
    var result = '';
    var characters_length = characters.length;
    var first_char = make_password(1);
    for (var i = 0; i < length - 1; i++) {
        result += characters.charAt(getSecureRandom(characters_length));
    }
    var full_result = first_char + result;
    return full_result;
}

// Global variable to store the current password for copying
var currentPassword = '';

function copy_password() {
    var passwordToCopy = currentPassword || '';
    
    if (!passwordToCopy) {
        showCopyFeedback("No password to copy. Please generate a password first.");
        return;
    }
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(passwordToCopy).then(function() {
            showCopyFeedback("Password copied successfully!");
        }).catch(function(err) {
            console.error('Failed to copy password: ', err);
            fallbackCopyToClipboard(passwordToCopy);
        });
    } else {
        fallbackCopyToClipboard(passwordToCopy);
    }
}

function fallbackCopyToClipboard(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        var successful = document.execCommand('copy');
        if (successful) {
            showCopyFeedback("Password copied successfully!");
        } else {
            showCopyFeedback("Failed to copy password. Please copy manually.");
        }
    } catch (err) {
        console.error('Fallback copy failed: ', err);
        showCopyFeedback("Failed to copy password. Please copy manually.");
    }
    
    document.body.removeChild(textArea);
}

function showCopyFeedback(message) {
    // Create a toast notification instead of alert
    var toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        z-index: 1000;
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(function() {
        toast.style.opacity = '0';
        setTimeout(function() {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 2000);
}

function escape_html(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function decode_html(html) {
  var txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function generate_password() {
    try {
        var result = make_password(32);
        currentPassword = result; // Store the raw password for copying
        var passwordElement = document.getElementById("generated_password");
        
        passwordElement.classList.add('bg-info', 'display-3');
        passwordElement.innerHTML = escape_html(result);
        
        document.getElementById("copy-button").style.display = 'inline-block';
        document.getElementById("main-button").style.display = 'none';
        document.getElementById("left-button").style.display = 'inline-block';
    } catch (error) {
        console.error('Error generating password:', error);
        showCopyFeedback('Error generating password. Please try again.');
    }
}

function generate_password_v2() {
    try {
        var regex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
        var result;
        var attempts = 0;
        var maxAttempts = 1000; // Prevent infinite loops
        
        do {
            result = make_password_v2(16);
            attempts++;
        } while (!regex.test(result) && attempts < maxAttempts);
        
        if (attempts >= maxAttempts) {
            throw new Error('Failed to generate valid password after maximum attempts');
        }
        
        currentPassword = result; // Store the raw password for copying
        var passwordElement = document.getElementById("generated_password");
        passwordElement.classList.add('bg-info', 'display-3');
        passwordElement.innerHTML = escape_html(result);
        
        document.getElementById("copy-button").style.display = 'inline-block';
        document.getElementById("main-button").style.display = 'none';
        document.getElementById("left-button").style.display = 'inline-block';
    } catch (error) {
        console.error('Error generating password v2:', error);
        showCopyFeedback('Error generating password. Please try again.');
    }
}