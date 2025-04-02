import express from 'express';
import { ProductosMongoManager } from '../dao/ProductosMongoManager.js';
import { productoModelo } from '../dao/models/productosModelo.js';
import { isValidObjectId } from 'mongoose';

const router = express.Router();

// Ruta principal con paginación
router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;
        
        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            lean: true,
            sort: sort ? { price: sort === 'asc' ? 1 : -1 } : undefined
        };

        const filter = query ? 
            (query === 'available' ? { stock: { $gt: 0 } } : { category: query }) : {};

        const result = await productoModelo.paginate(filter, options);

        res.render('products', {
            productos: result.docs,
            pagination: {
                totalPages: result.totalPages,
                prevPage: result.prevPage,
                nextPage: result.nextPage,
                page: result.page,
                hasPrevPage: result.hasPrevPage,
                hasNextPage: result.hasNextPage,
                prevLink: result.hasPrevPage ? 
                    `/?page=${result.prevPage}&limit=${limit}&sort=${sort || ''}&query=${query || ''}` : null,
                nextLink: result.hasNextPage ? 
                    `/?page=${result.nextPage}&limit=${limit}&sort=${sort || ''}&query=${query || ''}` : null
            }
        });

    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});

// Página de productos en tiempo real
router.get('/realtimeproducts', async (req, res) => {
    try {
        const products = await ProductosMongoManager.get();
        res.render('realTimeProducts', { products });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});

// Vista de productos con paginación
router.get('/products', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;
        
        const options = {
            limit: parseInt(limit),
            page: parseInt(page),
            lean: true,
            sort: sort ? { price: sort === 'asc' ? 1 : -1 } : undefined
        };

        const filter = query ? 
            (query === 'available' ? { stock: { $gt: 0 } } : { category: query }) : {};

        const result = await productoModelo.paginate(filter, options);

        res.render('products', {
            productos: result.docs,
            pagination: {
                totalPages: result.totalPages,
                prevPage: result.prevPage,
                nextPage: result.nextPage,
                page: result.page,
                hasPrevPage: result.hasPrevPage,
                hasNextPage: result.hasNextPage,
                prevLink: result.hasPrevPage ? 
                    `/products?page=${result.prevPage}&limit=${limit}&sort=${sort || ''}&query=${query || ''}` : null,
                nextLink: result.hasNextPage ? 
                    `/products?page=${result.nextPage}&limit=${limit}&sort=${sort || ''}&query=${query || ''}` : null
            }
        });

    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
});

// router.get('/products/:pid', async (req, res) => {
//     try {
//         const product = await ProductosMongoManager.getById(req.params.pid);
//         if (!product) {
//             return res.status(404).render('error', { 
//                 error: 'Producto no encontrado' 
//             });
//         }
        
//         res.render('product-detail', { 
//             product,
//         });
//     } catch (error) {
//         res.status(500).render('error', { error: error.message });
//     }
// });
router.get('/products/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        
        // Validación básica del ID
        if (!isValidObjectId(pid)) {
            return res.status(400).render('error', { 
                error: 'ID de producto inválido' 
            });
        }

        // Obtener producto con más información relevante
        const product = await ProductosMongoManager.getById(pid);
        if (!product) {
            return res.status(404).render('error', { 
                error: 'Producto no encontrado' 
            });
        }
        
        // Preparar datos para la vista
        const productData = {
            ...product,
            available: product.stock > 0,
            thumbnails: product.thumbnails || ['/img/default-product.png']
        };

        res.render('product-detail', { 
            product: productData,
            // user: req.user || null, // Información del usuario si está autenticado
            cartId: req.user?.cart?.toString() || null, // ID del carrito del usuario
            // isAuthenticated: !!req.user // Flag para saber si está logueado
        });
    } catch (error) {
        console.error(`Error al obtener producto ${req.params.pid}:`, error);
        res.status(500).render('error', { 
            error: 'Error al cargar el producto',
            details: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
});

router.get('/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params;
        
        // Validar ObjectId
        if (!isValidObjectId(cid)) {
            return res.status(400).render('error', { error: 'ID de carrito inválido' });
        }
        
        // Obtener carrito con productos poblados
        const cart = await Cart.findById(cid).populate('products.product');
        
        if (!cart) {
            return res.status(404).render('error', { error: 'Carrito no encontrado' });
        }
        
        res.render('cart', { 
            cid,
            cart: cart.toObject({ virtuals: true }),
            ...helpers
        });
        
    } catch (error) {
        res.status(500).render('error', { error: 'Error al cargar el carrito' });
    }
});

export default router;