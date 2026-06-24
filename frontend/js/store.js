var API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000/api' : '/api';

class Store {
  constructor() {
    // Initial sync load for immediate UI rendering, then async updates can happen
    this.products = this.loadLocalProducts();
    this.orders = this.loadLocalOrders();
  }

  loadLocalProducts() {
    const saved = localStorage.getItem('sole_products');
    if (saved) return JSON.parse(saved);
    return Store.defaultProducts();
  }

  loadLocalOrders() {
    const saved = localStorage.getItem('sole_orders');
    return saved ? JSON.parse(saved) : [];
  }

  async getProducts() {
    try {
      const response = await fetch(`${API_BASE}/products?_=${Date.now()}`, { cache: 'no-cache' });
      if (response.ok) {
        const data = await response.json();
        const productsMap = {};
        data.forEach(p => {
          // Normalize backend structure to match frontend
          const id = p.frontendId || p._id;
          productsMap[id] = { ...p, id };
        });
        if (Object.keys(productsMap).length > 0) {
          this.saveProducts(productsMap);
          return productsMap;
        }
      }
    } catch (e) {
      console.error('Failed to fetch products from backend', e);
    }
    return this.loadLocalProducts();
  }

  saveProducts(products) {
    localStorage.setItem('sole_products', JSON.stringify(products));
  }

  async getProductById(id) {
    const products = await this.getProducts();
    return products[id] || null;
  }

  async createProduct(product) {
    try {
      const token = localStorage.getItem('sole_current_user') 
        ? JSON.parse(localStorage.getItem('sole_current_user')).token 
        : null;
      
      const response = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // mapping id to frontendId for backend
        body: JSON.stringify({ ...product, frontendId: product.id })
      });
      if (response.ok) {
        const data = await response.json();
        const id = data.frontendId || data._id;
        const products = this.loadLocalProducts();
        products[id] = { ...data, id };
        this.saveProducts(products);
        return products[id];
      } else {
        console.error('Failed to create product via API');
      }
    } catch (e) {
      console.error(e);
    }
    // Fallback
    const products = this.loadLocalProducts();
    products[product.id] = product;
    this.saveProducts(products);
    return product;
  }

  async deleteProduct(id) {
    const products = this.loadLocalProducts();
    if (products[id]) {
      delete products[id];
      this.saveProducts(products);
      this.deleteModel(id);
    }
    
    // Call backend API
    const token = localStorage.getItem('sole_current_user') ? JSON.parse(localStorage.getItem('sole_current_user')).token : null;
    if (token) {
      try {
        await fetch(`${API_BASE}/products/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (e) {
        console.error('Failed to delete product on backend', e);
      }
    }
  }

  // Simplified getOrders to use API
  async getOrders() {
    try {
      const token = localStorage.getItem('sole_current_user') 
        ? JSON.parse(localStorage.getItem('sole_current_user')).token 
        : null;
      
      if (!token) return this.loadLocalOrders();
      
      // Try fetching all orders if admin, otherwise user's orders
      const user = JSON.parse(localStorage.getItem('sole_current_user'));
      const endpoint = (user.role === 'admin' || user.email === 'admin@sole.com') ? `${API_BASE}/orders` : `${API_BASE}/orders/myorders`;

      const response = await fetch(`${endpoint}?t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        // map backend _id to id
        const formatted = Array.isArray(data) ? data.map(o => ({ ...o, id: o.trackingCode || o._id })) : [];
        this.saveOrders(formatted);
        return formatted;
      }
    } catch (e) {
      console.error(e);
    }
    return this.loadLocalOrders();
  }

  saveOrders(orders) {
    localStorage.setItem('sole_orders', JSON.stringify(orders));
  }

  async createOrder(order) {
    try {
      const token = localStorage.getItem('sole_current_user') 
        ? JSON.parse(localStorage.getItem('sole_current_user')).token 
        : null;
        
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(order)
      });
      
      if (!response.ok) {
        console.error('Failed to create order on backend');
      }
      
      const data = await response.json();
      const newOrder = { ...data, id: data.trackingCode || data._id };
      
      const orders = this.loadLocalOrders();
      orders.unshift(newOrder);
      this.saveOrders(orders);
      
      return newOrder;
    } catch (e) {
      console.error(e);
      const orders = this.loadLocalOrders();
      orders.unshift(order);
      this.saveOrders(orders);
      return { ...order, message: "Network error: " + e.message };
    }
  }

  async updateOrder(orderId, updates) {
    try {
      const token = localStorage.getItem('sole_current_user') 
        ? JSON.parse(localStorage.getItem('sole_current_user')).token 
        : null;

      const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updated = await response.json();
        const orders = this.loadLocalOrders();
        const index = orders.findIndex(o => o.id === orderId);
        if (index !== -1) {
          orders[index] = { ...updated, id: updated.trackingCode || updated._id };
          this.saveOrders(orders);
        }
        return orders[index];
      }
    } catch (e) {
      console.error('Failed to update order via API', e);
    }
    // Fallback
    const orders = this.loadLocalOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      Object.assign(order, updates);
      this.saveOrders(orders);
    }
    return order;
  }

  // ─── INDEXED DB FOR MODELS ──────────────────────────────
  saveModel(id, file) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('sole_assets', 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('models')) {
          db.createObjectStore('models');
        }
      };
      request.onsuccess = (e) => {
        const db = e.target.result;
        const transaction = db.transaction('models', 'readwrite');
        transaction.objectStore('models').put(file, id);
        transaction.oncomplete = () => resolve(true);
        transaction.onerror = () => reject(false);
      };
      request.onerror = () => reject(false);
    });
  }

  loadModel(id) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('sole_assets', 1);
      request.onsuccess = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('models')) return resolve(null);
        const transaction = db.transaction('models', 'readonly');
        const getReq = transaction.objectStore('models').get(id);
        getReq.onsuccess = () => resolve(getReq.result);
        getReq.onerror = () => resolve(null);
      };
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('models')) {
          db.createObjectStore('models');
        }
      };
      request.onerror = () => resolve(null);
    });
  }

  deleteModel(id) {
    const request = indexedDB.open('sole_assets', 1);
    request.onsuccess = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('models')) return;
      const transaction = db.transaction('models', 'readwrite');
      transaction.objectStore('models').delete(id);
    };
  }

  static defaultProducts() {
    return {
      'apex-x1': {
        id: 'apex-x1', name: 'APEX-X1', category: 'Signature Runner', price: 340, badge: 'New Drop', rating: 4.8, description: 'The APEX-X1 represents the pinnacle of running innovation.',
        colors: [{ name: 'Yellow', hex: '#e8ff47' }, { name: 'Black', hex: '#1a1a1a' }, { name: 'Red', hex: '#ff4d2e' }],
        sizes: ['6', '7', '8', '9', '10', '11', '12', '13', '14'],
        features: ['Carbon-fiber midsole', '25% energy return', 'Lightweight (180g)'],
        reviews: []
      },
      'blaze-mid': {
        id: 'blaze-mid', name: 'BLAZE MID', category: 'Street Edition', price: 280, badge: 'Popular', rating: 4.7, description: 'BLAZE MID brings street style to the forefront.',
        colors: [{ name: 'Fire Red', hex: '#ff4d2e' }, { name: 'White', hex: '#f0ece4' }, { name: 'Black', hex: '#1a1a1a' }],
        sizes: ['6', '7', '8', '9', '10', '11', '12', '13'],
        features: ['Mid-top support', 'Padded ankle collar', 'Slip-resistant sole'],
        reviews: []
      },
      'void-lo': {
        id: 'void-lo', name: 'VOID LO', category: 'Limited Series', price: 220, badge: 'Limited', rating: 4.6, description: 'VOID LO is a minimalist masterpiece.',
        colors: [{ name: 'Purple', hex: '#c4b5e0' }, { name: 'Tan', hex: '#d4a574' }, { name: 'Navy', hex: '#1a1a3e' }],
        sizes: ['6', '7', '8', '9', '10', '11', '12'],
        features: ['Minimalist design', 'Premium materials', 'Lightweight'],
        reviews: []
      },
      'nova-hi': {
        id: 'nova-hi', name: 'NOVA HI', category: 'High Top', price: 320, badge: 'Performance', rating: 4.7, description: 'NOVA HI delivers maximum ankle support and stability.',
        colors: [{ name: 'Turquoise', hex: '#47ffe8' }, { name: 'White', hex: '#f0ece4' }, { name: 'Black', hex: '#1a1a1a' }],
        sizes: ['6', '7', '8', '9', '10', '11', '12', '13', '14'],
        features: ['Ankle support system', 'Reinforced heel counter', 'Anti-slip outsole'],
        reviews: []
      },
      'storm-lo': {
        id: 'storm-lo', name: 'STORM LO', category: 'Casual', price: 250, badge: 'Trending', rating: 4.5, description: 'STORM LO brings bold street energy with a weather-resistant design.',
        colors: [{ name: 'Magenta', hex: '#ff47e8' }, { name: 'Grey', hex: '#808080' }, { name: 'White', hex: '#f0ece4' }],
        sizes: ['6', '7', '8', '9', '10', '11', '12', '13'],
        features: ['Water-resistant upper', 'Durable rubber sole', 'Cushioned insole'],
        reviews: []
      },
      'echo-mid': {
        id: 'echo-mid', name: 'ECHO MID', category: 'Mid Sole', price: 290, badge: 'New Release', rating: 4.6, description: 'ECHO MID strikes the perfect balance between casual and athletic.',
        colors: [{ name: 'Yellow', hex: '#e8ff47' }, { name: 'Black', hex: '#1a1a1a' }, { name: 'Silver', hex: '#c0c0c0' }],
        sizes: ['6', '7', '8', '9', '10', '11', '12', '13'],
        features: ['Mid-height ankle support', 'Balanced cushioning', 'Flexible sole'],
        reviews: []
      },
      'blaze-hi': {
        id: 'blaze-hi', name: 'BLAZE HI', category: 'High Edition', price: 350, badge: 'Premium', rating: 4.8, description: 'BLAZE HI is the premium sibling of the BLAZE family.',
        colors: [{ name: 'Fire Red', hex: '#ff4d2e' }, { name: 'Cream', hex: '#f0ece4' }, { name: 'Black', hex: '#2a2a2a' }],
        sizes: ['6', '7', '8', '9', '10', '11', '12', '13'],
        features: ['Premium leather upper', 'Enhanced ankle padding', 'Luxury insole'],
        reviews: []
      },
      'blaze-pro': {
        id: 'blaze-pro', name: 'BLAZE PRO', category: 'High Edition', price: 390, badge: 'Exclusive', rating: 4.9, description: 'BLAZE PRO is the ultimate expression of the BLAZE legacy.',
        colors: [{ name: 'Fire Red', hex: '#cc3d1a' }, { name: 'Gold', hex: '#ffd700' }, { name: 'Midnight', hex: '#0a0a0a' }],
        sizes: ['7', '8', '9', '10', '11', '12', '13'],
        features: ['Limited edition', 'Exotic materials', 'Carbon-reinforced'],
        reviews: []
      }
    };
  }

  async addReview(productId, review) {
    const token = localStorage.getItem('sole_current_user') 
      ? JSON.parse(localStorage.getItem('sole_current_user')).token 
      : null;
      
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE}/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(review)
      });
      return response.ok;
    } catch (error) {
      console.error('Error adding review:', error);
      return false;
    }
  }
}

// Instantiate globally to avoid duplicate localstorage calls in multiple places
const store = new Store();

