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
