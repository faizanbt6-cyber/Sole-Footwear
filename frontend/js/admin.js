const adminAuth = new AuthSystem();
const adminStore = new Store();

function ensureAdminAccess() {
  if (!adminAuth.isLoggedIn() || !adminAuth.isAdmin()) {
    document.body.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#080808;color:#f0ece4;font-family:'Syne',sans-serif;">
        <div style="max-width:560px;text-align:center;">
          <h1 style="font-family:'Bebas Neue',sans-serif;font-size:48px;margin-bottom:16px;">Access Denied</h1>
          <p style="margin-bottom:24px;opacity:0.8;">Admin access is required to view this page. Use the administrator credentials and login to continue.</p>
          <div style="margin-bottom:24px;color:#e8ff47;">
             
          </div>
          <a href="login.html" style="background:#e8ff47;color:#080808;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:700;">Go to Login</a>
        </div>
      </div>
    `;
    return false;
  }
  return true;
}

async function renderProductList() {
  const products = await adminStore.getProducts();
  const list = document.getElementById('product-list');
  if (!list) return;

  const rows = Object.values(products).sort((a, b) => a.name.localeCompare(b.name)).map(product => {
    return `
      <div class="admin-card">
        <div>
          <div class="admin-card-title">${product.name}</div>
          <div class="admin-card-meta">ID: ${product.id} • ${product.category} • $${product.price}</div>
        </div>
        <div class="admin-card-actions">
          <button class="remove-btn" onclick="deleteProduct('${product.id}')">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  list.innerHTML = rows || '<div class="empty-state">No shoes found. Add a new product above.</div>';
}

async function renderOrderList() {
  const orders = await adminStore.getOrders();
  const list = document.getElementById('order-list');
  if (!list) return;

  const sortedOrders = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const visibleOrders = sortedOrders;

  const rows = visibleOrders.map(order => {
    return `
      <div class="order-card">
        <div class="order-row">
          <div><strong>Order:</strong> ${order.id}</div>
          <div><strong>Status:</strong> ${order.status}</div>
        </div>
        <div class="order-row">
          <div><strong>Customer:</strong> ${order.name} (${order.userEmail})</div>
          <div><strong>Total:</strong> $${order.total.toFixed(2)}</div>
        </div>
        <div class="order-row">
          <div><strong>Shipping:</strong> ${order.address}</div>
          <div><strong>Method:</strong> ${order.paymentMethod}</div>
        </div>
        <div class="order-row">
          <div><strong>Created:</strong> ${new Date(order.createdAt).toLocaleString()}</div>
          <div><strong>Tracking:</strong> ${order.trackingCode || 'None'}</div>
        </div>
        <div class="order-controls">
          <label>
            Status
            <select id="status-${order.id}">
              <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
              <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
              <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
              <option value="Canceled" ${order.status === 'Canceled' ? 'selected' : ''}>Canceled</option>
            </select>
          </label>
          <label>
            Tracking
            <input id="tracking-${order.id}" type="text" value="${order.trackingCode || ''}" placeholder="Enter tracking code" />
          </label>
          <button class="save-order-btn" onclick="updateOrderStatus('${order.id}')">Save</button>
        </div>
        <div class="order-items">
          ${order.items.map(item => `<div>${item.name} x${item.quantity} — $${(item.price * item.quantity).toFixed(2)}</div>`).join('')}
        </div>
      </div>
    `;
  }).join('');

  list.innerHTML = rows || '<div class="empty-state">No orders yet. Orders will appear here once customers checkout.</div>';
}

async function deleteProduct(id) {
  const confirmed = await soleConfirm('Remove this shoe from the catalog?');
  if (!confirmed) return;
  await adminStore.deleteProduct(id);
  await renderProductList();
  alert('Shoe removed successfully.');
}

async function updateOrderStatus(orderId) {
  const statusSelect = document.getElementById(`status-${orderId}`);
  const trackingInput = document.getElementById(`tracking-${orderId}`);
  if (!statusSelect || !trackingInput) return;

  await adminStore.updateOrder(orderId, {
    status: statusSelect.value,
    trackingCode: trackingInput.value.trim()
  });
  await renderOrderList();
}

function setupProductForm() {
  const form = document.getElementById('product-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = document.getElementById('product-id').value.trim();
    const name = document.getElementById('product-name').value.trim();
    const category = document.getElementById('product-category').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const badge = document.getElementById('product-badge').value.trim();
    const rating = parseFloat(document.getElementById('product-rating').value) || 5;
    const colorsStr = document.getElementById('product-colors').value.trim();
    const sizesStr = document.getElementById('product-sizes').value.trim();
    const featuresStr = document.getElementById('product-features').value.trim();
    const description = document.getElementById('product-description').value.trim();
    const modelInput = document.getElementById('product-model');

    const colors = colorsStr ? colorsStr.split(',').map(c => ({ name: c.trim(), hex: '#777' })) : [];
    const sizes = sizesStr ? sizesStr.split(',').map(s => s.trim()) : [];
    const features = featuresStr ? featuresStr.split(',').map(f => f.trim()) : [];

    const saveProduct = async () => {
      let modelPath = '';
      if (modelInput.files[0]) {
        await adminStore.saveModel(id, modelInput.files[0]);
        modelPath = `blob:${id}`;
      }

      await adminStore.createProduct({
        id,
        name,
        category,
        price,
        badge,
        rating,
        description,
        model: modelPath,
        colors: colors.length ? colors : [{ name: 'Classic', hex: '#f0ece4' }],
        sizes: sizes.length ? sizes : ['8', '9', '10'],
        features: features.length ? features : ['New release', 'Premium fit', 'Responsive cushioning'],
        reviews: []
      });

      form.reset();
      await renderProductList();
      alert('Shoe added successfully.');
    };

    saveProduct();
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  if (!ensureAdminAccess()) return;
  await renderProductList();
  await renderOrderList();
  setupProductForm();
});

// Live Updates: Listen for changes from other tabs (like the user checkout page)
window.addEventListener('storage', (e) => {
  if (e.key === 'sole_orders') {
    renderOrderList();
  }
});

