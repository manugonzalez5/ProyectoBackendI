import fs from 'fs/promises'; 

class ProductManager {
    static path = "./src/data/products.json";

    // Listado de productos
    static async getProducts() {
        try {
            if (fs.existsSync(this.path)) {
                const data = await fs.readFile(this.path, 'utf-8');
                return JSON.parse(data);
            } else {
                return [];
            }
        } catch (error) {
            throw new Error('Error al obtener los productos: ' + error.message);
        }
    }

    // Crear un producto
    static async createProduct(product) {
        try {
            // Validar campos obligatorios
            const requiredFields = ['title', 'description', 'price', 'code', 'stock'];
            for (const field of requiredFields) {
                if (!product[field]) {
                    throw new Error(`El campo ${field} es obligatorio`);
                }
            }

            // Obtener productos existentes
            const products = await this.getProducts();

            // Validar código único
            const codeExists = products.some(p => p.code === product.code);
            if (codeExists) {
                throw new Error('El código del producto ya existe');
            }

            // Generar nuevo ID
            const newId = products.length > 0 ? products[products.length - 1].id + 1 : 1;
            const newProduct = { ...product, id: newId };

            // Agregar el nuevo producto y guardar en el archivo
            const updatedProducts = [...products, newProduct];
            await fs.writeFile(this.path, JSON.stringify(updatedProducts, null, 2));

            return newProduct;
        } catch (error) {
            throw new Error('Error al crear el producto: ' + error.message);
        }
    }

    // Buscar un producto por ID
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

    // Eliminar un producto por ID
    static async deleteProductById(id) {
        try {
            // Validar que el ID sea un número
            if (isNaN(id)) {
                throw new Error('El ID debe ser un número válido');
            }

            // Obtener productos existentes
            const products = await this.getProducts();

            // Buscar el índice del producto a eliminar
            const productIndex = products.findIndex(product => product.id === id);

            // Si no se encuentra el producto, lanzar un error
            if (productIndex === -1) {
                throw new Error(`Producto con ID ${id} no encontrado`);
            }

            // Eliminar el producto del array
            products.splice(productIndex, 1);

            // Guardar los productos actualizados en el archivo
            await fs.writeFile(this.path, JSON.stringify(products, null, 2));

            return `Producto con ID ${id} eliminado correctamente`;
        } catch (error) {
            throw new Error('Error al eliminar el producto: ' + error.message);
        }
    }

    // Actualizar un producto por ID
    static async updateProductById(id, productData) {
        try {
            // Validar que el ID sea un número
            if (isNaN(id)) {
                throw new Error('El ID debe ser un número válido');
            }

            // Obtener productos existentes
            const products = await this.getProducts();

            // Buscar el índice del producto a actualizar
            const productIndex = products.findIndex(product => product.id === id);

            // Si no se encuentra el producto, lanzar un error
            if (productIndex === -1) {
                throw new Error(`Producto con ID ${id} no encontrado`);
            }

            // Actualizar el producto
            const updatedProduct = { ...products[productIndex], ...productData };
            products[productIndex] = updatedProduct;

            // Guardar los productos actualizados en el archivo
            await fs.writeFile(this.path, JSON.stringify(products, null, 2));

            return updatedProduct;
        } catch (error) {
            throw new Error('Error al actualizar el producto: ' + error.message);
        }
    }
}

export default ProductManager;