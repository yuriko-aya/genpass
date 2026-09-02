/**
 * Shared GenPass UI utilities
 */
const GenPass = (function () {
  let currentPassword = '';

  function escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showCopyFeedback(message, isError) {
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${isError ? '#dc3545' : '#28a745'};
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      z-index: 1000;
      transition: opacity 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(function () {
      toast.style.opacity = '0';
      setTimeout(function () {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 2000);
  }

  function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        showCopyFeedback('Password copied successfully!');
      } else {
        showCopyFeedback('Failed to copy password. Please copy manually.', true);
      }
    } catch (err) {
      console.error('Fallback copy failed: ', err);
      showCopyFeedback('Failed to copy password. Please copy manually.', true);
    }

    document.body.removeChild(textArea);
  }

  function copyPassword() {
    if (!currentPassword) {
      showCopyFeedback('No password to copy. Please generate a password first.', true);
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(currentPassword).then(function () {
        showCopyFeedback('Password copied successfully!');
      }).catch(function (err) {
        console.error('Failed to copy password: ', err);
        fallbackCopyToClipboard(currentPassword);
      });
    } else {
      fallbackCopyToClipboard(currentPassword);
    }
  }

  function displayPassword(password) {
    currentPassword = password;

    const passwordElement = document.getElementById('generated_password');
    passwordElement.innerHTML =
      '<code style="font-size: 1.2em; word-break: break-all;">' + escapeHtml(password) + '</code>';
    passwordElement.classList.add('bg-light', 'p-3', 'rounded', 'border', 'animated');

    document.getElementById('copy-button').style.display = 'inline-block';
    document.getElementById('main-button').style.display = 'none';
    document.getElementById('left-button').style.display = 'inline-block';
  }

  function showPasswordStrength(strength) {
    const strengthElement = document.getElementById('password-strength');
    const barElement = document.getElementById('strength-bar');
    const textElement = document.getElementById('strength-text');

    strengthElement.style.display = 'block';
    barElement.style.width = strength.score + '%';
    textElement.textContent =
      'Password Strength: ' + strength.feedback + ' (' + strength.score + '/100)';

    if (strength.score >= 80) {
      barElement.className = 'progress-bar bg-success';
    } else if (strength.score >= 60) {
      barElement.className = 'progress-bar bg-info';
    } else if (strength.score >= 40) {
      barElement.className = 'progress-bar bg-warning';
    } else {
      barElement.className = 'progress-bar bg-danger';
    }
  }

  async function handleGenerateResponse(response) {
    if (!response.ok) {
      const error = await response.json();
      showCopyFeedback(error.error || 'Error generating password. Please try again.', true);
      return null;
    }

    return response.json();
  }

  return {
    copyPassword,
    displayPassword,
    showPasswordStrength,
    showCopyFeedback,
    handleGenerateResponse,
  };
})();
