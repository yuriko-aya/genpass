import { makePasswordV2, validatePasswordStrength } from './password.js';
import {
  copyPassword,
  displayPassword,
  showCopyFeedback,
  showPasswordStrength,
} from './genpass.js';

function generatePasswordV2() {
  try {
    const password = makePasswordV2(16);
    displayPassword(password);
    showPasswordStrength(validatePasswordStrength(password));
  } catch (error) {
    console.error('Error generating password v2:', error);
    showCopyFeedback('Error generating password. Please try again.', true);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('main-button').addEventListener('click', generatePasswordV2);
  document.getElementById('left-button').addEventListener('click', generatePasswordV2);
  document.getElementById('copy-button').addEventListener('click', copyPassword);
});
