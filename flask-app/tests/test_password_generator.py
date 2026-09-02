import re

import pytest

from password_generator import (
    CUSTOM_SYMBOL_CHARS,
    V2_SPECIAL_CHARS,
    generate_custom_password,
    make_password,
    make_password_v2,
    validate_password_strength,
)


def assert_has_from(password, charset):
    assert any(char in charset for char in password)


def test_make_password_guarantees_character_classes():
    password = make_password(16, add_hyphens=False)
    assert len(password) == 16
    assert_has_from(password, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')
    assert_has_from(password, 'abcdefghijklmnopqrstuvwxyz')
    assert_has_from(password, '0123456789')


def test_make_password_optional_hyphens():
    with_hyphens = make_password(16, add_hyphens=True)
    without_hyphens = make_password(16, add_hyphens=False)

    assert '-' in with_hyphens
    assert '-' not in without_hyphens
    assert len(without_hyphens) == 16
    assert len(with_hyphens.replace('-', '')) == 16


def test_make_password_v2_meets_complexity_requirements():
    regex = re.compile(r'^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{16}$')
    for _ in range(50):
        password = make_password_v2(16)
        assert regex.match(password)


def test_generate_custom_password_defaults_include_symbols_and_hyphens():
    password = generate_custom_password(length=16)
    assert_has_from(password, CUSTOM_SYMBOL_CHARS)
    assert '-' in password


def test_generate_custom_password_rejects_letters_only():
    with pytest.raises(ValueError, match='letter-only'):
        generate_custom_password(
            length=16,
            include_numbers=False,
            include_symbols=False,
        )


def test_generate_custom_password_rejects_invalid_length():
    with pytest.raises(ValueError, match='between 8 and 64'):
        generate_custom_password(length=4)


def test_generate_custom_password_rejects_no_character_types():
    with pytest.raises(ValueError, match='At least one character type'):
        generate_custom_password(
            length=16,
            include_uppercase=False,
            include_lowercase=False,
            include_numbers=False,
            include_symbols=False,
        )


def test_validate_password_strength_flags_letters_only():
    result = validate_password_strength('eaRhsdFjkVenjVqZ')
    assert result['score'] <= 45
    assert result['feedback'] == 'Too predictable — enable numbers or symbols'
    assert result['strength'] == 'weak'


def test_validate_password_strength_strong_password():
    result = validate_password_strength('Abcdef1!ghijklmnop')
    assert result['score'] >= 80
    assert result['strength'] == 'strong'


def test_first_character_is_never_symbol():
    for _ in range(100):
        password = make_password_v2(16)
        assert password[0] not in V2_SPECIAL_CHARS

        password = generate_custom_password(length=16, include_symbols=True)
        assert password[0] not in CUSTOM_SYMBOL_CHARS
        assert password[0] != '-'
