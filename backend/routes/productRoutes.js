const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  addProductReview,
  deleteProduct,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, admin, createProduct);
router.post('/:id/reviews', protect, addProductReview);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
