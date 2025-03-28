import { productoModelo } from "./models/productosModelo.js"; // Importamos el modelo de producto
export class ProductosMongoManager {
    static async get(page=1, limit=10) { // Devuelve todos los productos
        try{
            return await productoModelo.paginate({}, {page, limit, lean: true}).find();
        }    
        catch(err){
            console.log(err);
        }
    }
    static async getBy(filtro={}) { // Puede recibir un filtro o no
        try{
            return await productoModelo.findOne(filtro).lean();
        } 
        catch(err){
            console.log(err);
        }
    }
    static async save(producto) { // Recibe un producto y lo guarda en la base de datos
        //return await productoModelo.create(producto);
        try{
            let nuevoProducto = await productoModelo.create(producto);
            return nuevoProducto.toJSON();
        } 
        catch(err){
            console.log(err);
        }
    }

    static async update(id, aModificar) { // Recibe un id y un producto y lo reemplaza en la base de datos
        try{
            return await productoModelo.findByIdAndUpdate(id, aModificar, { new: true }).lean();
        } 
        catch(err){
            console.log(err);
    }    
}

    static async delete(id) { // Recibe un id y lo elimina de la base de datos
        //return await productoModelo.deleteOne({ _id: id });
        try {
            return await productoModelo.findByIdAndDelete(id).lean();
        } 
        catch(err){
            console.log(err);
        }
    } 
}