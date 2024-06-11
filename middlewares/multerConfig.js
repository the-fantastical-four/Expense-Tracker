const multer = require('multer');
const path = require('path');
const fs = require('fs')

const storage = multer.diskStorage({
    destination: 'public/uploads/',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 25000000
    }, // 25MB limit
}).single('profPic');

const checkIfImage = (filePath) => {
    // Define magic numbers for different image formats
    const magicNumbers = {
        jpg: [0xFF, 0xD8, 0xFF],
        png: [0x89, 0x50, 0x4E, 0x47], //89 50 4E 47 0D 0x0A 0x1A 0x0A
        gif: [0x47, 0x49, 0x46, 0x38], // OR GIF87a 0x47, 0x49, 0x46, 0x38, 0x37, 0x61
    };

    // Define EOI markers for different image formats
    const eoiMarkers = {
        jpg: [0xFF, 0xD9],
        png: [0x60, 0x82], // PNG files don't have a specific EOI marker
        gif: [0x3B], // Trailer byte for GIF files
    };

    // Storage for reading the first few bytes and last few bytes of the file
    const headerBuffer = Buffer.alloc(4);
    const footerBuffer = Buffer.alloc(2);

    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, headerBuffer, 0, 4, 0);
    const fileSize = fs.fstatSync(fd).size;
    fs.readSync(fd, footerBuffer, 0, 2, fileSize - 2); // Read last 2 bytes for JPG and PNG, last byte for GIF
    fs.closeSync(fd);

    // Check if the magic numbers match any of the supported image formats
    const fileType = Object.keys(magicNumbers).find(type => {
        const magicNumber = magicNumbers[type];

        if(type == "gif"){
            const fd = fs.openSync(filePath, 'r');
            fs.readSync(fd, footerBuffer, 0, 2, fileSize - 1); // Read last byte for GIF
            fs.closeSync(fd);
        }
        return headerBuffer.slice(0, magicNumber.length).equals(Buffer.from(magicNumber));
    });
    
    if (!fileType) return false; // Not a recognized image format

    // Check if the EOI marker is appropriate for the detected image format
    const eoiMarker = eoiMarkers[fileType];
    const footerBytes = footerBuffer.slice(0, eoiMarker.length);
    return footerBytes.equals(Buffer.from(eoiMarker));
};

module.exports = { upload, checkIfImage };