const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

// @route   GET /api/cart
// @desc    Récupérer le panier de l'utilisateur
// @access  Privé
router.get('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', 'name price image countInStock');
    
    if (!cart) {
      return res.status(404).json({ message: 'Panier non trouvé' });
    }
    
    res.json(cart);
  } catch (error) {
    console.error('Erreur lors de la récupération du panier:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   POST /api/cart
// @desc    Ajouter un produit au panier
// @access  Privé
router.post('/', auth, async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  try {
    // Vérifier si le produit existe
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé' });
    }

    // Vérifier le stock
    if (product.countInStock < quantity) {
      return res.status(400).json({ 
        message: `Désolé, seulement ${product.countInStock} articles en stock` 
      });
    }

    // Trouver le panier de l'utilisateur
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      // Créer un nouveau panier s'il n'existe pas
      cart = new Cart({
        user: req.user._id,
        items: [{
          product: productId,
          quantity,
          price: product.price
        }]
      });
    } else {
      // Vérifier si le produit est déjà dans le panier
      const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
      );

      if (itemIndex >= 0) {
        // Mettre à jour la quantité si le produit est déjà dans le panier
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Ajouter un nouveau produit au panier
        cart.items.push({
          product: productId,
          quantity,
          price: product.price
        });
      }
    }

    // Sauvegarder le panier (le middleware pre('save') calculera le total)
    await cart.save();
    
    // Peupler les informations du produit pour la réponse
    await cart.populate('items.product', 'name price image countInStock');
    
    res.status(201).json(cart);
  } catch (error) {
    console.error('Erreur lors de l\'ajout au panier:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   PUT /api/cart/:itemId
// @desc    Mettre à jour la quantité d'un produit dans le panier
// @access  Privé
router.put('/:itemId', auth, async (req, res) => {
  const { quantity } = req.body;

  try {
    // Vérifier que la quantité est valide
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Quantité invalide' });
    }

    // Trouver le panier de l'utilisateur
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Panier non trouvé' });
    }

    // Trouver l'article dans le panier
    const itemIndex = cart.items.findIndex(
      item => item._id.toString() === req.params.itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Article non trouvé dans le panier' });
    }

    // Vérifier le stock
    const product = await Product.findById(cart.items[itemIndex].product);
    if (product.countInStock < quantity) {
      return res.status(400).json({ 
        message: `Désolé, seulement ${product.countInStock} articles en stock` 
      });
    }

    // Mettre à jour la quantité
    cart.items[itemIndex].quantity = quantity;
    
    // Sauvegarder le panier
    await cart.save();
    
    // Peupler les informations du produit pour la réponse
    await cart.populate('items.product', 'name price image countInStock');
    
    res.json(cart);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du panier:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   DELETE /api/cart/:itemId
// @desc    Supprimer un produit du panier
// @access  Privé
router.delete('/:itemId', auth, async (req, res) => {
  try {
    // Trouver le panier de l'utilisateur
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: 'Panier non trouvé' });
    }

    // Filtrer l'article à supprimer
    const initialLength = cart.items.length;
    cart.items = cart.items.filter(
      item => item._id.toString() !== req.params.itemId
    );

    // Vérifier si un article a été supprimé
    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: 'Article non trouvé dans le panier' });
    }

    // Sauvegarder le panier
    await cart.save();
    
    // Peupler les informations du produit pour la réponse
    await cart.populate('items.product', 'name price image countInStock');
    
    res.json(cart);
  } catch (error) {
    console.error('Erreur lors de la suppression du produit du panier:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// @route   DELETE /api/cart
// @desc    Vider le panier
// @access  Privé
router.delete('/', auth, async (req, res) => {
  try {
    // Supprimer le panier de l'utilisateur
    const result = await Cart.deleteOne({ user: req.user._id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Panier non trouvé' });
    }
    
    res.json({ message: 'Panier vidé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du panier:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
