const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const product = new Product({
      frontendId: req.body.frontendId,
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
      image: req.body.image,
      badge: req.body.badge,
      rating: req.body.rating,
      colors: req.body.colors,
      sizes: req.body.sizes,
      features: req.body.features,
      reviews: req.body.reviews
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const addProductReview = async (req, res) => {
  try {
    const { rating, text, images, date } = req.body;

    const product = await Product.findOne({ frontendId: req.params.id });

    if (product) {
      const review = {
        name: req.user.name,
        rating: String(rating),
        text,
        images,
        date: date || new Date(),
      };

      product.reviews.push(review);

      // Update average rating
      const numReviews = product.reviews.length;
      const totalRating = product.reviews.reduce((acc, item) => {
        let val = parseFloat(item.rating);
        if (isNaN(val)) {
          val = (item.rating.match(/★/g) || []).length || (item.rating.match(/&#9733;/g) || []).length;
          if (val === 0) val = 5;
        }
        return acc + val;
      }, 0);
      product.rating = totalRating / numReviews;

      await product.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ frontendId: req.params.id });

    if (product) {
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  addProductReview,
  deleteProduct,
};
