const db = require('./../3_databases/mysql')
const fileUpload = require('./../helper/fileUpload')
const fs = require('fs')

const getAllProducts = (req,res)=>{
    const sql = `select p.id as product_id, name, price, created_at, i.id as image_id, image_url from products p
    left join product_images i 
    on p.id = i.id_product;`

    db.query(sql, (err,result)=>{
        try{
            if(err) throw err
            res.json({
                error : false,
                data : result
            })
        }catch(err){
            res.json({
                error : true,
                message : err.message
            })
        }
    })
}

const getProductById = (req,res)=>{
    const sql = `select p.id as product_id, name, price, created_at, i.id as image_id, image_url from products p
    left join product_images i 
    on p.id = i.id_product where p.id = ?;`

    db.query(sql, req.params.id, (err,result)=>{
        try{
            if(err) throw err
            res.json({
                error : false,
                data : result
            })
        }catch(err){
            res.json({
                error : true,
                message : err.message
            })
        }
    })
}

function convertPath(path){
    path=path.split('4_public')
    path[0] = '4_public/'
    return path.join('')
}


const postNewProduct = (req,res)=>{
    // post multiple image to api
    
    console.log('masuk')
    const upload = fileUpload.array('product-images')
    upload(req,res,(err)=>{
        try{

            let isFailed = false
            if(err) throw err
            req.files.forEach((file) => {

                // CHECK EACH FILE SIZE
                if(file.size > 1000000){
                    // fs.unlinkSync(file.path)
                    // throw{error : true, message : "image to big (1 mb)"}
                    isFailed = true
                }

                //CHECK EACH FILE TYPE
                if(!file.mimetype.includes('image')){
                    // fs.unlinkSync(file.path)
                    // throw{message : "file must be image"}
                    isFailed = true
                }
            })

            if(isFailed){
                //DELETE ALL FAILED FILE
                req.files.forEach((file)=>{
                    fs.unlinkSync(file.path)
                })
                throw {error : true, message : "file must be image and below 1 mb"}
            }else{
                console.log(req.files)  // NANGKEP DATA FILES IMAGE
                console.log(req.body.data)  // NANGKEP DATA TEXT BERBENTUK STRING
                let data = req.body.data
                console.log(data)           //DATA MASI BERBENTUK STRING
                data = JSON.parse(data)     //CONVERT STRING JADI OBJECT JSON
                console.log(data)           //DATA SUDAH BERBENTUK JSON SEHINGGA BISA DIAKSES

                //post ke product images (path dari req.files)
                
                // post ke dua table  ====> product & product_image
                // POST DATA TO DATABASES

                //post product name and price to products table
                let sql_1 = 'insert into products set ?'
                db.query(sql_1, data, (err,result)=>{
                    try{
                        if(err) throw err

                        console.log(result)
                        console.log(result.insertId)  // BUAT DAPET ID PRODUCT


                        // looping to make array of object

                        // let dataProductImages = req.files.map((file)=>{
                        //     return{
                        //         image_url : file.path,
                        //         id_product : result.insertId
                        //     }
                        // })
                        /**
                         * [
                         *      {image_url : url, id_product : id},
                         *      {image_url : url, id_product : id}
                         * ]
                         */
                        // console.log(dataProductImages)
                        

                        // looping for generate query multiple insert
                        let sql_2 = 'insert into product_images (image_url, id_product) values'
                        req.files.forEach((file,index)=>{
                            if(index === req.files.length - 1){
                                sql_2 += `("${convertPath(file.path)}" , ${result.insertId});`
                            }else{
                                sql_2 += `("${convertPath(file.path)}" , ${result.insertId}),`
                            }
                        })

                        


                        // dataProductImages.forEach((data,index)=>{
                        //     if(index === dataProductImages.length - 1){
                        //         sql_2 += `("${data.image_url}" , ${data.id_product});`
                        //     }else{
                        //         sql_2 += `("${data.image_url}" , ${data.id_product}),`
                        //     }
                        // })
                        


                        //post multiple data image url to product images
                        db.query(sql_2, (err, result)=>{
                            try{
                                if(err) throw err
                                res.json({
                                    error : false,
                                    message : 'product successfully added'
                                })
                            }catch(err){
                                res.json({
                                    error : true,
                                    message : err.message
                                })
                            }
                        })
  
                    }catch(err){
                        res.json({
                            error : true,
                            message : err.message
                        })
                    }
                })
            }

        }catch(err){
            res.json(err)
            console.log(err)
        }
    })
}


const deleteImageById = (req,res)=>{
    //delete url_image di database
    //delete image nya di api
    const id = req.params.id
    let sql = 'select image_url from product_images where id = ?'
    db.query(sql,id,(err,result)=>{                                     
        try{
            if(err) throw err
            fs.unlinkSync(result[0].image_url)
            let sql = 'delete from product_images where id = ?'
            db.query(sql,id,(err,result)=>{
                try{
                    if(err)throw err
                    res.json({
                        error : false,
                        message : 'Delete Image Success'
                    })
                }catch(err){
                    res.json({
                        error : true,
                        message : err.message
                    })
                }
            })
        }catch(err){
            res.json({
                error : true,
                message : err.message
            })
        }
    })
}


const editImagebyId = (req,res)=>{
    //edit image_url di database
    //post image ke api
    //delete old image from api
    let id = req.params.id
    let sql = 'select image_url from product_images where id = ?'
    db.query(sql,id, (err,result)=>{
        try{
            if(err) throw err
            fs.unlinkSync(result[0].image_url)

            const upload = fileUpload.single('product-images')
            upload(req,res,(err)=>{
                try{
                    let isFailed = false
                    if(err)throw err
                    
                    if(req.file.size > 1000000){
                        isFailed = true
                    }
        
                    if(!req.file.mimetype.includes('image')){
                        isFailed = true
                    }

                    if(isFailed){
                        fs.unlinkSync(req.file.path)
                        throw{error : true, message : 'file must be image and below 1mb'}
                    }else{
                        // console.log(req.file)
                        // console.log(req.files)
                        let id = req.params.id
                        // let data = {
                        //     image_url : convertPath(req.file.path)
                        // }

                        let sql = `update product_images set image_url = "${convertPath(req.file.path)}" where id = ?`
                        db.query(sql, id, (err,result)=>{
                            try{
                                if(err)throw err
                                res.json({
                                    error : false,
                                    message : 'Edit Image Success'
                                })

                            }catch(err){
                                res.json({
                                    error : true,
                                    message : err.message
                                })
                            }
                        })
                    }
                }catch(err){
                    res.json(err)
                    console.log(err)
                }
            })
        }catch(err){
            res.json({
                error : true,
                message : err.message
            })
        }
    })

}





module.exports = {
    getAllProducts : getAllProducts,
    getProductById : getProductById,
    postNewProduct : postNewProduct,
    deleteImageById : deleteImageById,
    editImagebyId : editImagebyId
}