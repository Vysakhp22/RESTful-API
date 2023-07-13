const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../models/user');

router.post('/signup', (req, res, next) => {
    //checking user already exist
    User.find({ email: req.body.email })
        .exec()
        .then(v => {
            if (v.length) { //check the length because the varible not going to null so need to check length
                return res.status(409).json({ //if exist return
                    message: "User Already Exist"
                });
            } else {
                password: bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        });
                        user.save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    message: "User created"
                                });
                            })
                            .catch(err => {
                                res.status(500).json({
                                    error: err
                                });
                            });
                    }
                })
            }
        }).catch(err => {
            res.status(500).json({
                error: err
            });
        });
});

router.post('/login', (req, res, next) => {
    User.find({ email: req.body.email })
        .exec()
        .then(user => {
            if (user.length < 1) return res.status(401).json({ error: 'Auth failed' });
            bcrypt.compare(req.body.password, user[0].password, (err, result) => { //compare the entered password with passwood in the db
                if (err) {
                    return res.status(401).json({ error: 'Auth failed' });
                }
                if (result) {
                    return res.status(200).json({ message: "Auth Successful" });
                }
                res.status(401).json({ error: 'Auth failed' });
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.delete('/:userId', (req, res, next) => {
    User.deleteOne({ _id: req.params.userId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "User deleted"
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

module.exports = router