const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');
const Product = require('./models/Product');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

const sampleProducts = [
  // Clothing Products
  {
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable and eco-friendly t-shirt made from 100% organic cotton.',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    stock: 50
  },
  {
    name: 'Hemp Hoodie',
    description: 'Warm and sustainable hoodie made from hemp fabric.',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1556906781-2a6f971eb9f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    stock: 30
  },
  {
    name: 'Bamboo Socks (3 Pack)',
    description: 'Breathable and antimicrobial socks made from bamboo fiber.',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1589674780055-9eeb3c3d8f9d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    stock: 100
  },
  
  // Accessories
  {
    name: 'Recycled Leather Wallet',
    description: 'Stylish wallet made from recycled leather and eco-friendly materials.',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    stock: 45
  },
  {
    name: 'Wooden Sunglasses',
    description: 'Handcrafted wooden sunglasses with UV400 protection.',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237ac008?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    stock: 25
  },
  {
    name: 'Cork Backpack',
    description: 'Lightweight and water-resistant backpack made from sustainable cork.',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    stock: 20
  }
];

async function seedProducts() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Get categories
    const clothingCategory = await Category.findOne({ name: 'Clothing' });
    const accessoriesCategory = await Category.findOne({ name: 'Accessories' });

    if (!clothingCategory || !accessoriesCategory) {
      throw new Error('Categories not found. Please run seedCategories.js first.');
    }

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Add category references to products
    const productsWithCategories = sampleProducts.map((product, index) => {
      // First 3 products are clothing, next 3 are accessories
      const category = index < 3 ? clothingCategory._id : accessoriesCategory._id;
      return { ...product, category };
    });

    // Insert new products
    const createdProducts = await Product.insertMany(productsWithCategories);
    console.log('Inserted products:', createdProducts);

    // Update categories with product references
    await Category.updateOne(
      { _id: clothingCategory._id },
      { $addToSet: { products: { $each: createdProducts.slice(0, 3).map(p => p._id) } } }
    );

    await Category.updateOne(
      { _id: accessoriesCategory._id },
      { $addToSet: { products: { $each: createdProducts.slice(3).map(p => p._id) } } }
    );

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedProducts();
