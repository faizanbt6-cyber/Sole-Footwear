// ─── CART MANAGEMENT SYSTEM ───────────────────────────────────────

class Cart {
  constructor() {
    this.items = this.loadCart();
    this.updateUI();
  }

  loadCart() {
    const saved = localStorage.getItem('sole_cart');
    return saved ? JSON.parse(saved) : [];
  }

  saveCart() {
    localStorage.setItem('sole_cart', JSON.stringify(this.items));
  }

  addItem(product) {
    const existing = this.items.find(item => item.id === product.id);
    
    if (existing) {
      existing.quantity += 1;
    } else {
      this.items.push({
        ...product,
        quantity: 1
      });
    }
    
    this.saveCart();
    this.updateUI();
    this.showNotification(`${product.name} added to cart`);
  }

  removeItem(id) {
    this.items = this.items.filter(item => item.id !== id);
    this.saveCart();
    this.updateUI();
  }

  updateQuantity(id, quantity) {
    const item = this.items.find(item => item.id === id);
    if (item) {
      item.quantity = Math.max(1, quantity);
      if (item.quantity === 0) {
        this.removeItem(id);
      } else {
        this.saveCart();
        this.updateUI();
      }
    }
  }

  getTotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  clear() {
    this.items = [];
    this.saveCart();
    this.updateUI();
  }

  updateUI() {
    const cartLink = document.querySelector('.cart-link');
    if (cartLink) {
      cartLink.textContent = `Cart (${this.getCount()})`;
    }
    // Also update all cart links across pages
    document.querySelectorAll('.nav-links a').forEach(link => {
      if (link.textContent.includes('Cart')) {
        link.textContent = `Cart (${this.getCount()})`;
      }
    });
  }

  showNotification(message) {
    window.alert(message);
  }
}

// Initialize global cart instance
const cart = new Cart();

// ─── AUTO-ATTACH EVENT LISTENERS ───────────────────────────────────
function initializeCartUI() {
  // Update cart link to be dynamic
  const cartLink = document.querySelector('.cart-link');
  if (cartLink) {
    cartLink.textContent = `Cart (${cart.getCount()})`;
  }
}

// Use event delegation to handle add-to-cart clicks on any button
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.add-to-cart');
  if (!btn) return;
  
  e.preventDefault();
  e.stopPropagation();
  e.stopImmediatePropagation();
  
  const card = btn.closest('.product-card');
  if (!card) return;
  
  const name = card.querySelector('.card-name')?.textContent || 'Product';
  const style = card.querySelector('.card-style')?.textContent || '';
  const priceText = card.querySelector('.card-price')?.textContent || '$0';
  const price = parseFloat(priceText.replace('$', ''));
  
  const product = {
    id: `product-${Date.now()}-${Math.random()}`,
    name: name,
    style: style,
    price: price,
    image: 'Product'
  };
  
  cart.addItem(product);
}, true); // Use capture phase to intercept before other handlers

// Run immediately if DOM is ready, or wait for DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCartUI);
} else {
  initializeCartUI();
}

// ─── ANIMATION KEYFRAMES ──────────────────────────────────────────
const style = document.createElement('style');
style.textContent = `
  @keyframes cartNotifSlideIn {
    from {
      transform: translateX(420px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes cartNotifSlideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(420px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

