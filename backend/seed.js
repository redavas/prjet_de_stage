const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');
const Product = require('./models/Product');
const fs = require('fs');
const path = require('path');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';

// Sample data
const categories = [
  {
    name: 'Clothing',
    description: 'Sustainable and eco-friendly clothing made from organic and recycled materials.',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    featured: true
  },
  {
    name: 'Accessories',
    description: 'Eco-conscious accessories to complement your sustainable lifestyle.',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    featured: true
  }
];

const products = [
  // Clothing Products
  {
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable and eco-friendly t-shirt made from 100% organic cotton. Perfect for everyday wear.',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    stock: 50,
    featured: true
  },
  {
    name: 'Hemp Hoodie',
    description: 'Warm and sustainable hoodie made from hemp fabric. Durable and comfortable for all seasons.',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1556906781-2a6f971eb9f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    stock: 30,
    featured: true
  },
  {
    name: 'Bamboo Socks (3 Pack)',
    description: 'Breathable and antimicrobial socks made from bamboo fiber. Keeps your feet fresh all day.',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1589674780055-9eeb3c3d8f9d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    stock: 100,
    featured: false
  },
  {
    name: 'Recycled Denim Jeans',
    description: 'Stylish jeans made from recycled denim. Durable, comfortable, and eco-friendly.',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    stock: 40,
    featured: true
  },
  
  // Accessories
  {
    name: 'Recycled Leather Wallet',
    description: 'Stylish wallet made from recycled leather and eco-friendly materials.',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    stock: 45,
    featured: true
  },
  {
    name: 'Wooden Sunglasses',
    description: 'Handcrafted wooden sunglasses with UV400 protection. Lightweight and sustainable.',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237ac008?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    stock: 25,
    featured: false
  },
  {
    name: 'Cork Backpack',
    description: 'Lightweight and water-resistant backpack made from sustainable cork.',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    stock: 20,
    featured: true
  },
  {
    name: 'Bamboo Watch',
    description: 'Elegant watch with a bamboo case and recycled metal components.',
    price: 99.99,
    image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    stock: 15,
    featured: false
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });

    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Insert categories
    console.log('Seeding categories...');
    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories`);

    // Get category IDs
    const clothingCategory = createdCategories.find(cat => cat.name === 'Clothing');
    const accessoriesCategory = createdCategories.find(cat => cat.name === 'Accessories');

    // Add category references to products
    const productsWithCategories = products.map((product, index) => {
      // First 4 products are clothing, next 4 are accessories
      const category = index < 4 ? clothingCategory._id : accessoriesCategory._id;
      return { ...product, category };
    });

    // Insert products
    console.log('Seeding products...');
    const createdProducts = await Product.insertMany(productsWithCategories);
    console.log(`Created ${createdProducts.length} products`);

    // Update categories with product references
    const clothingProducts = createdProducts.slice(0, 4).map(p => p._id);
    const accessoriesProducts = createdProducts.slice(4).map(p => p._id);

    await Category.findByIdAndUpdate(clothingCategory._id, {
      $addToSet: { products: { $each: clothingProducts } }
    });

    await Category.findByIdAndUpdate(accessoriesCategory._id, {
      $addToSet: { products: { $each: accessoriesProducts } }
    });

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
