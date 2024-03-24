const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

const ENCRYPTION_KEY = crypto.randomBytes(32); // Generate a random 256-bit key
const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text) {
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');

    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
    let textParts = text.split(':');
    let iv = Buffer.from(textParts.shift(), 'hex');
    let encryptedText = Buffer.from(textParts.join(':'), 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');

    decrypted += decipher.final('utf8');

    return decrypted;
}

app.get('/', (req, res) => {
    res.render('index', { encryptedText: '', decryptedText: '' });
});

app.post('/encrypt', (req, res) => {
    const text = req.body.text;
    const encryptedText = encrypt(text);
    res.render('index', { encryptedText, decryptedText: '' });
});

app.post('/decrypt', (req, res) => {
    const text = req.body.text;
    const decryptedText = decrypt(text);
    res.render('index', { encryptedText: '', decryptedText });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
