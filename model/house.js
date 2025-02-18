const mongoose = require("mongoose");

const houseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please include name"]
    },
    description: {
        type: String,
        required: [true, "Please include the house description"]
    },
    category: {
        type: String,
        required: [true, "Please include the house category"]
    },
    originalPrice: {
        type: Number
    },
    availability: {
        type: String,
        required: [true, "Please state the availability of the house"]
    },
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
    reviews: [
        {
            user: {
                type: Object
            },
            rating: {
                type: Number
            },
            comment: {
                type: String
            },
            houseId: {
                type: String
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    ratings: {
        type: Number
    },
    agentId: {
        type: String,
        required: true
    },
    agent: {
        type: Object,
        required: true
    },
    sold_out: {
        type: String,
        default: "false" // using false as the default value
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("House", houseSchema);
