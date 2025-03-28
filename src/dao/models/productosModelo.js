import moongose from 'mongoose';
import paginate from 'mongoose-paginate-v2';

const productosSchema= new moongose.Schema(
    {
        title: String,
        code:{
            type: String,
            required: true,
            unique: true,
        },
        price: Number,
        stock: {
            type: Number, 
            default: 0
        },
        category: String,
        thumbnails: [],
    },
    {
        timestamps: true,
        strict: false,
    },
)

productosSchema.plugin(paginate); // Paginación

export const productoModelo= moongose.model('productos', productosSchema); // Crear el modelo