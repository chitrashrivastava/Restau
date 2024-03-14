const multer = require('multer');

// Define the storage configuration for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Specify the destination directory - jisme puri file upload ho jaegi
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Use the original filename
    }
});

// Create a Multer instance with the storage configuration
const upload = multer({ storage: storage });

module.exports = upload; // Export the upload instance for use in other files
