//! Cryptographically secure password generation for the plaintext APIs.
//!
//! The character sets, coverage rules, and shuffle match the previous Python
//! generator so `/api/` and `/api_v2/` keep the same shape.

use rand::rngs::OsRng;
use rand::{Rng, TryRngCore};

pub const V2_SPECIAL_CHARS: &str = "~!@#$%^&*()_-+={[}]|\\:;<,>.?/";
pub const V2_REQUIRED_SYMBOL_CHARS: &str = "!@#$%^&*";

const UPPER: &str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER: &str = "abcdefghijklmnopqrstuvwxyz";
const DIGITS: &str = "0123456789";

#[derive(Debug, PartialEq, Eq)]
pub struct PasswordError(pub String);

fn secure_index(max: usize) -> usize {
    OsRng.unwrap_err().random_range(0..max)
}

fn secure_choice(pool: &str) -> char {
    let chars: Vec<char> = pool.chars().collect();
    chars[secure_index(chars.len())]
}

fn secure_shuffle(mut items: Vec<char>) -> Vec<char> {
    for i in (1..items.len()).rev() {
        let j = secure_index(i + 1);
        items.swap(i, j);
    }
    items
}

fn is_symbol(ch: char, symbol_chars: &str) -> bool {
    symbol_chars.chars().any(|candidate| candidate == ch)
}

fn ensure_non_symbol_first(mut chars: Vec<char>, char_set: &str, symbol_chars: &str) -> Vec<char> {
    if symbol_chars.is_empty() || !is_symbol(chars[0], symbol_chars) {
        return chars;
    }

    for i in 1..chars.len() {
        if !is_symbol(chars[i], symbol_chars) {
            chars.swap(0, i);
            return chars;
        }
    }

    let non_symbol: String = char_set
        .chars()
        .filter(|ch| !is_symbol(*ch, symbol_chars))
        .collect();
    if !non_symbol.is_empty() {
        chars[0] = secure_choice(&non_symbol);
    }
    chars
}

fn generate_with_coverage(
    length: usize,
    pools: &[&str],
    char_set: &str,
    symbol_chars: &str,
) -> Result<Vec<char>, PasswordError> {
    if length < pools.len() {
        return Err(PasswordError(format!(
            "Password length must be at least {} for the selected character types",
            pools.len()
        )));
    }

    let mut chars: Vec<char> = pools.iter().copied().map(secure_choice).collect();
    for _ in 0..(length - pools.len()) {
        chars.push(secure_choice(char_set));
    }

    chars = secure_shuffle(chars);
    if !symbol_chars.is_empty() {
        chars = ensure_non_symbol_first(chars, char_set, symbol_chars);
    }
    Ok(chars)
}

fn insert_hyphens(chars: &[char]) -> String {
    let mut result = String::new();
    for (i, ch) in chars.iter().enumerate() {
        if i % 8 == 0 && i != 0 {
            result.push('-');
        }
        result.push(*ch);
    }
    result
}

pub fn make_password(length: usize, add_hyphens: bool) -> Result<String, PasswordError> {
    let characters = format!("{LOWER}{UPPER}{DIGITS}");
    let pools = [UPPER, LOWER, DIGITS];
    let chars = generate_with_coverage(length, &pools, &characters, "")?;
    if add_hyphens {
        Ok(insert_hyphens(&chars))
    } else {
        Ok(chars.into_iter().collect())
    }
}

pub fn make_password_v2(length: usize) -> Result<String, PasswordError> {
    let characters = format!("{LOWER}{UPPER}{DIGITS}{V2_SPECIAL_CHARS}");
    let pools = [UPPER, LOWER, DIGITS, V2_REQUIRED_SYMBOL_CHARS];
    let chars = generate_with_coverage(length, &pools, &characters, V2_SPECIAL_CHARS)?;
    Ok(chars.into_iter().collect())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn assert_has_from(password: &str, charset: &str) {
        assert!(
            password.chars().any(|ch| charset.contains(ch)),
            "{password} missing a character from {charset}"
        );
    }

    #[test]
    fn make_password_guarantees_character_classes() {
        let password = make_password(16, false).unwrap();
        assert_eq!(password.len(), 16);
        assert_has_from(&password, UPPER);
        assert_has_from(&password, LOWER);
        assert_has_from(&password, DIGITS);
    }

    #[test]
    fn make_password_optional_hyphens() {
        let with_hyphens = make_password(16, true).unwrap();
        let without_hyphens = make_password(16, false).unwrap();

        assert!(with_hyphens.contains('-'));
        assert!(!without_hyphens.contains('-'));
        assert_eq!(without_hyphens.len(), 16);
        assert_eq!(with_hyphens.chars().filter(|ch| *ch != '-').count(), 16);
    }

    #[test]
    fn make_password_v2_meets_complexity_requirements() {
        for _ in 0..50 {
            let password = make_password_v2(16).unwrap();
            assert_eq!(password.chars().count(), 16, "{password}");
            assert!(password.chars().any(|ch| ch.is_ascii_digit()), "{password}");
            assert!(
                password
                    .chars()
                    .any(|ch| V2_REQUIRED_SYMBOL_CHARS.contains(ch)),
                "{password}"
            );
            assert!(
                password.chars().any(|ch| ch.is_ascii_lowercase()),
                "{password}"
            );
            assert!(
                password.chars().any(|ch| ch.is_ascii_uppercase()),
                "{password}"
            );
        }
    }

    #[test]
    fn v2_first_character_is_never_a_symbol() {
        for _ in 0..100 {
            let password = make_password_v2(16).unwrap();
            let first = password.chars().next().unwrap();
            assert!(
                !V2_SPECIAL_CHARS.contains(first),
                "{password} starts with a symbol"
            );
        }
    }

    #[test]
    fn api_lengths_match_the_plaintext_endpoints() {
        let v1 = make_password(32, false).unwrap();
        assert_eq!(v1.len(), 32);
        assert!(v1.chars().all(|ch| ch.is_ascii_alphanumeric()));

        let v2 = make_password_v2(16).unwrap();
        assert_eq!(v2.chars().count(), 16);
    }
}
