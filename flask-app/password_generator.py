"""
Password generation functions ported from JavaScript to Python
Provides cryptographically secure password generation
"""

import os
import secrets
import string


def get_secure_random(max_value):
    """
    Get a cryptographically secure random number between 0 and max_value-1
    Uses the secrets module which is the recommended way in Python 3.6+
    """
    return secrets.randbelow(max_value)


def make_password(length):
    """
    Generate a password with basic character set
    Optionally adds hyphens every 8 characters
    
    Args:
        length (int): Desired password length
        
    Returns:
        str: Generated password
    """
    characters = string.ascii_letters + string.digits
    result = []
    characters_length = len(characters)
    
    for i in range(length):
        if (i % 8 == 0) and (i != 0):
            result.append('-')
        result.append(characters[get_secure_random(characters_length)])
    
    return ''.join(result)


def make_password_v2(length):
    """
    Generate a v2 password with special characters
    
    Args:
        length (int): Desired password length
        
    Returns:
        str: Generated v2 password
    """
    characters = string.ascii_letters + string.digits + '~!@#$%^&*()_-+={[}]|\\:;<,>.?/'
    result = []
    characters_length = len(characters)
    
    # First character from basic set
    first_char = make_password(1)
    result.append(first_char)
    
    # Rest from full character set
    for i in range(length - 1):
        result.append(characters[get_secure_random(characters_length)])
    
    return ''.join(result)


def generate_custom_password(
    length=32,
    include_uppercase=True,
    include_lowercase=True,
    include_numbers=True,
    include_symbols=False,
    add_hyphens=False
):
    """
    Generate a custom password with specified character types
    
    Args:
        length (int): Desired password length (8-64)
        include_uppercase (bool): Include uppercase letters
        include_lowercase (bool): Include lowercase letters
        include_numbers (bool): Include numbers
        include_symbols (bool): Include special characters
        add_hyphens (bool): Add hyphens every 8 characters
        
    Returns:
        str: Generated custom password
        
    Raises:
        ValueError: If at least one character type is not selected or invalid length
    """
    if length < 8 or length > 64:
        raise ValueError("Password length must be between 8 and 64 characters")
    
    # Build character set
    char_set = ''
    if include_uppercase:
        char_set += string.ascii_uppercase
    if include_lowercase:
        char_set += string.ascii_lowercase
    if include_numbers:
        char_set += string.digits
    if include_symbols:
        char_set += '!@#$%^&*()'
    
    if not char_set:
        raise ValueError("At least one character type must be selected")
    
    # Generate password
    result = []
    char_set_length = len(char_set)
    
    for i in range(length):
        if add_hyphens and (i % 8 == 0) and (i != 0):
            result.append('-')
        result.append(char_set[get_secure_random(char_set_length)])
    
    return ''.join(result)


def validate_password_strength(password):
    """
    Validate password strength based on composition
    
    Args:
        password (str): Password to validate
        
    Returns:
        dict: Validation results with strength score and feedback
    """
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in '~!@#$%^&*()_-+={[}]|\\:;<,>.?/' for c in password)
    
    length = len(password)
    
    strength_score = sum([has_upper, has_lower, has_digit, has_special, length >= 12])
    
    if strength_score >= 4:
        strength = "strong"
    elif strength_score >= 3:
        strength = "medium"
    else:
        strength = "weak"
    
    return {
        'strength': strength,
        'score': strength_score,
        'has_upper': has_upper,
        'has_lower': has_lower,
        'has_digit': has_digit,
        'has_special': has_special,
        'length': length
    }
