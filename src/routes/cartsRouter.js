import CartManager from '../dao/CartManager.js';
import ProductManager from '../dao/ProductManager.js';
import { Router } from 'express';
const router = Router();

// Función para validar IDs
function validateId(id) {
    if (isNaN(id)) {
        throw new Error('El ID debe ser un número válido');
    }
    return parseInt(id);
}

// Crear un nuevo carrito
router.post('/', async (req, res) => {
    try {
        const newCart = await CartManager.addCart({ products: [] });
        res.status(201).json({ data: newCart });
    } catch (err) {
        res.status(500).send({ error: `Error en el servidor: ${err.message}` });
    }
});

// Obtener productos de un carrito específico
router.get('/:cid', async (req, res) => {
    try {
        const cid = validateId(req.params.cid);

        const cart = await CartManager.getCartById(cid);

        if (!cart) {
            return res.status(404).send({ error: `Carrito con id ${cid} no encontrado` });
        }

        res.status(200).json({ data: cart.products });
    } catch (err) {
        res.status(500).send({ error: `Error en el servidor: ${err.message}` });
    }
});

// Agregar producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cid = validateId(req.params.cid);
        const pid = validateId(req.params.pid);
        const { quantity } = req.body;

        // Validar que `quantity` es un número y está en el cuerpo de la solicitud
        if (!quantity || isNaN(quantity) || quantity <= 0) {
            return res.status(400).send({ error: 'La cantidad debe ser un número mayor a 0' });
        }

        // Verificar si el carrito existe
        const cart = await CartManager.getCartById(cid);
        if (!cart) {
            return res.status(404).send({ error: `Carrito con id ${cid} no encontrado` });
        }

        // Verificar si el producto con `pid` existe en la base de datos de productos
        const product = await ProductManager.getProductById(pid);
        if (!product) {
            return res.status(404).send({ error: `Producto con id ${pid} no encontrado` });
        }

        // Buscar si el producto ya está en el carrito
        const productIndex = cart.products.findIndex(product => product.id === pid);

        if (productIndex !== -1) {
            // Si el producto ya está en el carrito, incrementamos la cantidad
            cart.products[productIndex].quantity += quantity;
        } else {
            // Si el producto no está en el carrito, lo agregamos
            cart.products.push({ id: pid, quantity });
        }

        // Actualizamos el carrito en el archivo
        const updatedCart = await CartManager.updateCartById(cid, cart);

        res.status(200).json({ data: updatedCart });
    } catch (err) {
        res.status(500).send({ error: `Error en el servidor: ${err.message}` });
    }
});

export default router;