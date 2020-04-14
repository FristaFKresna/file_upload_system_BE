const express = require('express')
const app = express()
const port = 4000
const cors = require('cors')
const routeProducts = require('./1_routers/products')

app.use(express.json())
app.use(cors())

app.use('/products', routeProducts)

app.use('/4_public', express.static('4_public'))


app.get('/',(req,res)=>{
    res.send('<h1> Selamat Datang di API File Upload System</h1>')
})


app.listen(port, ()=>{console.log('server running on port '+ port)})