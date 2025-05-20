require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerceWeb';

// Define basic schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  isAdmin: Boolean,
});

const categorySchema = new mongoose.Schema({
  name: String,
  description: String,
});

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  stock: Number,
  image: String,
});

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: Number,
    },
  ],
  total: Number,
  status: String,
  createdAt: { type: Date, default: Date.now },
});

// Create models
const User = mongoose.model('User', userSchema);
const Category = mongoose.model('Category', categorySchema);
const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Optionally, clear collections
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin', 10);
    const userPassword = await bcrypt.hash('user', 10);
    const soufianePassword = await bcrypt.hash('123456', 10);

    // Optionally, create some initial data
    const defaultCategory = await Category.create({ name: 'Default', description: 'Default category' });
    const adminUser = await User.create({ name: 'Admin', email: 'admin@example.com', password: adminPassword, isAdmin: true });
    const normalUser = await User.create({ name: 'User', email: 'user@example.com', password: userPassword, isAdmin: false });
    const soufianeUser = await User.create({ name: 'soufiane', email: 'soufiane@gmail.com', password: soufianePassword, isAdmin: true });
    const sampleProduct = await Product.create({
      name: 'Sample Product',
      description: 'A sample product',
      price: 9.99,
      category: defaultCategory._id,
      stock: 100,
      image: '',
    });
    await Order.create({
      user: adminUser._id,
      products: [{ product: sampleProduct._id, quantity: 1 }],
      total: 9.99,
      status: 'pending',
    });

    console.log('Database seeded!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed(); 