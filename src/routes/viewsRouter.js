import  ProductManager  from '../dao/ProductManager.js';  
import  Router  from 'express';
const router=Router()

router.get("/products", async(req, res)=>{
    let products=await ProductManager.getProducts()

    res.render('home', {products});
})

router.get('/products',async(req,res)=>{
    let products=await ProductManager.getProducts()

    let numero=Math.floor(Math.random()*(20)+0)      // Math.floor(Math.random()*(cantNrosAGenerar)+aPartirDelNro)
    
    let product=products[numero]

    res.render("realTimeProducts", {
        name:product.name, 
        alias:product.alias,
        product
    })
})

// Ruta principal para mostrar los productos en home.handlebars
router.get('/123', async (req, res) => {
    try {
        // Obtener los productos desde ProductManager (suponiendo que devuelves un arreglo de productos)
        let productos = await ProductManager.getProducts();

        // Renderizar la vista home.handlebars y pasar los productos a la vista
        res.render('home', { productos }); // 'home' hace referencia al archivo home.handlebars
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


export default router;