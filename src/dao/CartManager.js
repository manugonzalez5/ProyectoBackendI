import fs from 'fs/promises';

class CartManager {
    static path = "./src/data/carts.json";

    // Listado de carritos
    static async getCarts() {
        try {
            const data = await fs.readFile(this.path, "utf-8");
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
        try {
            const carts = await this.getCarts();
            const cart = carts.find(cart => cart.id === id);
            if (!cart) {
                throw new Error(`Carrito con ID ${id} no encontrado`);
            }
            return cart;
        } catch (error) {
            throw new Error(`Error al obtener el carrito con ID ${id}: ${error.message}`);
        }
    }

    // Crear un carrito
    static async addCart(cart) {
        try {
            if (!cart || typeof cart !== 'object') {
                throw new Error('El carrito debe ser un objeto válido');
            }

            const carts = await this.getCarts();
            const newId = carts.length > 0 ? Math.max(...carts.map(c => c.id)) + 1 : 1;
            const newCart = { id: newId, ...cart, products: [] };
            carts.push(newCart);

            await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
            return newCart;
        } catch (error) {
            throw new Error('Error al crear el carrito: ' + error.message);
        }
    }

    // Actualizar un carrito por ID
    static async updateCartById(id, updatedCart) {
        try {
            const carts = await this.getCarts();
            const cartIndex = carts.findIndex(cart => cart.id === id);

            if (cartIndex === -1) {
                throw new Error('Carrito no encontrado');
            }

            // Actualizamos solo los campos permitidos
            const allowedFields = ['products'];
            const updates = Object.keys(updatedCart).filter(key => allowedFields.includes(key));
            if (updates.length === 0) {
                throw new Error('No se proporcionaron campos válidos para actualizar');
            }

            const updated = { ...carts[cartIndex], ...updatedCart };
            carts[cartIndex] = updated;

            await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
            return updated;
        } catch (error) {
            throw new Error('Error al actualizar el carrito: ' + error.message);
        }
    }

    // Eliminar un carrito por ID
    static async deleteCartById(id) {
        try {
            const carts = await this.getCarts();
            const cartIndex = carts.findIndex(cart => cart.id === id);

            if (cartIndex === -1) {
                throw new Error('Carrito no encontrado');
            }

            carts.splice(cartIndex, 1);

            await fs.writeFile(this.path, JSON.stringify(carts, null, 2));
            return `Carrito con ID ${id} eliminado correctamente`;
        } catch (error) {
            throw new Error('Error al eliminar el carrito: ' + error.message);
        }
    }
}

export default CartManager;