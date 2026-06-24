require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const connectDB = require('./config/db');

const products = [
  {
    frontendId: 'apex-x1',
    name: 'APEX-X1',
    category: 'Signature Runner',
    price: 340,
    badge: 'New Drop',
    rating: 4.8,
    description: 'The APEX-X1 represents the pinnacle of running innovation. Engineered with our proprietary carbon-fiber midsole and responsive energy return technology, these shoes deliver unmatched performance for serious runners.',
    colors: [
      { name: 'Yellow', hex: '#e8ff47' },
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Red', hex: '#ff4d2e' }
    ],
    sizes: ['6', '7', '8', '9', '10', '11', '12', '13', '14'],
    features: ['Carbon-fiber midsole', '25% energy return', 'Lightweight (180g)', 'Breathable upper', 'Durable rubber sole'],
    reviews: [
      { name: 'Alex M.', rating: '★★★★★', text: 'Best running shoes I\'ve ever owned. The comfort is incredible!' },
      { name: 'Jordan K.', rating: '★★★★★', text: 'Performance upgraded my running game. Highly recommend!' },
      { name: 'Casey L.', rating: '★★★★☆', text: 'Great shoes, took a week to break in but now they\'re perfect.' }
    ]
  },
  {
    frontendId: 'blaze-mid',
    name: 'BLAZE MID',
    category: 'Street Edition',
    price: 280,
    badge: 'Popular',
    rating: 4.7,
    description: 'BLAZE MID brings street style to the forefront. A perfect blend of aesthetics and comfort, designed for those who want to make a statement while staying comfortable all day.',
    colors: [
      { name: 'Fire Red', hex: '#ff4d2e' },
      { name: 'White', hex: '#f0ece4' },
      { name: 'Black', hex: '#1a1a1a' }
    ],
    sizes: ['6', '7', '8', '9', '10', '11', '12', '13'],
    features: ['Mid-top support', 'Padded ankle collar', 'Slip-resistant sole', 'Street-ready design', 'All-day comfort'],
    reviews: [
      { name: 'Sam T.', rating: '★★★★★', text: 'Perfect for everyday wear. Looks great and feels even better!' },
      { name: 'Morgan D.', rating: '★★★★★', text: 'The style is unmatched. Definitely turning heads!' },
      { name: 'Riley P.', rating: '★★★★☆', text: 'Comfortable and stylish. My go-to shoe now.' }
    ]
  },
  {
    frontendId: 'void-lo',
    name: 'VOID LO',
    category: 'Limited Series',
    price: 220,
    badge: 'Limited',
    rating: 4.6,
    description: 'VOID LO is a minimalist masterpiece. With clean lines and elegant design, these low-top shoes are perfect for those who prefer understated sophistication.',
    colors: [
      { name: 'Purple', hex: '#c4b5e0' },
      { name: 'Tan', hex: '#d4a574' },
      { name: 'Navy', hex: '#1a1a3e' }
    ],
    sizes: ['6', '7', '8', '9', '10', '11', '12'],
    features: ['Minimalist design', 'Premium materials', 'Lightweight', 'Versatile style', 'Eco-friendly'],
    reviews: [
      { name: 'Alex J.', rating: '★★★★★', text: 'The minimalist design is gorgeous. Pairs with everything!' },
      { name: 'Taylor K.', rating: '★★★★☆', text: 'Beautiful shoes. Quality is top-notch.' },
      { name: 'Casey M.', rating: '★★★★☆', text: 'Love the understated elegance. Highly satisfied.' }
    ]
  },
  {
    frontendId: 'nova-hi',
    name: 'NOVA HI',
    category: 'High Top',
    price: 320,
    badge: 'Performance',
    rating: 4.7,
    description: 'NOVA HI delivers maximum ankle support and stability. Engineered for basketball courts and training, these high-tops combine protection with style for the modern athlete.',
    colors: [
      { name: 'Turquoise', hex: '#47ffe8' },
      { name: 'White', hex: '#f0ece4' },
      { name: 'Black', hex: '#1a1a1a' }
    ],
    sizes: ['6', '7', '8', '9', '10', '11', '12', '13', '14'],
    features: ['Ankle support system', 'Reinforced heel counter', 'Anti-slip outsole', 'Breathable mesh', 'Court-ready performance'],
    reviews: [
      { name: 'Marcus H.', rating: '★★★★★', text: 'Best basketball shoes for the price. Support is incredible!' },
      { name: 'Sophia R.', rating: '★★★★★', text: 'Perfect for training. Never felt more stable!' },
      { name: 'Jordan W.', rating: '★★★★☆', text: 'Great design and performance. Slightly stiff break-in.' }
    ]
  },
  {
    frontendId: 'storm-lo',
    name: 'STORM LO',
    category: 'Casual',
    price: 250,
    badge: 'Trending',
    rating: 4.5,
    description: 'STORM LO brings bold street energy with a weather-resistant design. Built for those who want versatility without compromising on style.',
    colors: [
      { name: 'Magenta', hex: '#ff47e8' },
      { name: 'Grey', hex: '#808080' },
      { name: 'White', hex: '#f0ece4' }
    ],
    sizes: ['6', '7', '8', '9', '10', '11', '12', '13'],
    features: ['Water-resistant upper', 'Durable rubber sole', 'Cushioned insole', 'Bold design', 'All-weather ready'],
    reviews: [
      { name: 'Emma K.', rating: '★★★★★', text: 'Love the bold colors! Extremely versatile.' },
      { name: 'Ryan T.', rating: '★★★★☆', text: 'Great casual shoe. Water resistance is a plus!' },
      { name: 'Phoenix L.', rating: '★★★★☆', text: 'Comfortable for everyday wear. Looks amazing!' }
    ]
  },
  {
    frontendId: 'echo-mid',
    name: 'ECHO MID',
    category: 'Mid Sole',
    price: 290,
    badge: 'New Release',
    rating: 4.6,
    description: 'ECHO MID strikes the perfect balance between casual and athletic. The mid-sole height provides versatility for any occasion while maintaining the SOLE DNA of performance.',
    colors: [
      { name: 'Yellow', hex: '#e8ff47' },
      { name: 'Black', hex: '#1a1a1a' },
      { name: 'Silver', hex: '#c0c0c0' }
    ],
    sizes: ['6', '7', '8', '9', '10', '11', '12', '13'],
    features: ['Mid-height ankle support', 'Balanced cushioning', 'Flexible sole', 'Hybrid design', 'Modern aesthetic'],
    reviews: [
      { name: 'Adrian M.', rating: '★★★★★', text: 'Perfect middle ground between casual and performance shoes!' },
      { name: 'Blake S.', rating: '★★★★☆', text: 'Comfortable all day. Great value!' },
      { name: 'Jamie N.', rating: '★★★★☆', text: 'Loved the design. Best balance Ive found.' }
    ]
  },
  {
    frontendId: 'blaze-hi',
    name: 'BLAZE HI',
    category: 'High Edition',
    price: 350,
    badge: 'Premium',
    rating: 4.8,
    description: 'BLAZE HI is the premium sibling of the BLAZE family. With premium materials and enhanced comfort, this high-top delivers luxury streetwear at its finest.',
    colors: [
      { name: 'Fire Red', hex: '#ff4d2e' },
      { name: 'Cream', hex: '#f0ece4' },
      { name: 'Black', hex: '#2a2a2a' }
    ],
    sizes: ['6', '7', '8', '9', '10', '11', '12', '13'],
    features: ['Premium leather upper', 'Enhanced ankle padding', 'Luxury insole', 'Premium sole', 'Street icon status'],
    reviews: [
      { name: 'Victoria A.', rating: '★★★★★', text: 'Premium quality justifies the price. Love it!' },
      { name: 'Marcus B.', rating: '★★★★★', text: 'These are art. Gorgeous craftsmanship!' },
      { name: 'Elena C.', rating: '★★★★★', text: 'Best shoes Ive ever owned. Worth every penny!' }
    ]
  },
  {
    frontendId: 'blaze-pro',
    name: 'BLAZE PRO',
    category: 'High Edition',
    price: 390,
    badge: 'Exclusive',
    rating: 4.9,
    description: 'BLAZE PRO is the ultimate expression of the BLAZE legacy. Limited production with elite performance features and exclusive materials make this the ultimate collector\'s piece.',
    colors: [
      { name: 'Fire Red', hex: '#cc3d1a' },
      { name: 'Gold', hex: '#ffd700' },
      { name: 'Midnight', hex: '#0a0a0a' }
    ],
    sizes: ['7', '8', '9', '10', '11', '12', '13'],
    features: ['Limited edition', 'Exotic materials', 'Carbon-reinforced', 'Collector serial number', 'VIP exclusivity'],
    reviews: [
      { name: 'Dmitri K.', rating: '★★★★★', text: 'The holy grail of street sneakers. Perfection!' },
      { name: 'Amara O.', rating: '★★★★★', text: 'Unbelievable quality. Worth the wait!' },
      { name: 'Kai Z.', rating: '★★★★★', text: 'These exceeded all expectations. Masterpiece!' }
    ]
  }
];

const seedDB = async () => {
  try {
    await connectDB();
    await Product.deleteMany({}); // clear existing
    await Product.insertMany(products);
    console.log('Database seeded with products!');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedDB();
