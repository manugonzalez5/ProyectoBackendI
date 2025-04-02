import { get } from "mongoose";
import { productoModelo } from "./models/productosModelo.js";

export class ProductosMongoManager {
    static async get(filter = {}, options = {}) {
        try {
            return await productoModelo.paginate(filter, options);
        } catch (err) {
            console.error("Error en ProductosMongoManager.get():", err);
            throw err;
        }
    }

    static async getByCode(code) {
        try {
            return await productoModelo.findOne({ code }).lean();
        } catch (err) {
            console.error("Error en ProductosMongoManager.getByCode():", err);
            throw err;
        }
    }

    static async getById(id) {
        try {
            return await productoModelo.findById(id).lean();
        } catch (err) {
            console.error("Error en ProductosMongoManager.getById():", err);
            throw err;
        }
    }

    static async create(producto) {
        try {
            const nuevoProducto = await productoModelo.create(producto);
            return nuevoProducto.toJSON();
        } catch (err) {
            console.error("Error en ProductosMongoManager.create():", err);
            throw err;
        }
    }

    static async update(id, aModificar) {
        try {
            return await productoModelo.findByIdAndUpdate(
                id, 
                aModificar, 
                { new: true, runValidators: true }
            ).lean();
        } catch (err) {
            console.error("Error en ProductosMongoManager.update():", err);
            throw err;
        }
    }

    static async delete(id) {
        try {
            return await productoModelo.findByIdAndDelete(id).lean();
        } catch (err) {
            console.error("Error en ProductosMongoManager.delete():", err);
            throw err;
        }
    }
}