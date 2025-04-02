import { Router } from 'express';
import { ProductosMongoManager } from '../dao/ProductosMongoManager.js';
import { isValidObjectId } from 'mongoose';
export const router = Router();

// Middleware de validación de ID
const validateId = (req, res, next) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ error: 'ID inválido' });
    }
    next();
};

router.get('/', async (req, res) => {
    try {
        const products = await ProductosMongoManager.get();
        res.json({ products });
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { title, description, code, price, stock, category } = req.body;

        // Validaciones básicas
        if (!title || !description || !code || !price || !stock || !category) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        if (typeof price !== 'number' || price <= 0) {
            return res.status(400).json({ error: 'Precio debe ser un número positivo' });
        }

        if (typeof stock !== 'number' || stock < 0) {
            return res.status(400).json({ error: 'Stock debe ser un número no negativo' });
        }

        // Verificar código único
        const exists = await ProductosMongoManager.getByCode(code);
        if (exists) {
            return res.status(400).json({ error: 'El código ya está registrado' });
        }

        const newProduct = await ProductosMongoManager.create(req.body);
        res.status(201).json({ status: 'success', payload: newProduct });

    } catch (err) {
        console.error("Error al crear producto:", err);
        res.status(500).json({ error: 'Error al crear producto' });
    }
});

router.put('/:id', validateId,async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Campos no modificables
        if (updates.code || updates._id) {
            return res.status(400).json({ error: 'Código y ID no pueden modificarse' });
        }

        const updatedProduct = await ProductosMongoManager.update(id, updates);
        
        if (!updatedProduct) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ status: 'success', payload: updatedProduct });

    } catch (err) {
        console.error("Error al actualizar producto:", err);
        res.status(500).json({ error: 'Error al actualizar producto' });
    }
});

router.delete('/:id', validateId, async (req, res) => {
    try {
        const { id } = req.params;

        const deletedProduct = await ProductosMongoManager.delete(id);
        
        if (!deletedProduct) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json({ status: 'success', payload: deletedProduct });

    } catch (err) {
        console.error("Error al eliminar producto:", err);
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

router.get('/:id', validateId, async (req, res) => {
    try {
        const { id } = req.params;
        const product = await ProductosMongoManager.getById(id);
        if (!product) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json({ status: 'success', payload: product });
    } catch (err) {
        console.error("Error al obtener producto:", err);
        res.status(500).json({ error: 'Error al obtener producto' });
    }
});

export default router;