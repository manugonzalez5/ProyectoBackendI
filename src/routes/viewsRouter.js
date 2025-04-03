import express from 'express';
import { ProductosMongoManager } from '../dao/ProductosMongoManager.js';
import { CartMongoManager } from '../dao/CartMongoManager.js';
import { productoModelo } from '../dao/models/productosModelo.js';
import { isValidObjectId } from 'mongoose';
import { cartModelo } from '../dao/models/cartsModelo.js';
import mongoose from 'mongoose';

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

        res.render('home', {
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
        // Obtener todos los productos desde MongoDB
        const products = await productoModelo.find().lean();
        
        // Procesar los datos para la vista
        const productsForView = products.map(product => ({
            ...product,
            // Asegurar que siempre haya una imagen
            displayImage: product.thumbnails?.length > 0 ? product.thumbnails[0] : '/img/default-product.png',
            // Convertir estado a texto
            statusText: product.status ? 'Disponible' : 'No disponible',
            // Formatear precio
            formattedPrice: product.price.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })
        }));

        res.render('realTimeProducts', {
            products: productsForView,
            hasProducts: productsForView.length > 0
        });

    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).render('error', {
            error: 'Error al cargar los productos',
            details: process.env.NODE_ENV === 'development' ? error.message : null
        });
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

router.get('/products/:pid', async (req, res) => {
    try {
        const { pid } = req.params;
        
        if (!isValidObjectId(pid)) {
            return res.status(400).render('error', { 
                error: 'ID de producto inválido' 
            });
        }

        // Obtener producto usando lean() para convertir a objeto plano
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
            thumbnails: product.thumbnails?.length > 0 ? product.thumbnails : ['/img/default-product.png'],
            // Convertir ObjectId a string si es necesario
            _id: product._id.toString()
        };

        res.render('product-detail', { 
            product: productData,
            cartId: req.user?.cart?.toString() || null,
            apiCartUrl: '/api/carts/add-product'
        });
    } catch (error) {
        console.error(`Error al obtener producto ${req.params.pid}:`, error);
        res.status(500).render('error', { 
            error: 'Error al cargar el producto',
            details: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
});

router.get('/carts', async (req, res) => {
    try {
        const carts = await cartModelo.find().lean();
        res.render('cartsGeneral', { 
            carts: carts,
            hasCarts: carts.length > 0
        });
    } catch (error) {
        console.error('Error al obtener carritos:', error);
        res.status(500).render('error', {
            error: 'Error al cargar los carritos'
        });
    }
});

router.get('/carts/:cid', async (req, res) => {
    try {
        const { cid } = req.params;

        //  Validación de ObjectId
        if (!mongoose.Types.ObjectId.isValid(cid)) {
            return res.status(400).render('error', { 
                error: 'ID de carrito inválido',
                message: 'El formato del ID no es correcto'
            });
        }

        // Consulta con manejo de productos no encontrados
        const cart = await cartModelo.findById(cid)
            .populate({
                path: 'products.product',
                select: 'title price thumbnails', // Solo campos necesarios
                options: { lean: true }
            })
            .lean();

        if (!cart) {
            return res.status(404).render('error', { 
                error: 'Carrito no encontrado',
                suggestion: 'Verifica el ID o intenta con otro carrito'
            });
        }

        //  Procesamiento de productos
        const processedProducts = cart.products.map(item => {
            // Manejo de productos eliminados
            const product = item.product || {
                title: 'Producto no disponible',
                price: 0,
                thumbnails: ['/img/default-product.png'],
                _id: '000000000000000000000000'
            };

            return {
                ...item,
                product,
                subtotal: product.price * item.quantity
            };
        });

        //  Cálculo de totales con valores por defecto
        const subtotal = processedProducts.reduce((sum, item) => sum + item.subtotal, 0) || 0;
        const shipping = subtotal > 10000 ? 0 : 1500;
        const total = subtotal + shipping;

        // Formateo de fechas
        const createdAt = new Date(cart.createdAt).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        res.render('cart', {
            cid,
            cart: {
                ...cart,
                products: processedProducts,
                createdAt
            },
            summary: { 
                subtotal, 
                shipping, 
                total,
                itemsCount: processedProducts.reduce((sum, item) => sum + item.quantity, 0)
            }
        });

    } catch (error) {
        console.error(`Error loading cart ${req.params.cid}:`, error);
        res.status(500).render('error', {
            error: 'Error al cargar el carrito',
            details: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
});

router.get('/carts/:cid/purchase', async (req, res) => {
    try {
        const cid = req.params.cid;
        
        if (!isValidObjectId(cid)) {
            return res.status(400).render('checkout', { 
                error: 'ID de carrito inválido' 
            });
        }

        const result = await CartMongoManager.purchaseCart(cid);

        // Preparar datos calculando subtotales
        const purchasedProducts = result.ticket.products.map(item => {
            return {
                product: {
                    title: item.product.title,
                    price: item.product.price
                },
                quantity: item.quantity,
                subtotal: (item.product.price * item.quantity).toFixed(2)
            };
        });

        // Formatear fecha aquí en el servidor
        const formattedTicket = {
            ...result.ticket.toObject(),
            purchase_datetime: new Date(result.ticket.purchase_datetime).toLocaleString('es-ES')
        };

        res.render('checkout', {
            ticket: formattedTicket,
            purchasedProducts: purchasedProducts,
            error: null
        });

    } catch (err) {
        console.error('Error en checkout:', err);
        res.render('checkout', {
            ticket: null,
            error: err.message
        });
    }
});

// router.get('/checkout', async (req, res) => {
//     try {
//         //  Obtener ID del carrito desde múltiples fuentes posibles
//         const cid = req.query.cartId || (req.session ? req.session.cartId : null);
        
//         //  Validar que tenemos un ID de carrito
//         if (!cid) {
//             return res.status(400).render('error', {
//                 error: 'Carrito no especificado',
//                 message: 'Debes proporcionar un ID de carrito válido',
//                 solution: 'Agrega ?cartId=TU_ID al URL o inicia sesión'
//             });
//         }

//         //  Validar formato del ID 
//         if (!isValidObjectId(cid)) {
//             return res.status(400).render('error', {
//                 error: 'ID de carrito inválido',
//                 message: 'El formato del ID del carrito no es válido'
//             });
//         }

//         //  Obtener el carrito específico
//         const cart = await cartModelo.findById(cid)
//             .populate('products.product')
//             .lean();

//         //  Validar que el carrito existe
//         if (!cart) {
//             return res.status(404).render('error', {
//                 error: 'Carrito no encontrado',
//                 message: 'No existe un carrito con el ID proporcionado'
//             });
//         }

//         //  Validar que el carrito no está vacío
//         if (!cart.products || cart.products.length === 0) {
//             return res.status(400).render('error', {
//                 error: 'Carrito vacío',
//                 message: 'Agrega productos a tu carrito antes de finalizar la compra',
//                 redirect: '/products'
//             });
//         }

//         //  Calcular resumen del carrito
//         const subtotal = cart.products.reduce((sum, item) => {
//             const price = item.product?.price || 0;
//             const quantity = item.quantity || 1;
//             return sum + (price * quantity);
//         }, 0);

//         const summary = {
//             subtotal: subtotal,
//             shipping: 0, 
//             total: subtotal
//         };

//         //  Renderizar vista con datos necesarios
//         res.render('checkout', {
//             cart: cart,
//             summary: summary,
//             cartId: cid
//         });

//     } catch (error) {
//         console.error('Error en checkout:', error);
//         res.status(500).render('error', {
//             error: 'Error en el servidor',
//             message: 'Ocurrió un error al procesar tu solicitud',
//             details: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// });

export default router;