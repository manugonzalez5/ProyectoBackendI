import mongoose from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const productosSchema= new mongoose.Schema(
    {
        code:{
            type: String,
            required: true,
            unique: true,
        },
        title: String,
        description: String,
        price: { 
            type:Number,
            min: 0,
        },
        stock: {
            type: Number, 
            default: 0,
            min: 0,
        },
        category: String,
        status: {
            type: Boolean,
            default: true,
        },
        thumbnails: [],
    },
    {
        timestamps: true,
        strict: false,
    },
)

productosSchema.plugin(paginate); // Paginación

export const productoModelo= mongoose.model('productos', productosSchema); // Crear el modelo