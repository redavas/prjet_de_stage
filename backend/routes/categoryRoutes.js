const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const Product = require('../models/Product'); // Added Product model

// Get all categories with product counts
router.get('/', async (req, res) => {
  try {
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $project: {
          name: 1,
          description: 1,
          image: 1,
          slug: 1,
          featured: 1,
          productCount: { $size: '$products' },
          createdAt: 1,
          updatedAt: 1
        }
      },
      { $sort: { name: 1 } }
    ]);

    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get single category with products
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10, page = 1, sort = 'newest' } = req.query;
    
    // Find the category
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Build sort object
    let sortOption = {};
    switch (sort) {
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'newest':
      default:
        sortOption = { createdAt: -1 };
    }

    // Get products in this category with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [products, totalProducts] = await Promise.all([
      Product.find({ category: id })
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('category', 'name slug')
        .lean(),
      Product.countDocuments({ category: id })
    ]);

    res.json({
      success: true,
      data: {
        ...category.toObject(),
        products,
        pagination: {
          total: totalProducts,
          page: parseInt(page),
          pages: Math.ceil(totalProducts / parseInt(limit)),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create category (admin only)
router.post('/', [auth, admin], async (req, res) => {
  try {
    const { name, description, image, featured = false } = req.body;
    
    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }
    
    const category = new Category({
      name,
      description,
      image,
      featured
    });
    
    const savedCategory = await category.save();
    
    res.status(201).json({
      success: true,
      data: savedCategory
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
});

// Update category (admin only)
router.put('/:id', [auth, admin], async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, featured } = req.body;
    
    // Check if category exists
    let category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check if name is being updated and if new name already exists
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }
    
    // Update category
    category.name = name || category.name;
    category.description = description || category.description;
    category.image = image || category.image;
    if (featured !== undefined) category.featured = featured;
    
    const updatedCategory = await category.save();
    
    res.json({
      success: true,
      data: updatedCategory
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
});

// Delete category (admin only)
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check if category has products
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing products. Please remove or reassign products first.'
      });
    }
    
    // Delete the category
    await Category.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting category',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;