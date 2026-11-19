import { generateCustomPassword, validatePasswordStrength } from './password.js';
import {
  copyPassword,
  displayPassword,
  showCopyFeedback,
  showPasswordStrength,
} from './genpass.js';

function updateLengthDisplay() {
  const length = document.getElementById('password-length').value;
  document.getElementById('length-display').textContent = length;
}

function generate() {
  const length = parseInt(document.getElementById('password-length').value, 10);
  const includeUppercase = document.getElementById('include-uppercase').checked;
  const includeLowercase = document.getElementById('include-lowercase').checked;
  const includeNumbers = document.getElementById('include-numbers').checked;
  const includeSymbols = document.getElementById('include-symbols').checked;
  const addHyphens = document.getElementById('add-hyphens').checked;

  if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
    showCopyFeedback('Please select at least one character type.', true);
    return;
  }

  if (!includeNumbers && !includeSymbols) {
    showCopyFeedback('Enable numbers or symbols — letter-only passwords are too weak.', true);
    return;
  }

  try {
    const password = generateCustomPassword({
      length,
      includeUppercase,
      includeLowercase,
      includeNumbers,
      includeSymbols,
      addHyphens,
    });
    displayPassword(password);
    showPasswordStrength(validatePasswordStrength(password));
  } catch (error) {
    console.error('Error generating password:', error);
    showCopyFeedback(error.message || 'Error generating password. Please try again.', true);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('password-length').addEventListener('input', updateLengthDisplay);
  document.getElementById('main-button').addEventListener('click', generate);
  document.getElementById('left-button').addEventListener('click', generate);
  document.getElementById('copy-button').addEventListener('click', copyPassword);
});
