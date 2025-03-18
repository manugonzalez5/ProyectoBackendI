import express from 'express';
import ProductManager from '../dao/ProductManager.js';

const router = express.Router();

// Ruta para obtener y mostrar productos
router.get('/', async (req, res) => {
    try {
        // Llamada al método estático getProducts
        const products = await ProductManager.getProducts();
        console.log('Productos obtenidos:', products); // Depuración
        res.render('home', { products });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});


// Página de productos en tiempo real
router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await ProductManager.getProducts(); // Llama al método getProducts de la instancia
        res.render('realTimeProducts', { products });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});

export default router;