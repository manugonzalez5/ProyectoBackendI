const { ProductManager } = require('../dao/ProductManager.js');

const { Router } = require('express');
const router=Router()

router.get("/products", async(req, res)=>{
    let products=await ProductManager.getProducts()

    res.render("products", {products})
})

router.get('/products',async(req,res)=>{
    let products=await ProductManager.getProducts()

    let numero=Math.floor(Math.random()*(20)+0)      // Math.floor(Math.random()*(cantNrosAGenerar)+aPartirDelNro)
    
    let product=products[numero]

    res.render("product", {
        name:product.name, 
        alias:product.alias,
        product
    })
})

module.exports = router;