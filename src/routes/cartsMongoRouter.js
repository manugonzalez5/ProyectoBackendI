import { Router } from 'express';
import { CartMongoManager } from '../dao/CartMongoManager.js';
import { isValidObjectId } from 'mongoose';
import { ProductosMongoManager } from '../dao/ProductosMongoManager.js';
import { productoModelo } from '../dao/models/productosModelo.js';

export const router = Router();

// Crear un nuevo carrito
router.post('/', async (req, res) => {
    const newCart = await CartMongoManager.createCart();
    res.status(201).json(newCart);
});

// Agregar un producto al carrito (o incrementar cantidad)
router.post('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    if (!isValidObjectId(cid) || !isValidObjectId(pid)) { // Verificar que los IDs sean validos
        return res.status(400).json({ error: 'IDs inválidos' });
    }
    const cartExists = await CartMongoManager.getCartById(cid); // Verificar que el carrito exista
    if (!cartExists) {
        return res.status(404).json({
            status: 'error',
            message: 'Carrito no encontrado',
            cartId: cid
        });
    }
    const productExists = await ProductosMongoManager.getById(pid); // Verificar que el producto exista
    if (!productExists) {
        return res.status(404).json({
            status: 'error',
            message: 'Producto no encontrado',
            productId: pid
        });
    }
    const cart = await CartMongoManager.addProductToCart(cid, pid);
    res.status(200).json(cart);
});

// Obtener un carrito con populate (productos completos)
router.get('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        if (!isValidObjectId(cid)) {
            return res.status(400).json({ error: 'ID de carrito inválido' });
        }
        const cart = await CartMongoManager.getCartWithProducts(cid);
        if (!cart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }
        res.status(200).json(cart);
    } catch (error) {
        console.error('Error al obtener el carrito:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


// Eliminar un producto específico del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const cleanCid = cid.trim();
        const cleanPid = pid.trim();

        // IDs válidos
        if (!isValidObjectId(cleanCid) || !isValidObjectId(cleanPid)) {
            return res.status(400).json({ error: 'IDs inválidos' });
        }

        // Existencia del carrito
        const cartExists = await CartMongoManager.getCartById(cleanCid);
        if (!cartExists) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        // Existencia del producto en el carrito
        const productInCart = cartExists.products.some(item => item.product.equals(cleanPid));
        if (!productInCart) {
            return res.status(404).json({ error: 'El producto no existe en este carrito' });
        }

        // Lógica de eliminación
        const updatedCart = await CartMongoManager.removeProductFromCart(cleanCid, cleanPid);
        res.status(200).json(updatedCart);

    } catch (error) {
        console.error('Error al eliminar producto del carrito:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Actualizar todo el carrito con un nuevo arreglo de productos
router.put('/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        const { products } = req.body;

        // ID del carrito
        if (!isValidObjectId(cid)) {
            return res.status(400).json({ error: 'ID de carrito inválido' });
        }

        // Estructura de `products`
        if (!products || !Array.isArray(products)) {
            return res.status(400).json({ error: 'Formato de productos inválido. Se espera un arreglo.' });
        }

        // Cada producto en el arreglo
        for (const item of products) {
            if (!isValidObjectId(item.product)) {
                return res.status(400).json({ error: `ID de producto inválido: ${item.product}` });
            }
            if (typeof item.quantity !== 'number' || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
                return res.status(400).json({ error: `Cantidad inválida para el producto ${item.product}. Debe ser un entero positivo.` });
            }
        }

        // Existencia del carrito
        const existingCart = await CartMongoManager.getCartById(cid);
        if (!existingCart) {
            return res.status(404).json({ error: 'Carrito no encontrado' });
        }

        // Existencia de los productos
        const productIds = products.map(item => item.product);
        const existingProducts = await productoModelo.find({ _id: { $in: productIds } });
        if (existingProducts.length !== productIds.length) {
            return res.status(404).json({ error: `Los productos con id ${productIds} no existen` });
        }

        // Lógica de actualización
        const updatedCart = await CartMongoManager.updateCartProducts(cid, products);
        res.status(200).json(updatedCart);

    } catch (error) {
        console.error('Error al actualizar el carrito:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Actualizar solo la cantidad de un producto en el carrito
router.put('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
        return res.status(400).json({ error: 'IDs inválidos' });
    }
    const cart = await CartMongoManager.updateProductQuantity(cid, pid, quantity);
    res.status(200).json(cart);
});

// Vaciar el carrito (eliminar todos los productos)
router.delete('/:cid', async (req, res) => {
    const { cid } = req.params;
    if (!isValidObjectId(cid)) {
        return res.status(400).json({ error: 'ID de carrito inválido' });
    }
    const cart = await CartMongoManager.clearCart(cid);
    res.status(200).json(cart);
});

export default router;