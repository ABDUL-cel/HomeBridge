// Utility to handle local authentication state
function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}

// Automatically render proper navigation bar buttons
document.addEventListener('DOMContentLoaded', () => {
  const navContainer = document.querySelector('.nav-buttons');
  if (!navContainer) return;

  const token = getToken();
  const user = getUser();

  if (token && user) {
    navContainer.innerHTML = `
      <span style="margin-right: 12px; font-weight: 600; font-size: 14px; color: #475569;">
        Hi, ${user.name.split(' ')[0]}
      </span>
      ${
        user.role === 'landlord' || user.role === 'agent'
          ? `<a href="/dashboard.html" style="color: #0284c7; text-decoration: none; font-weight: 600; margin-right: 12px;">Dashboard</a>`
          : ''
      }
      <button onclick="logout()" style="background: #ef4444; color: #fff; border: none; padding: 7px 12px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px;">
        Logout
      </button>
    `;
  } else {
    navContainer.innerHTML = `
      <a href="/login.html" style="color: #0284c7; text-decoration: none; font-weight: 600; margin-right: 12px;">Log in</a>
      <a href="/register.html" style="background: #0284c7; color: #fff; padding: 8px 14px; border-radius: 6px; text-decoration: none; font-weight: 600;">Get Started</a>
    `;
  }
});