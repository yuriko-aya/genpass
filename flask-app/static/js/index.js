function updateLengthDisplay() {
  const length = document.getElementById('password-length').value;
  document.getElementById('length-display').textContent = length;
}

async function generateCustomPassword() {
  const length = parseInt(document.getElementById('password-length').value, 10);
  const includeUppercase = document.getElementById('include-uppercase').checked;
  const includeLowercase = document.getElementById('include-lowercase').checked;
  const includeNumbers = document.getElementById('include-numbers').checked;
  const includeSymbols = document.getElementById('include-symbols').checked;
  const addHyphens = document.getElementById('add-hyphens').checked;

  if (!includeUppercase && !includeLowercase && !includeNumbers && !includeSymbols) {
    GenPass.showCopyFeedback('Please select at least one character type.', true);
    return;
  }

  if (!includeNumbers && !includeSymbols) {
    GenPass.showCopyFeedback('Enable numbers or symbols — letter-only passwords are too weak.', true);
    return;
  }

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        length,
        include_uppercase: includeUppercase,
        include_lowercase: includeLowercase,
        include_numbers: includeNumbers,
        include_symbols: includeSymbols,
        add_hyphens: addHyphens,
      }),
    });

    const data = await GenPass.handleGenerateResponse(response);
    if (!data) {
      return;
    }

    GenPass.displayPassword(data.password);
    GenPass.showPasswordStrength(data.strength);
  } catch (error) {
    console.error('Error generating password:', error);
    GenPass.showCopyFeedback('Error generating password. Please try again.', true);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('password-length').addEventListener('input', updateLengthDisplay);
  document.getElementById('main-button').addEventListener('click', generateCustomPassword);
  document.getElementById('left-button').addEventListener('click', generateCustomPassword);
  document.getElementById('copy-button').addEventListener('click', GenPass.copyPassword);
});
