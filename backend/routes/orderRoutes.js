const express=require ('express');
const { protect }=require ('../middleware/authMiddleware');
const Order=require ('../models/Order');


const router = express.Router();

// Créer une nouvelle commande
router.post('/', protect, async (req, res) => {
    try {
        const { items, shippingAddress, paymentDetails, customerNote } = req.body;
        
        // Calculer le montant total
        const totalAmount = items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
        
        // Créer la commande
        const newOrder = new Order({
            user: req.userId,
            orderId: req.body.orderId,
            items: items.map(item => ({
                product: item.product.id || item.product._id,
                name: item.product.name,
                quantity: item.quantity,
                price: item.product.price,
                image: item.product.image
            })),
            shippingAddress,
            paymentDetails: {
                ...paymentDetails,
                amount: totalAmount
            },
            totalAmount,
            estimatedDelivery: req.body.estimatedDelivery,
            customerNote: customerNote || '',
            isPaid: true,
            paidAt: new Date()
        });
        
        // Sauvegarder la commande dans la base de données
        const savedOrder = await newOrder.save();
        
        res.status(201).json({
            success: true,
            message: 'Commande créée avec succès',
            order: savedOrder
        });
    } catch (error) {
        console.error('Erreur lors de la création de la commande:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la création de la commande',
            error: error.message
        });
    }
});

// Récupérer les commandes d'un utilisateur
router.get('/user', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.userId })
            .sort({ createdAt: -1 })
            .populate('items.product', 'name price image');
        
        res.status(200).json({
            success: true,
            orders: orders
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des commandes:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des commandes',
            error: error.message
        });
    }
});

// Récupérer une commande spécifique
router.get('/:orderId', protect, async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findOne({
            $or: [
                { _id: orderId, user: req.userId },
                { orderId: orderId, user: req.userId }
            ]
        }).populate('items.product', 'name price image');
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Commande non trouvée'
            });
        }
        
        res.status(200).json({
            success: true,
            order: order
        });
    } catch (error) {
        console.error('Erreur lors de la récupération de la commande:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de la commande',
            error: error.message
        });
    }
});

// Mettre à jour le statut d'une commande
router.put('/:id/status', protect, async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;

        // Vérifier si le statut est valide
        const validStatuses = ['en attente', 'en préparation', 'expédiée', 'livrée', 'annulée'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Statut invalide',
                validStatuses
            });
        }

        // Mettre à jour le statut de la commande
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({
                success: false,
                message: 'Commande non trouvée'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Statut de la commande mis à jour avec succès',
            order: updatedOrder
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du statut',
            error: error.message
        });
    }
});

module.exports = router; 
