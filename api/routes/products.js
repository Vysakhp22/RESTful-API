const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const checkAuth = require('../middleware/check-aut');

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

const Product = require('../models/product');

router.get('/', (req, res, next) => {
    Product.find()
        .select('product price _id productImage') // select used for select particular items. select takes only one parameter
        .exec()
        .then((docs) => {
            if (docs?.length > 0) {
                const response = {
                    count: docs.length,
                    products: docs.map(doc => ({
                        _id: doc._id,
                        name: doc.product,
                        price: doc.price,
                        productImage: doc.productImage,
                        request: {
                            type: 'GET',
                            url: "http://localhost:3000/products/" + doc._id
                        }
                    }))
                };
                res.status(200).json(response)
            } else { // else is not necessary because when there is no data found then we will not receive any data 
                res.status(404).json({
                    message: 'No entries found'
                });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: err });
        })
});

router.post('/', checkAuth, upload.single('productImage'), (req, res, next) => { //single used for single image and the name is given in quotes
    console.log(req.file); // new object available due to the middleware
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        product: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    product.save()  // save method used to save product provided by mongoose. It stores the product in the database
        .then((result) => {
            console.log(result);
            res.status(201).json({
                message: 'Handling POST requests to /products',
                createdProduct: {
                    name: result.product,
                    price: result.price,
                    _id: result._id,
                    request: {
                        type: 'GET',
                        url: "http://localhost:3000/products/" + result._id
                    }
                }
            });
        }).catch((error) => {
            console.log(error);
            res.status(500).json({
                message: 'Error saving product',
                error: error
            });
        });
});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    Product.findById(id)
        .select('product price _id')
        .exec()
        .then(result => {
            if (result) {
                res.status(200).json({
                    product: result,
                    request: {
                        type: 'GET',
                        description: 'GET all products',
                        url: "http://localhost:3000/products"
                    }
                });
            } else {
                res.status(404).json({
                    message: `No valid Product found with this ${id} productId`
                });
            }
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

router.patch('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId;
    const updateOps = {};
    for (const ops of req.body) {
        updateOps[ops.propName] = ops.value;
    }
    Product.updateOne({ _id: id }, { $set: updateOps })
        .exec()
        .then((result) => {
            res.status(200).json({
                message: 'Product updated successfully',
                request: {
                    type: 'GET',
                    url: "http://localhost:3000/products/" + id
                }
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({
                error: err
            });
        });
});

router.delete('/:productId', checkAuth, (req, res, next) => {
    const id = req.params.productId;
    Product.deleteOne({ _id: id })  //instead of remvove() here deleteOne() is used
        .exec()
        .then((result) => {
            console.log(result);
            res.status(200).json({
                message: 'Product deleted successfully',
                request: {
                    type: 'POST',
                    url: "http://localhost:3000/products",
                    data: {
                        name: 'String',
                        price: 'Number'
                    }
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: err });
        });
});

module.exports = router;