import express from 'express';
import ProductManager from '../dao/ProductManager.js';

const router = express.Router();
const productManager = new ProductManager('../data/products.json');

// Página de inicio
router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('home', { products });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Página de productos en tiempo real
router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('realTimeProducts', { products });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

export default router;