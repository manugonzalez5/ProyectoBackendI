import { cartModelo } from "./models/cartsModelo.js";
import { isValidObjectId } from 'mongoose';
import { productoModelo } from "./models/productosModelo.js";
import mongoose from 'mongoose';
import { ticketModelo } from "./models/ticketModelo.js";

export class CartMongoManager {
    // Crear un carrito vacío
    static async createCart() {
        try {
            const cart = await cartModelo.create({ products: [] });
            return cart;
        } catch (err) {
            throw new Error(`Error al crear carrito: ${err.message}`);
        }
    }

    // Obtener carrito con productos completos (populate)
    static async getCartWithProducts(cid) {
        if (!isValidObjectId(cid)) throw new Error("ID de carrito inválido");
        try {
            return await cartModelo.findById(cid).populate('products.product').lean();
        } catch (err) {
            throw new Error(`Error al obtener carrito: ${err.message}`);
        }
    }

    // static async addProductToCart(cid, pid, quantity = 1) {
    //     if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
    //         throw new Error("IDs inválidos");
    //     }
        
    //     try {
    //         // Verificar si el producto existe
    //         const product = await productoModelo.findById(pid);
    //         if (!product) {
    //             throw new Error("Producto no encontrado");
    //         }
    
    //         // Buscar el carrito existente o crear uno nuevo si no existe
    //         let cart = await cartModelo.findById(cid);
            
    //         if (!cart) {
    //             cart = new cartModelo({
    //                 _id: cid,
    //                 products: []
    //             });
    //         }
    
    //         // Buscar el producto en el carrito
    //         const existingProduct = cart.products.find(p => p.product.equals(pid));
            
    //         if (existingProduct) {
    //             existingProduct.quantity += quantity;
    //         } else {
    //             cart.products.push({ product: pid, quantity: quantity });
    //         }
    
    //         await cart.save();
    //         return await cartModelo.findById(cart._id).populate('products.product');
            
    //     } catch (err) {
    //         throw new Error(`Error al agregar producto al carrito: ${err.message}`);
    //     }
    // }

    static async addProductToCart(req, pid, quantity = 1) {
        // Verificar IDs
        if (!isValidObjectId(pid)) {
            throw new Error("ID de producto inválido");
        }
    
        try {
            // Verificar si el producto existe
            const product = await productoModelo.findById(pid);
            if (!product) {
                throw new Error("Producto no encontrado");
            }
    
            // Obtener ID de usuario o de sesión
            const userId = req.user?._id;
            const sessionId = req.sessionID; // ID de la sesión actual
    
            // Crear filtro de búsqueda
            const filter = userId 
                ? { user: userId } 
                : { sessionId: sessionId };
    
            // Buscar o crear carrito
            let cart = await cartModelo.findOne(filter)
                .populate('products.product');
    
            if (!cart) {
                cart = new cartModelo({
                    ...filter,
                    products: []
                });
            }
    
            // Buscar el producto en el carrito
            const existingProduct = cart.products.find(p => p.product._id.equals(pid));
            
            if (existingProduct) {
                existingProduct.quantity += quantity;
            } else {
                cart.products.push({ 
                    product: pid, 
                    quantity: quantity 
                });
            }
    
            await cart.save();
            return await cartModelo.findById(cart._id).populate('products.product');
            
        } catch (err) {
            throw new Error(`Error al agregar producto al carrito: ${err.message}`);
        }
    }

    // Eliminar un producto específico del carrito
    static async removeProductFromCart(cid, pid) {
        if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
            throw new Error("IDs inválidos");
        }
        try {
            const cart = await cartModelo.findById(cid);
            cart.products = cart.products.filter(p => !p.product.equals(pid));
            await cart.save();
            return cart;
        } catch (err) {
            throw new Error(`Error al eliminar producto: ${err.message}`);
        }
    }

    // Actualizar todo el arreglo de productos del carrito
    static async updateCartProducts(cid, products) {
        if (!isValidObjectId(cid)) throw new Error("ID de carrito inválido");
        try {
            const cart = await cartModelo.findByIdAndUpdate(
                cid,
                { products },
                { new: true }
            );
            return cart;
        } catch (err) {
            throw new Error(`Error al actualizar carrito: ${err.message}`);
        }
    }

    // Actualizar solo la cantidad de un producto en el carrito
    static async updateProductQuantity(cid, pid, quantity) {
        if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
            throw new Error("IDs inválidos");
        }
        try {
            const cart = await cartModelo.findById(cid);
            const product = cart.products.find(p => p.product.equals(pid));

            if (!product) throw new Error("Producto no encontrado en el carrito");
            product.quantity = quantity;

            await cart.save();
            return cart;
        } catch (err) {
            throw new Error(`Error al actualizar cantidad: ${err.message}`);
        }
    }

    // Vaciar el carrito (eliminar todos los productos)
    static async clearCart(cid) {
        if (!isValidObjectId(cid)) throw new Error("ID de carrito inválido");
        try {
            const cart = await cartModelo.findByIdAndUpdate(
                cid,
                { products: [] },
                { new: true }
            );
            return cart;
        } catch (err) {
            throw new Error(`Error al vaciar carrito: ${err.message}`);
        }
    }
    static async getCartById(id) {
        try {
            const cart = await cartModelo.findById(id);
            return cart;
        } catch (err) {
            throw new Error(`Error al obtener carrito: ${err.message}`);
        }
    }

    static async purchaseCart(cid) {
        const session = await mongoose.startSession();
        session.startTransaction();
        
        try {
            // Obtener el carrito con los productos 
            const cart = await cartModelo.findById(cid)
                .populate({
                    path: 'products.product',
                    model: 'productos' 
                })
                .session(session);
            
            if (!cart) throw new Error("Carrito no encontrado");
            if (cart.products.length === 0) throw new Error("El carrito está vacío");
    
            // Verificar stock y separar productos 
            const productsWithStock = [];
            const productsWithoutStock = [];
            
            for (const item of cart.products) {
                // Verifica que item.product existe y tiene price
                if (!item.product) {
                    console.warn(`Producto no encontrado: ${item.product}`);
                    continue;
                }
                
                if (item.product.stock >= item.quantity) {
                    // Asegurémonos de que price es un número
                    if (typeof item.product.price !== 'number' || isNaN(item.product.price)) {
                        throw new Error(`Precio inválido para el producto ${item.product._id}`);
                    }
                    productsWithStock.push(item);
                } else {
                    productsWithoutStock.push(item);
                }
            }
    
            if (productsWithStock.length === 0) {
                throw new Error("Ningún producto tiene suficiente stock");
            }
    
            // Actualizar stock de productos
            for (const item of productsWithStock) {
                await productoModelo.findByIdAndUpdate(
                    item.product._id,
                    { $inc: { stock: -item.quantity } },
                    { session }
                );
            }
    
            // Crear ticket de compra
            const amount = productsWithStock.reduce((total, item) => {
                return total + (item.product.price * item.quantity);
            }, 0);
    
            // Crear array de productos para el ticket
            const ticketProducts = productsWithStock.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.price
            }));
    
            const ticket = new ticketModelo({
                amount,
                purchaser: cart.user, 
                products: ticketProducts
            });
    
            await ticket.save({ session });
    
            // Actualizar el carrito (quitar los productos comprados)
            cart.products = productsWithoutStock.map(item => ({
                product: item.product._id,
                quantity: item.quantity
            }));
            await cart.save({ session });
    
            await session.commitTransaction();
            
            // Populate el ticket antes de devolverlo si es necesario
            const ticketWithProducts = await ticketModelo.findById(ticket._id)
                .populate('products.product')
                .exec();
    
            return {
                ticket: ticketWithProducts,
                productsNotPurchased: productsWithoutStock
            };
    
        } catch (err) {
            throw new Error(`Error al procesar la compra: ${err.message}`);
        } finally {
            session.endSession();
        }
    }
}
