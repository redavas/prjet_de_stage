const mongoose = require('mongoose');
const Category = require('./backend/models/Category');
require('dotenv').config();

async function checkAndAddCategory() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB...');

    // Vérifier si la catégorie existe déjà
    const existingCategory = await Category.findOne({ name: 'Accessories' });
    
    if (existingCategory) {
      console.log('Category "Accessories" already exists:', existingCategory);
      return;
    }

    // Créer la nouvelle catégorie
    const newCategory = new Category({
      name: 'Accessories',
      description: 'Stylish accessories to complement your look',
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      featured: true
    });

    const savedCategory = await newCategory.save();
    console.log('New category created successfully:', savedCategory);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

checkAndAddCategory();
