import ProductManager from '../dao/ProductManager.js';
import Router from 'express';
const router = Router();
//import io from '../app.js';

// Listado de productos
router.get('/', async (req, res) => {
    try {
        let products = await ProductManager.getProducts();
        res.status(200).json({ data: products });
    } catch (err) {
        res.status(500).send({ error: `Error en el servidor: ${err.message}` });
    }
});

// Buscador de productos por ID
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).send({ error: 'El ID debe ser un número válido' });
        }

        let product = await ProductManager.getProductById(id);
        if (!product) {
            return res.status(404).send({ error: `No existen productos con id ${id}` });
        }

        res.status(200).json({ data: product });
    } catch (err) {
        res.status(500).send({ error: `Error en el servidor: ${err.message}` });
    }
});

// Crear un producto
router.post('/', async (req, res) => {
    try {
        const { title, description, price, status, stock, category, thumbnails } = req.body;

        // Validaciones
        if (!title || !description || !price || !status || !stock || !category || !thumbnails) {
            return res.status(400).send({ error: 'Todos los campos son requeridos' });
        }
        if (isNaN(price) || isNaN(stock)) {
            return res.status(400).send({ error: 'El precio y el stock deben ser números' });
        }
        if (!Array.isArray(thumbnails)) {
            return res.status(400).send({ error: 'Thumbnails debe ser un array' });
        }

        const newProduct = { title, description, price, status, stock, category, thumbnails };
        const createdProduct = await ProductManager.addProduct(newProduct);

        // Emitir evento a través de WebSocket
        io.emit('producto agregado', createdProduct);

        res.status(201).json({ data: createdProduct });
    } catch (err) {
        res.status(500).send({ error: `Error en el servidor: ${err.message}` });
    }
});

// Actualizar un producto
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).send({ error: 'El ID debe ser un número válido' });
        }

        const allowedFields = ['title', 'description', 'price', 'status', 'stock', 'category', 'thumbnails'];
        const updates = Object.keys(req.body).filter(key => allowedFields.includes(key));
        if (updates.length === 0) {
            return res.status(400).send({ error: 'No se proporcionaron campos válidos para actualizar' });
        }

        const updatedProduct = await ProductManager.updateProductById(id, req.body);
        if (!updatedProduct) {
            return res.status(404).send({ error: `Producto con id ${id} no encontrado` });
        }

        res.status(200).json({ data: updatedProduct });
    } catch (err) {
        res.status(500).send({ error: `Error en el servidor: ${err.message}` });
    }
});

// Eliminar un producto
router.delete('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).send({ error: 'El ID debe ser un número válido' });
        }

        const deleted = await ProductManager.deleteProductById(id);
        if (!deleted) {
            return res.status(404).send({ error: `Producto con id ${id} no encontrado` });
        }

        // Emitir evento a través de WebSocket
        io.emit('producto eliminado', id);

        res.status(200).send({ data: `Producto con id ${id} eliminado correctamente` });
    } catch (err) {
        res.status(500).send({ error: `Error en el servidor: ${err.message}` });
    }
});

export default router;