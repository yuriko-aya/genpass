import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CHARSETS,
  generateCustomPassword,
  makePasswordV2,
  validatePasswordStrength,
} from '../static/js/password.js';

function assertHasFrom(password, charset) {
  assert.ok(
    [...password].some((char) => charset.includes(char)),
    `${password} missing a character from ${charset}`,
  );
}

test('custom passwords include symbols and hyphens by default', () => {
  const password = generateCustomPassword({ length: 16 });
  assertHasFrom(password, CHARSETS.CUSTOM_SYMBOL_CHARS);
  assert.ok(password.includes('-'));
  assert.equal(password.replace(/-/g, '').length, 16);
});

test('custom passwords can omit hyphens and still cover each class', () => {
  const password = generateCustomPassword({ length: 16, addHyphens: false });
  assert.equal(password.length, 16);
  assert.equal(password.includes('-'), false);
  assertHasFrom(password, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  assertHasFrom(password, 'abcdefghijklmnopqrstuvwxyz');
  assertHasFrom(password, '0123456789');
  assertHasFrom(password, CHARSETS.CUSTOM_SYMBOL_CHARS);
});

test('letter-only passwords are rejected', () => {
  assert.throws(
    () => generateCustomPassword({
      length: 16,
      includeNumbers: false,
      includeSymbols: false,
    }),
    /letter-only/,
  );
});

test('invalid lengths and empty character sets are rejected', () => {
  assert.throws(
    () => generateCustomPassword({ length: 4 }),
    /between 8 and 64/,
  );
  assert.throws(
    () => generateCustomPassword({
      length: 16,
      includeUppercase: false,
      includeLowercase: false,
      includeNumbers: false,
      includeSymbols: false,
    }),
    /At least one character type/,
  );
});

test('v2 passwords are 16 characters with every required class', () => {
  const required = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{16}$/;
  for (let i = 0; i < 50; i += 1) {
    const password = makePasswordV2(16);
    assert.match(password, required);
    assert.equal(CHARSETS.V2_SPECIAL_CHARS.includes(password[0]), false);
  }
});

test('custom passwords do not start with a symbol or hyphen', () => {
  for (let i = 0; i < 50; i += 1) {
    const password = generateCustomPassword({ length: 16, includeSymbols: true });
    assert.equal(CHARSETS.CUSTOM_SYMBOL_CHARS.includes(password[0]), false);
    assert.notEqual(password[0], '-');
  }
});

test('strength scoring flags letters-only and strong passwords', () => {
  const weak = validatePasswordStrength('eaRhsdFjkVenjVqZ');
  assert.ok(weak.score <= 45);
  assert.equal(weak.feedback, 'Too predictable — enable numbers or symbols');
  assert.equal(weak.strength, 'weak');

  const strong = validatePasswordStrength('Abcdef1!ghijklmnop');
  assert.ok(strong.score >= 80);
  assert.equal(strong.strength, 'strong');
});
