const crypto = require("crypto");

const key = process.env.ENCRYPTION_KEY || "secret";
const algorithm = process.env.ENCRYPTION_ALGORITHM || 'aes256';
const inputEncoding = process.env.ENCRYPTION_INPUT_ENCODING || 'utf8';
const outputEncoding = process.env.ENCRYPTION_OUTPUT_ENCODING || 'hex';


module.exports = {
    encrypt: function(value, useKey=key) {
        var cipher = crypto.createCipher(algorithm, useKey);
        var encrypted = cipher.update(value, inputEncoding, outputEncoding);
        encrypted += cipher.final(outputEncoding);
        return encrypted;
    },
    decrypt: function(encrypted, useKey=key) {
        var decipher = crypto.createDecipher(algorithm, useKey);
        var decrypted = decipher.update(encrypted, outputEncoding, inputEncoding);
        decrypted += decipher.final(inputEncoding);
        return decrypted;
    }
}