const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const productController = require('../controllers/productController');

// Rotas de Produtos
router.get('/products', productController.getAllProducts);

// Rotas de Pedidos
router.get('/orders', orderController.getAllOrders);
router.post('/orders', orderController.createOrder);
router.patch('/orders/:id/status', orderController.updateOrderStatus);
router.delete('/orders/:id', orderController.deleteOrder);

module.exports = router;