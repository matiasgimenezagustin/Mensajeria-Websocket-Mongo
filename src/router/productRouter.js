const express = require('express')

const router = express.Router()

/* 
MANAGER DE FILESYSTEM
const manager = require('../dao/productsManagerMongo').manager; 
 */


const {manager} = require('../dao/productsManagerMongo')

router.get('/', async (req, res) => {
    const { limit } = req.query;
    let response 
    if (limit) {
        response = await manager.getProductsFromMongo(Number(limit))
    } else {
        response = await manager.getProductsFromMongo()
    }
    if(response.ok){
        res.status(200).json(response)
    }
    else{
        res.status(400).json('Can not get Products')
    }
});

router.get('/:pid', async (req, res) => {
    const pid = req.params.pid;
    const product = await manager.getProductByIdFromMongo(pid);
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Product not found' });
    }
});

router.post('/', async (req, res) =>{
    /* const {title, description, code, price, status, stock, category} = req.body */
    const newProduct = req.body
    const response = await manager.addProductToMongo(newProduct)
    if(response.ok){
        res.status(200).send(response)
    }
    else{
        res.status(400).send('Error, can not post the product')
    }
})

router.put('/:pid', async (req, res)=>{
    const updatedProduct = req.body
    const {pid} = req.params
    const response = await manager.updateProductByIdInMongo(pid, updatedProduct)
    if(response.ok){
        res.status(200).send(response)
    }
    else{
        res.status(400).send('Error, can not update the product')
    }
    
})

router.delete('/:pid', async (req, res) =>{
    const {pid} = req.params
    const response = await manager.deleteProductByIdFromMongo(pid)
    if(response.ok){
        res.send(response)
    }
    else{
        res.status(400).send(response.error)
    }
})


module.exports = router;