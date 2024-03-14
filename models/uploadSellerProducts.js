const mongoose = require('mongoose');

// Define the food schema
const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String, // Assuming you store the image file path
        required: true
    }
});

// Create a model from the schema
const Food = mongoose.model('Food', foodSchema);

module.exports = Food;
