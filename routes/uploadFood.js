const upload = require('../utils/multer'); //upload
const Food=require('../models/uploadSellerProducts')
const express=require('express')
const router=express.Router()

router.get('/uploadproducts', (req, res) => {
    res.render('uploadFood')
  });
  router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        // Extract form data from the request body
        const { name, description, price } = req.body;

        // Extract file data (uploaded image) from Multer
        const image = req.file.path; // Assuming you store the image file path

        // Create a new food object using the schema
        const food = new Food({
            name: name,
            description: description,
            price: price,
            image: image
        });

        // Save the food details to the database
        await food.save();

        // Respond with a success message
        res.send('Food details uploaded successfully!');
    } catch (error) {
        // Handle errors
        console.error('Error uploading food details:', error);
        res.status(500).send('Internal server error');
    }
});
module.exports=router