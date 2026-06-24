const Order = require('../models/Order');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public or Private
const createOrder = async (req, res) => {
  try {
    const {
      userEmail,
      name,
      address,
      paymentMethod,
      items,
      subtotal,
      tax,
      total,
      trackingCode,
    } = req.body;

    if (items && items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    const order = new Order({
      userEmail,
      name,
      address,
      paymentMethod,
      items,
      subtotal,
      tax,
      total,
      trackingCode: trackingCode || 'SL-' + Math.floor(100000 + Math.random() * 900000),
      userId: req.user ? req.user._id : undefined, // Attach user if logged in and token provided
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userEmail: req.user.email });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({});
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findOne({ trackingCode: req.params.id });
    if (order) {
      order.status = req.body.status || order.status;
      order.trackingCode = req.body.trackingCode || order.trackingCode;
      
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Track an order by tracking code
// @route   GET /api/orders/track/:trackingCode
// @access  Public
const trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ trackingCode: req.params.trackingCode });
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  trackOrder,
};
