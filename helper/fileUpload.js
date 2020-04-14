const multer = require('multer')
const storageOptions = multer.diskStorage({
    destination : (req,file,cb) => {
        cb(null, '4_public/')
    },
    filename : (req,file,cb) => {
        console.log(file)
        cb(null, 'PRD-IMG'+ Date.now() + '.' + file.mimetype.split('/')[1])
    }
})

const upload = multer({storage : storageOptions})

module.exports = upload