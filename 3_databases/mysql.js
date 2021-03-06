const mysql = require('mysql')
const dotenv = require('dotenv')
dotenv.config()

const db = mysql.createConnection({
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASS,
    port : 3306,
    database : process.env.DB_NAME
})

module.exports = db