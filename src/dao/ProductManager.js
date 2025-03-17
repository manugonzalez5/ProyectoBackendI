import fs from 'fs';

class ProductManager {
    static path = "./src/data/products.json";

    // Listado de productos
    static async getProducts() {
        if (fs.existsSync(this.path)) {
            return JSON.parse(await fs.promises.readFile(this.path, "utf-8"));
        } else {
            return [];
        }
    }

    // Crear un producto
    static async createProduct(product) {
        const products = await this.getProducts();
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        const newProduct = { ...product, id: newId };

        products.push(newProduct);
        await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
        return newProduct;
    }

    // Buscador de productos por ID
    static async getProductById(id) {
        const products = await this.getProducts();
        return products.find(product => product.id === id);
    }

    // Eliminar un producto por ID
    static async deleteProductById(id) {
        let products = await this.getProducts();
        const productIndex = products.findIndex(product => product.id === id);

        if (productIndex !== -1) {
            products.splice(productIndex, 1);
            await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
            return true; // Producto eliminado
        }
        return false; // Producto no encontrado
    }

    // Actualizar un producto por ID
    static async updateProductById(id, productData) {
        let products = await this.getProducts();
        const productIndex = products.findIndex(product => product.id === id);

        if (productIndex !== -1) {
            const updatedProduct = { ...products[productIndex], ...productData };
            products[productIndex] = updatedProduct;
            await fs.promises.writeFile(this.path, JSON.stringify(products, null, 2));
            return updatedProduct;
        }
        return null; // Producto no encontrado
    }
}

export default ProductManager;

