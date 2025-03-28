import mongoose from "mongoose";
import { paginate } from "mongoose-paginate-v2";

const cartsSchema = new mongoose.Schema(
    {
        products: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "products",
                },
                quantity: Number,
            },
        ],
    },
    {
        timestamps: true,
        strict: false,
    }
);

cartsSchema.plugin(paginate); // Paginación

export const cartModelo = mongoose.model("carts", cartsSchema); // Crear el modelo      
