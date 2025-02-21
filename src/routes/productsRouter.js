const { ProductManager } = require('../dao/ProductManager.js');
const { Router } = require('express');
const router = Router();

// Listado de productos
router.get('/', async (req, res) => {
    try {
        let products = await ProductManager.getProducts();
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({ products });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Buscador de productos por ID
router.get('/:id', async (req, res) => {
    try {
        let product = await ProductManager.getProductById(parseInt(req.params.id));
        if (!product) {
            res.setHeader('Content-Type', 'application/json');
            return res.status(400).send({ error: `No existen productos con id ${req.params.id}` });
        }
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({ product });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Crear un producto
router.post('/', async (req, res) => {
    try {
        const { title, description, code, price, status, stock, category, thumbnails } = req.body;

        // Validaciones
        if (!title || !description || !code || !price || !status || !stock || !category || !thumbnails) {
            return res.status(400).send({ error: 'Todos los campos son requeridos' });
        }

        const newProduct = {
            title,
            description,
            code,
            price,
            status,
            stock,
            category,
            thumbnails
        };

        const createdProduct = await ProductManager.createProduct(newProduct);

        res.status(201).json({ createdProduct });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Actualizar un producto
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, code, price, status, stock, category, thumbnails } = req.body;

        // Validaciones
        if (!title && !description && !code && !price && !status && !stock && !category && !thumbnails) {
            return res.status(400).send({ error: 'No hay datos para actualizar' });
        }

        // Obtener el producto
        const updatedProduct = await ProductManager.updateProductById(parseInt(id), {
            title, description, code, price, status, stock, category, thumbnails
        });

        if (!updatedProduct) {
            return res.status(404).send({ error: `Producto con id ${id} no encontrado` });
        }

        res.status(200).json({ updatedProduct });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Eliminar un producto
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const deleted = await ProductManager.deleteProductById(parseInt(id));
        
        if (!deleted) {
            return res.status(404).send({ error: `Producto con id ${id} no encontrado` });
        }

        res.status(200).send({ message: `Producto con id ${id} eliminado correctamente` });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

module.exports = router;
