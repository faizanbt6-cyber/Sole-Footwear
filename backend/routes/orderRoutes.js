const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  trackOrder,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// Using protect middleware conditionally on createOrder inside the controller if we want guest checkout, 
// but for getting orders, it must be protected.

// Public or private (handled in controller)
router.post('/', createOrder);

// Public route for tracking
router.get('/track/:trackingCode', trackOrder);

// Private routes
router.get('/myorders', protect, getMyOrders);
router.get('/', protect, admin, getOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
