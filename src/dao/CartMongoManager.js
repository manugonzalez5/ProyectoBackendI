import { cartModelo } from "./models/cartsModelo.js";
import { isValidObjectId } from 'mongoose';

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

    // Agregar producto al carrito (o incrementar cantidad si ya existe)
    static async addProductToCart(cid, pid) {
        if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
            throw new Error("IDs inválidos");
        }
        try {
            const cart = await cartModelo.findById(cid);
            const existingProduct = cart.products.find(p => p.product.equals(pid));

            if (existingProduct) {
                existingProduct.quantity += 1;
            } else {
                cart.products.push({ product: pid, quantity: 1 });
            }

            await cart.save();
            return cart;
        } catch (err) {
            throw new Error(`Error al agregar producto: ${err.message}`);
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
}
