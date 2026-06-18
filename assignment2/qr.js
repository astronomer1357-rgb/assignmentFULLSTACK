const Jimp = require('jimp');
const jsQR = require('jsqr');
const fs = require('fs');
async function decodeQR(imagePath) {
    if (!fs.existsSync(imagePath)) {
        throw new Error(`Image file not found at: ${imagePath}`);
    }
    const image = await Jimp.read(imagePath);
    const { data, width, height } = image.bitmap;
    const qrCode = jsQR(data, width, height);
    if (!qrCode) {
        throw new Error("Could not find or decode a valid QR code in this image.");
    }
    return qrCode.data;
}

module.exports = { decodeQR };