import express from 'express';
import { ProductosMongoManager } from '../dao/ProductosMongoManager.js';

const router = express.Router();

// Ruta para obtener y mostrar productos
router.get('/', async (req, res) => {
    try {
        // Llamada al método estático getProducts
        const products = await ProductosMongoManager.get();
        res.render('home', { products });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});


// Página de productos en tiempo real
router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await ProductosMongoManager.get(); // Llama al método getProducts de la instancia
        res.render('realTimeProducts', { products });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});

router.get('/productos/', async (req, res) => {
    let productos= await ProductosMongoManager.get();
    res.render('products', { productos });
});

export default router;