const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Store outside web root typically, but for this demo into server/uploads
        // In extreme security, this would be an S3 bucket or a folder not served by static middleware directly without checks
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Rename file to prevent path traversal issues or overwriting
        // Use UUID + original extension
        const uniqueSuffix = uuidv4();
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Check file type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|webp/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Images Only! (jpeg, jpg, png, webp)'));
    }
}

// Init upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 2000000 }, // 2MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

module.exports = upload;
