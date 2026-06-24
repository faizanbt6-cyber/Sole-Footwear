const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  frontendId: {
    type: String, // 'apex-x1'
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  image: {
    type: String, // Assuming we'll fallback to a default image on frontend if missing
    required: false,
  },
  badge: {
    type: String,
  },
  rating: {
    type: Number,
  },
  colors: [
    {
      name: String,
      hex: String,
    }
  ],
  sizes: [String],
  features: [String],
  reviews: [
    {
      name: String,
      rating: String,
      text: String,
      images: [String],
      date: Date,
    }
  ]
}, {
  timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
