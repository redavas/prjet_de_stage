const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');

// Public route for login
router.post('/login', userController.login);

// Protected logout route
router.post('/logout', auth, userController.logout);

// Protected routes
router.get('/', auth, userController.getUsers);
router.get('/:id', auth, userController.getUserById);
router.post('/', auth, userController.createUser);
router.put('/:id', auth, userController.updateUser);
router.delete('/:id', auth, userController.deleteUser);

// Public route for registration
router.post('/register', userController.register);

module.exports = router; 