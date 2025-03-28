import {Router} from 'express';
import {procesaErrores} from '../utils/utils.js';
import { ProductosMongoManager } from '../dao/ProductosMongoManager.js';
import { isValidObjectId } from 'mongoose';
export const router = Router();

router.get('/', async (req, res) => {
    try {
        let {page, limit}=req.query
        if(!page){
            page=1
        }
        if(!limit){
            limit=1
        }
        let {docs:productos, totalPages, hasNextPage, nextPage, hasPrevPage, prevPage}=await ProductosMongoManager.get(page, limit)
    
        
    
        res.setHeader('Content-Type','application/json')
        res.status(200).json({
            productos, 
            totalPages, 
            hasNextPage, 
            hasPrevPage,
            nextPage, 
            prevPage,
            page, 
        })
    } catch (err) {
        res.status(500).send({ error: `Error en el servidor: ${err.message}` });
    }
});

router.post ('/', async (req, res) => {
    let {title, code, stock, price, thumbnail, category} = req.body;
    if (!title || !code || !stock || !price || !thumbnail || !category) {
        return res.status(400).send({ error: 'Todos los campos son requeridos' });
    }
    // resto de validaciones pertinentes
    try {
        let product = await ProductosMongoManager.save({title, code, stock, price, thumbnail, category});
        res.status(201).json({ data: product });
    } catch (err) {
        res.status(500).send({ error: `Error en el servidor: ${err.message}` });
    }
});

router.put ('/:id', async (req, res) => {
    let aModificar= req.body;
    let {id}= req.params;
    if(!isValidObjectId(id)){
        return res.status(400).send({ error: 'ingrese un Id inválido' });
    }
    // validaciones pertinentes 
    try{
        let productoModificado= await ProductosMongoManager.update(id, aModificar);
        res.status(200).json({ data: productoModificado });
    } catch (err) {
        procesaErrores(err, res);
    }
});

router.delete ('/:id', async (req, res) => {
    let {id}= req.params;
    if(!isValidObjectId(id)){
        return res.status(400).send({ error: 'ingrese un Id inválido' });
    }
    // validaciones pertinentes 
    try{
        let productoEliminado= await ProductosMongoManager.delete(id);
        res.status(200).json({ data: productoEliminado });
    } catch (err) {
        procesaErrores(err, res);
    }
});

export default router;