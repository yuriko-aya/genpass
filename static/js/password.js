/**
 * Client-side password generation.
 * Character sets and coverage rules match the previous Python generator.
 * Randomness comes from crypto.getRandomValues with rejection sampling.
 */

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const V2_SPECIAL_CHARS = '~!@#$%^&*()_-+={[}]|\\:;<,>.?/';
const CUSTOM_SYMBOL_CHARS = '!@#$%^&*()';
const V2_REQUIRED_SYMBOL_CHARS = '!@#$%^&*';

function secureIndex(max) {
  if (!Number.isInteger(max) || max <= 0 || max > 0x100000000) {
    throw new Error('invalid random range');
  }
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  while (true) {
    crypto.getRandomValues(buf);
    if (buf[0] < limit) {
      return buf[0] % max;
    }
  }
}

function secureChoice(pool) {
  return pool[secureIndex(pool.length)];
}

function secureShuffle(items) {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = secureIndex(i + 1);
    const swap = arr[i];
    arr[i] = arr[j];
    arr[j] = swap;
  }
  return arr;
}

function isSymbol(char, symbolChars) {
  return symbolChars.includes(char);
}

function ensureNonSymbolFirst(chars, charSet, symbolChars) {
  if (!symbolChars || !isSymbol(chars[0], symbolChars)) {
    return chars;
  }

  for (let i = 1; i < chars.length; i += 1) {
    if (!isSymbol(chars[i], symbolChars)) {
      const swap = chars[0];
      chars[0] = chars[i];
      chars[i] = swap;
      return chars;
    }
  }

  const nonSymbol = Array.from(charSet)
    .filter((char) => !symbolChars.includes(char))
    .join('');
  if (nonSymbol) {
    chars[0] = secureChoice(nonSymbol);
  }
  return chars;
}

function generateWithCoverage(length, pools, charSet, symbolChars = '') {
  if (length < pools.length) {
    throw new Error(
      `Password length must be at least ${pools.length} for the selected character types`,
    );
  }

  const chars = pools.map((pool) => secureChoice(pool));
  for (let i = 0; i < length - pools.length; i += 1) {
    chars.push(secureChoice(charSet));
  }

  const shuffled = secureShuffle(chars);
  if (symbolChars) {
    return ensureNonSymbolFirst(shuffled, charSet, symbolChars);
  }
  return shuffled;
}

function insertHyphens(chars) {
  const result = [];
  chars.forEach((char, i) => {
    if (i % 8 === 0 && i !== 0) {
      result.push('-');
    }
    result.push(char);
  });
  return result.join('');
}

function validateCharacterTypes(options) {
  const { includeUppercase, includeLowercase, includeNumbers, includeSymbols } = options;
  if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
    throw new Error('At least one character type must be selected');
  }
  if (!includeNumbers && !includeSymbols) {
    throw new Error('Enable numbers or symbols — letter-only passwords are too weak');
  }
}

export function makePasswordV2(length) {
  const characters = `${LOWER}${UPPER}${DIGITS}${V2_SPECIAL_CHARS}`;
  const pools = [UPPER, LOWER, DIGITS, V2_REQUIRED_SYMBOL_CHARS];
  return generateWithCoverage(length, pools, characters, V2_SPECIAL_CHARS).join('');
}

export function generateCustomPassword({
  length = 32,
  includeUppercase = true,
  includeLowercase = true,
  includeNumbers = true,
  includeSymbols = true,
  addHyphens = true,
} = {}) {
  if (!Number.isInteger(length) || length < 8 || length > 64) {
    throw new Error('Password length must be between 8 and 64 characters');
  }

  validateCharacterTypes({
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
  });

  let charSet = '';
  const pools = [];
  if (includeUppercase) {
    charSet += UPPER;
    pools.push(UPPER);
  }
  if (includeLowercase) {
    charSet += LOWER;
    pools.push(LOWER);
  }
  if (includeNumbers) {
    charSet += DIGITS;
    pools.push(DIGITS);
  }
  if (includeSymbols) {
    charSet += CUSTOM_SYMBOL_CHARS;
    pools.push(CUSTOM_SYMBOL_CHARS);
  }

  const symbolChars = includeSymbols ? CUSTOM_SYMBOL_CHARS : '';
  const chars = generateWithCoverage(length, pools, charSet, symbolChars);
  return addHyphens ? insertHyphens(chars) : chars.join('');
}

export function validatePasswordStrength(password) {
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const length = password.replace(/-/g, '').length;

  let score = 0;
  if (length >= 12) {
    score += 25;
  } else if (length >= 8) {
    score += 15;
  } else {
    score += 5;
  }
  if (hasLower) {
    score += 15;
  }
  if (hasUpper) {
    score += 15;
  }
  if (hasDigit) {
    score += 15;
  }
  if (hasSpecial) {
    score += 25;
  }
  if (length >= 20) {
    score += 5;
  }
  score = Math.min(score, 100);

  let feedback;
  let strength;
  if (!hasDigit && !hasSpecial) {
    score = Math.min(score, 45);
    feedback = 'Too predictable — enable numbers or symbols';
    strength = 'weak';
  } else if (score >= 80) {
    feedback = 'Very Strong';
    strength = 'strong';
  } else if (score >= 60) {
    feedback = 'Strong';
    strength = 'strong';
  } else if (score >= 40) {
    feedback = 'Medium';
    strength = 'medium';
  } else if (score >= 20) {
    feedback = 'Weak';
    strength = 'weak';
  } else {
    feedback = 'Very Weak';
    strength = 'weak';
  }

  return {
    strength,
    score,
    feedback,
    hasUpper,
    hasLower,
    hasDigit,
    hasSpecial,
    length,
  };
}

export const CHARSETS = {
  V2_SPECIAL_CHARS,
  CUSTOM_SYMBOL_CHARS,
  V2_REQUIRED_SYMBOL_CHARS,
};
