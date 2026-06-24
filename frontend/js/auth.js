// Authentication System connected to Node.js Backend

var API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000/api' : '/api';

class AuthSystem {
  constructor() {
    this.currentUser = this.loadUser();
    if (document.readyState !== 'loading') {
      this.refreshAuthNavbar();
    } else {
      window.addEventListener('DOMContentLoaded', () => this.refreshAuthNavbar());
    }
  }

  async register(email, password, name) {
    email = email.trim().toLowerCase();
    name = name.trim();

    if (!email || !password || !name) {
      return { success: false, message: 'All fields required' };
    }

    if (password.length < 6) {
      return { success: false, message: 'Password must be at least 6 characters' };
    }

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        this.loginUser(data);
        return { success: true, message: 'Registration successful!' };
      } else {
        return { success: false, message: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Server error. Please try again later.' };
    }
  }

  async login(email, password) {
    email = email.trim().toLowerCase();

    if (!email || !password) {
      return { success: false, message: 'Email and password required' };
    }

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        this.loginUser(data);
        return { success: true, message: 'Login successful!' };
      } else {
        return { success: false, message: data.message || 'Invalid credentials' };
      }
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Server error. Please try again later.' };
    }
  }

  loginUser(user) {
    const sessionUser = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      token: user.token,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('sole_current_user', JSON.stringify(sessionUser));
    this.currentUser = sessionUser;
    window.dispatchEvent(new Event('authChanged'));
  }

  logout() {
    localStorage.removeItem('sole_current_user');
    this.currentUser = null;
    window.dispatchEvent(new Event('authChanged'));
    window.location.href = 'login.html';
  }

  loadUser() {
    const user = localStorage.getItem('sole_current_user');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }

  isAdmin() {
    return this.currentUser && this.currentUser.role === 'admin';
  }

  getCurrentUser() {
    return this.loadUser();
  }

  getToken() {
    const user = this.getCurrentUser();
    return user ? user.token : null;
  }

  refreshAuthNavbar() {
    const navLinks = document.getElementById('nav-links');
    if (!navLinks) return;

    const currentUser = this.getCurrentUser();
    const existingAdminLink = navLinks.querySelector('a[href="admin.html"]');
    const lastLi = navLinks.querySelector('li:last-child');

    if (this.isAdmin()) {
      if (!existingAdminLink) {
        const adminItem = document.createElement('li');
        adminItem.innerHTML = '<a href="admin.html">SOLE admin</a>';
        navLinks.insertBefore(adminItem, lastLi);
      }
    } else if (existingAdminLink) {
      existingAdminLink.parentElement.remove();
    }

    if (currentUser) {
      if (lastLi) {
        lastLi.innerHTML = `<a href="account.html">${currentUser.name}</a>`;
      }
    } else if (lastLi) {
      lastLi.innerHTML = '<a href="login.html">Login</a>';
    }
  }
}

const auth = new AuthSystem();
window.addEventListener('authChanged', () => auth.refreshAuthNavbar());

