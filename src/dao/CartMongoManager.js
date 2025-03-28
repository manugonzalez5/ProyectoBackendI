import { cartModelo } from "./models/cartsModelo.js";

export class CartMongoManager {
    static async createCart(){ // Crea un carrito vacío y devuelve su id
        try{
            const cart = await cartModelo.create({products: []});
            return cart._id;
        }catch(err){
            console.log(err);    
        }
    }
    static async getCartById(id){ // Busca un carrito por su id
        try{
            return await cartModelo.findById(id).lean();
        }catch(err){
            console.log(err);    
        }
    }
    static async addProductToCart(cid, pid){ // Agrega un producto al carrito
        try{
            const cart = await cartModelo.findById(cid);
            cart.products.push(pid);
            await cart.save();
            return cart;
        }catch(err){
            console.log(err);
        }
    }
    static async bougthtCart(cid){ // Compra los productos del carrito
        try{
            const cart = await cartModelo.findById(cid);
            cart.products = [];
            await cart.save();
            return cart;
        }catch(err){
            console.log(err);
    }
    }
    static async modifyCart(cid, products){ // Modifica un cart: enviar products [{product, quantity}] por body
        try{
            const cart = await cartModelo.findById(cid);
            cart.products = products;
            await cart.save();
            return cart;
        }catch(err){
            console.log(err);
        }
    }
    static async deleteProductFromCart(cid, pid){ // Elimina un producto del carrito
        try{
            const cart = await cartModelo.findById(cid);
            cart.products = cart.products.filter(product => product !== pid);
            await cart.save();
            return cart;
        }catch(err){
            console.log(err);
        }
    }
}
