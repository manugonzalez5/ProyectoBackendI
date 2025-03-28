import {Router} from 'express';
import {procesaErrores} from '../utils/utils.js';
import { CartMongoManager } from '../dao/CartMongoManager.js';
import { isValidObjectId } from 'mongoose';
export const router = Router();

router.post('/', async (req, res) => {

});

router.post('/:cid/products/:pid', async (req, res) => {

});

router.get('/:cid', async (req, res) => {

});

router.post('/:cid/purchase', async (req, res) => {

});

router.put('/:cid', async (req, res) => {

});

router.delete('/:cid', async (req, res) => {

});

export default router;