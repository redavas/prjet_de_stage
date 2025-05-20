import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  }
});

const paymentDetailsSchema = new mongoose.Schema({
  cardLast4: {
    type: String,
    required: true
  },
  cardType: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  transactionId: {
    type: String,
    required: true
  }
});

const shippingAddressSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  postalCode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  }
});


const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  items: [orderItemSchema],
  shippingAddress: shippingAddressSchema,
  paymentDetails: paymentDetailsSchema,
  orderDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['en attente', 'en préparation', 'expédiée', 'livrée', 'annulée'],
    default: 'en attente'
  },
  deliveryStatus: {
    type: String,
    default: 'en préparation'
  },
  estimatedDelivery: {
    type: Date,
    required: true
  },
  customerNote: {
    type: String,
    default: ''
  },
  totalAmount: {
    type: Number,
    required: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAt: {
    type: Date
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  deliveredAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index pour les recherches par orderId et utilisateur
orderSchema.index({ orderId: 1 });
orderSchema.index({ user: 1, orderDate: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
