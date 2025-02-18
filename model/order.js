const mongoose = require("mongoose");


const orderSchema = new mongoose.Schema({
    cart:{
        type:String,
        required: true
    },
    address:{
        type: Object,
        required: true
    },
    user:{
        type: Object,
        required: true
    },
    status:{
        type: String,
        default: "Processing"
    },
    paymentInfo:{
        id:{
            type: String
        },
        status:{
            type: String
        },
        type: {
            type: String
        }
    },
    paidAt:{
        type: Date,
        default: Date.now()
    },
    approvedAt:{
        type: Date
    },
    createdAt:{
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model("Order", orderSchema);