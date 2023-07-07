const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, //used to keep a relation (ref is string & value is name of the model you want to connect)
    quantity: { type: Number, default: 1 } // it can be set as required or can set a default value both are same
});

module.exports = mongoose.model('Order', orderSchema);