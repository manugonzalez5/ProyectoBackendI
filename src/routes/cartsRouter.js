const { CartManager } = require('../dao/CartManager.js');
const { ProductManager } = require('../dao/ProductManager.js');  
const { Router } = require('express');
const router = Router();

// Crear un nuevo carrito
router.post('/', async (req, res) => {
    try {
        const newCart = await CartManager.addCart({ products: [] });
        res.status(201).json({ newCart });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Obtener productos de un carrito específico
router.get('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;

        // Validar que el cid es un número
        if (isNaN(cid)) {
            return res.status(400).send({ error: 'El id del carrito debe ser un número válido' });
        }

        const cart = await CartManager.getCartById(parseInt(cid));

        if (!cart) {
            return res.status(404).send({ error: `Carrito con id ${cid} no encontrado` });
        }

        res.status(200).json({ products: cart.products });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Agregar producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        // Validar que `quantity` es un número y está en el cuerpo de la solicitud
        if (!quantity || isNaN(quantity) || quantity <= 0) {
            return res.status(400).send({ error: 'La cantidad debe ser un número mayor a 0' });
        }

        // Validar que `cid` y `pid` sean números válidos
        if (isNaN(cid) || isNaN(pid)) {
            return res.status(400).send({ error: 'Los ids deben ser números válidos' });
        }

        // Verificar si el carrito existe
        const cart = await CartManager.getCartById(parseInt(cid));
        if (!cart) {
            return res.status(404).send({ error: `Carrito con id ${cid} no encontrado` });
        }

        // Verificar si el producto con `pid` existe en la base de datos de productos
        const product = await ProductManager.getProductById(parseInt(pid)); // Asumo que tienes un ProductManager
        if (!product) {
            return res.status(404).send({ error: `Producto con id ${pid} no encontrado` });
        }

        // Buscar si el producto ya está en el carrito
        const productIndex = cart.products.findIndex(product => product.id === parseInt(pid));

        if (productIndex !== -1) {
            // Si el producto ya está en el carrito, incrementamos la cantidad
            cart.products[productIndex].quantity += quantity;
        } else {
            // Si el producto no está en el carrito, lo agregamos
            cart.products.push({ id: parseInt(pid), quantity });
        }

        // Actualizamos el carrito en el archivo
        const updatedCart = await CartManager.updateCartById(parseInt(cid), cart);  // Llamamos al nuevo método de actualización

        res.status(200).json({ cart: updatedCart });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

module.exports = router;
