const express = require('express');
const { protect, admin } = require('../middleware/auth');
const Order = require('../models/Order');

const router = express.Router();

// Récupérer toutes les commandes (admin)
router.get('/', [protect, admin], async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email')
      .populate('items.product', 'name price image');

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
});

// Mettre à jour le statut d'une commande (admin)
router.put('/:id/status', [protect, admin], async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    order.status = status;
    if (status === 'livrée') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status'
    });
  }
});

// Récupérer les statistiques des commandes (admin)
router.get('/stats', [protect, admin], async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'en attente'] }, 1, 0] } },
          preparing: { $sum: { $cond: [{ $eq: ['$status', 'en préparation'] }, 1, 0] } },
          shipped: { $sum: { $cond: [{ $eq: ['$status', 'expédiée'] }, 1, 0] } },
          delivered: { $sum: { $cond: [{ $eq: ['$status', 'livrée'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'annulée'] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order stats'
    });
  }
});

module.exports = router;
