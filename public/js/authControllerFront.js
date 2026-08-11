// Register Form Handler
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    const alertBox = document.getElementById('alertBox');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, password, role }),
      });

      const data = await res.json();

      if (data.success) {
        setSession(data.data.token, data.data);
        if (alertBox) alertBox.innerText = 'Registration successful! Redirecting...';
        setTimeout(() => {
          window.location.href = data.data.role === 'tenant' ? '/properties.html' : '/dashboard.html';
        }, 1200);
      } else {
        if (alertBox) alertBox.innerText = data.message || 'Registration failed';
      }
    } catch (error) {
      if (alertBox) alertBox.innerText = 'Server error. Please try again.';
    }
  });
}

// Login Form Handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const alertBox = document.getElementById('alertBox');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        setSession(data.data.token, data.data);
        if (alertBox) alertBox.innerText = 'Login successful! Redirecting...';
        setTimeout(() => {
          window.location.href = data.data.role === 'tenant' ? '/properties.html' : '/dashboard.html';
        }, 1000);
      } else {
        if (alertBox) alertBox.innerText = data.message || 'Invalid credentials';
      }
    } catch (error) {
      if (alertBox) alertBox.innerText = 'Server error. Please try again.';
    }
  });
}