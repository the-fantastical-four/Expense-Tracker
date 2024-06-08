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
        png: [0x89, 0x50, 0x4E, 0x47],
        gif: [0x47, 0x49, 0x46],
    };

    // Read the first few bytes of the file
    const buffer = Buffer.alloc(4);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 4, 0);
    fs.closeSync(fd);

    // Check if the magic numbers match any of the supported image formats
    const fileType = Object.keys(magicNumbers).find(type => {
        const magicNumber = magicNumbers[type];
        return buffer.slice(0, magicNumber.length).equals(Buffer.from(magicNumber));
    });

    return fileType !== undefined;
};

module.exports = { upload, checkIfImage };