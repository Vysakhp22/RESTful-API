const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Product = require('../models/product');

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'Handling GET requests to /products'
    });
});

router.post('/', (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        product: req.body.name,
        price: req.body.price
    });
    product.save()  // save method used to save product provided by mongoose. It stores the product in the database
        .then((result) => {
            console.log(result);
            res.status(201).json({
                message: 'Handling POST requests to /products',
                createdProduct: product
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
    const productId = req.params.productId;
    if (productId === 'special') {
        res.status(200).json({
            message: 'You discovered the special product',
            id: productId
        });
    } else {
        res.status(200).json({
            message: 'You passed productId',
            id: productId
        });
    }
});

router.patch('/:productId', (req, res, next) => {
    res.status(200).json({
        message: 'updated product..!'
    });
});

router.delete('/:productId', (req, res, next) => {
    res.status(200).json({
        message: 'Deleted product'
    });
});

module.exports = router;