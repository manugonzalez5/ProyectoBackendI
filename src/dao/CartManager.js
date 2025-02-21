const fs = require("fs");

class CartManager {
    static path = "./src/data/carts.json";

    // Listado de carritos
    static async getCarts() {
        try {
            const data = await fs.promises.readFile(this.path, "utf-8");
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                return [];
            }
            throw new Error('Error al leer el archivo de carritos: ' + error.message);
        }
    }

    // Buscador de carritos por ID
    static async getCartById(id) {
        const carts = await this.getCarts();
        return carts.find(cart => cart.id === id);
    }

    // Crear un carrito
    static async addCart(cart) {
        const carts = await this.getCarts();
        const newId = carts.length > 0 ? Math.max(...carts.map(c => c.id)) + 1 : 1;
        const newCart = { id: newId, ...cart, products: [] };
        carts.push(newCart);
        try {
            await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
        } catch (error) {
            throw new Error('Error al escribir en el archivo de carritos: ' + error.message);
        }
        return newCart;
    }

    // Actualizar un carrito por ID
    static async updateCartById(id, updatedCart) {
        const carts = await this.getCarts();
        const cartIndex = carts.findIndex(cart => cart.id === id);

        if (cartIndex === -1) {
            throw new Error('Carrito no encontrado');
        }

        // Actualizamos el carrito
        carts[cartIndex] = { ...carts[cartIndex], ...updatedCart };

        try {
            await fs.promises.writeFile(this.path, JSON.stringify(carts, null, 2));
        } catch (error) {
            throw new Error('Error al actualizar el carrito: ' + error.message);
        }

        return carts[cartIndex];  // Devolvemos el carrito actualizado
    }
}

module.exports = { CartManager };


