async function generatePasswordV2() {
  try {
    const response = await fetch('/api/generate/v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await GenPass.handleGenerateResponse(response);
    if (!data) {
      return;
    }

    GenPass.displayPassword(data.password);
    GenPass.showPasswordStrength(data.strength);
  } catch (error) {
    console.error('Error generating password v2:', error);
    GenPass.showCopyFeedback('Error generating password. Please try again.', true);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('main-button').addEventListener('click', generatePasswordV2);
  document.getElementById('left-button').addEventListener('click', generatePasswordV2);
  document.getElementById('copy-button').addEventListener('click', GenPass.copyPassword);
});
