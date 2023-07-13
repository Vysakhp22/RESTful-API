const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middleware/check-aut');
const productControllers = require('../controllers/product');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
        cb(null, true);// callback set to true to accept the file, to send error message add error instead of null
    }
    else {
        cb(new Error('file not supported'), false);// callback set to false to ignore the file  
    }
}

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter: fileFilter
});



router.get('/',productControllers.products_get_all_products);

router.post('/', checkAuth, upload.single('productImage'), productControllers.products_create_product);

router.get('/:productId', productControllers.products_get_product);

router.patch('/:productId', checkAuth, productControllers.products_update_product);

router.delete('/:productId', checkAuth, productControllers.products_delete_product);

module.exports = router;