const Router = require('express').Router()
const controller = require('./../2_controllers/products')



Router.get('/',controller.getAllProducts)
Router.get('/:id',controller.getProductById)
Router.post('/', controller.postNewProduct)

Router.delete('/image/:id',controller.deleteImageById)
Router.patch('/image/:id',controller.editImagebyId)



module.exports = Router