import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

class ProductManager {
    // Propiedad estática para la ruta del archivo
    static path = "./src/data/products.json";

    // Método estático para obtener productos
    static async getProducts() {
        try {
            const data = await fs.readFile(this.path, 'utf-8'); // Usar this.path
            console.log('Contenido de products.json:', data); // Depuración
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.error('El archivo products.json no existe.'); // Depuración
                return [];
            }
            throw new Error('Error al obtener los productos: ' + error.message);
        }
    }


    static async addProduct(product) {
        try {
            // Lista de campos obligatorios (sin "code")
            const requiredFields = ['title', 'description', 'price', 'stock'];
            const missingFields = requiredFields.filter(field => !product[field]);

            // Verificar campos obligatorios
            if (missingFields.length > 0) {
                throw new Error(`Faltan los siguientes campos obligatorios: ${missingFields.join(', ')}`);
            }

            // Obtener la lista de productos
            const products = await this.getProducts();

            // Crear el nuevo producto
            const newProduct = { ...product, id: uuidv4() }; // Generar un ID único
            const updatedProducts = [...products, newProduct];

            // Guardar la lista actualizada de productos
            await fs.writeFile(this.path, JSON.stringify(updatedProducts, null, 2));

            return newProduct;
        } catch (error) {
            throw new Error('Error al crear el producto: ' + error.message);
        }
    }

    static async getProductById(id) {
        try {
            const products = await this.getProducts();
            const product = products.find(product => product.id === id);
            if (!product) {
                throw new Error(`Producto con ID ${id} no encontrado`);
            }
            return product;
        } catch (error) {
            throw new Error('Error al obtener el producto: ' + error.message);
        }
    }

    static async deleteProductById(id) {
        try {
            const products = await this.getProducts();
            const productIndex = products.findIndex(product => product.id === id);
            if (productIndex === -1) {
                throw new Error(`Producto con ID ${id} no encontrado`);
            }
            products.splice(productIndex, 1);
            await fs.writeFile(this.path, JSON.stringify(products, null, 2));
            return `Producto con ID ${id} eliminado correctamente`;
        } catch (error) {
            throw new Error('Error al eliminar el producto: ' + error.message);
        }
    }

    static async updateProductById(id, productData) {
        try {
            if (productData.id && productData.id !== id) {
                throw new Error('No se puede modificar el ID de un producto');
            }

            const products = await this.getProducts();
            const productIndex = products.findIndex(product => product.id === id);
            if (productIndex === -1) {
                throw new Error(`Producto con ID ${id} no encontrado`);
            }

            const updatedProduct = { ...products[productIndex], ...productData };
            products[productIndex] = updatedProduct;
            await fs.writeFile(this.path, JSON.stringify(products, null, 2));

            return updatedProduct;
        } catch (error) {
            throw new Error('Error al actualizar el producto: ' + error.message);
        }
    }
}

export default ProductManager;