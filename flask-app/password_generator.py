"""
Password generation functions ported from JavaScript to Python
Provides cryptographically secure password generation
"""

import re
import secrets
import string

V2_SPECIAL_CHARS = '~!@#$%^&*()_-+={[}]|\\:;<,>.?/'
CUSTOM_SYMBOL_CHARS = '!@#$%^&*()'
V2_REQUIRED_SYMBOL_CHARS = '!@#$%^&*'


def get_secure_random(max_value):
    """
    Get a cryptographically secure random number between 0 and max_value-1
    Uses the secrets module which is the recommended way in Python 3.6+
    """
    return secrets.randbelow(max_value)


def _secure_choice(pool):
    """Pick one character from a pool using a CSPRNG."""
    return pool[get_secure_random(len(pool))]


def _secure_shuffle(items):
    """Shuffle a list in place using Fisher-Yates and a CSPRNG."""
    items = list(items)
    for i in range(len(items) - 1, 0, -1):
        j = get_secure_random(i + 1)
        items[i], items[j] = items[j], items[i]
    return items


def _generate_with_coverage(length, pools, char_set):
    """
    Build a password guaranteed to include at least one character
    from each pool, then fill and shuffle the remaining positions.
    """
    if length < len(pools):
        raise ValueError(
            f"Password length must be at least {len(pools)} for the selected character types"
        )

    chars = [_secure_choice(pool) for pool in pools]
    for _ in range(length - len(pools)):
        chars.append(_secure_choice(char_set))

    return _secure_shuffle(chars)


def _insert_hyphens(chars):
    """Insert hyphens every 8 characters."""
    result = []
    for i, char in enumerate(chars):
        if (i % 8 == 0) and (i != 0):
            result.append('-')
        result.append(char)
    return ''.join(result)


def _validate_character_types(
    include_uppercase,
    include_lowercase,
    include_numbers,
    include_symbols,
):
    """Reject invalid or overly weak character-type combinations."""
    if not any([include_uppercase, include_lowercase, include_numbers, include_symbols]):
        raise ValueError("At least one character type must be selected")
    if not include_numbers and not include_symbols:
        raise ValueError("Enable numbers or symbols — letter-only passwords are too weak")


def make_password(length, add_hyphens=False):
    """
    Generate a password with basic character set

    Args:
        length (int): Desired password length
        add_hyphens (bool): Add hyphens every 8 characters

    Returns:
        str: Generated password
    """
    characters = string.ascii_letters + string.digits
    pools = [string.ascii_uppercase, string.ascii_lowercase, string.digits]
    chars = _generate_with_coverage(length, pools, characters)
    password = ''.join(chars)
    if add_hyphens:
        password = _insert_hyphens(chars)
    return password


def make_password_v2(length):
    """
    Generate a v2 password with special characters

    Args:
        length (int): Desired password length

    Returns:
        str: Generated v2 password
    """
    characters = string.ascii_letters + string.digits + V2_SPECIAL_CHARS
    pools = [
        string.ascii_uppercase,
        string.ascii_lowercase,
        string.digits,
        V2_REQUIRED_SYMBOL_CHARS,
    ]
    return ''.join(_generate_with_coverage(length, pools, characters))


def generate_custom_password(
    length=32,
    include_uppercase=True,
    include_lowercase=True,
    include_numbers=True,
    include_symbols=True,
    add_hyphens=True,
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
        ValueError: If options are invalid or too weak
    """
    if length < 8 or length > 64:
        raise ValueError("Password length must be between 8 and 64 characters")

    _validate_character_types(
        include_uppercase,
        include_lowercase,
        include_numbers,
        include_symbols,
    )

    char_set = ''
    pools = []
    if include_uppercase:
        char_set += string.ascii_uppercase
        pools.append(string.ascii_uppercase)
    if include_lowercase:
        char_set += string.ascii_lowercase
        pools.append(string.ascii_lowercase)
    if include_numbers:
        char_set += string.digits
        pools.append(string.digits)
    if include_symbols:
        char_set += CUSTOM_SYMBOL_CHARS
        pools.append(CUSTOM_SYMBOL_CHARS)

    chars = _generate_with_coverage(length, pools, char_set)
    password = ''.join(chars)
    if add_hyphens:
        password = _insert_hyphens(chars)
    return password


def validate_password_strength(password):
    """
    Validate password strength based on composition

    Args:
        password (str): Password to validate

    Returns:
        dict: Validation results with strength score and feedback
    """
    has_upper = bool(re.search(r'[A-Z]', password))
    has_lower = bool(re.search(r'[a-z]', password))
    has_digit = bool(re.search(r'[0-9]', password))
    has_special = bool(re.search(r'[^A-Za-z0-9]', password))

    length = len(password.replace('-', ''))
    score = 0

    if length >= 12:
        score += 25
    elif length >= 8:
        score += 15
    else:
        score += 5

    if has_lower:
        score += 15
    if has_upper:
        score += 15
    if has_digit:
        score += 15
    if has_special:
        score += 25
    if length >= 20:
        score += 5

    score = min(score, 100)

    if not has_digit and not has_special:
        score = min(score, 45)
        feedback = 'Too predictable — enable numbers or symbols'
        strength = 'weak'
    elif score >= 80:
        feedback = 'Very Strong'
        strength = 'strong'
    elif score >= 60:
        feedback = 'Strong'
        strength = 'strong'
    elif score >= 40:
        feedback = 'Medium'
        strength = 'medium'
    elif score >= 20:
        feedback = 'Weak'
        strength = 'weak'
    else:
        feedback = 'Very Weak'
        strength = 'weak'

    return {
        'strength': strength,
        'score': score,
        'feedback': feedback,
        'has_upper': has_upper,
        'has_lower': has_lower,
        'has_digit': has_digit,
        'has_special': has_special,
        'length': length,
    }
