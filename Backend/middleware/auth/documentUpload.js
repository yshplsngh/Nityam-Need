const multer = require('multer')

const storage = multer.memoryStorage();

const documentUpload = multer({
    storage,
}).single("file")

module.exports = documentUpload