console.log('Chargement des variables d\'environnement...');
require('dotenv').config();

// Afficher les variables d'environnement chargées
console.log('Variables d\'environnement:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Définie' : 'Non définie');

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('ERREUR: La clé secrète Stripe n\'est pas définie dans le fichier .env');
  process.exit(1);
}

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const connectDB = require('./db');
const cors = require('cors');

var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var userRouter = require('./routes/user');
var productRouter = require('./routes/product');
var categoryRouter = require('./routes/category');
var orderRouter = require('./routes/order');

var app = express();

connectDB();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors({ origin: 'http://localhost:3001', credentials: true }));

app.use('/', indexRouter);
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/orders', orderRouter);

module.exports = app;
