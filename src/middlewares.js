const jwt = require('jsonwebtoken');
require('dotenv').config();

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.status(400).json({ message: 'Token tidak terdeteksi, harap login terlebih dahulu!' });
    }

    // Check JWT exist & is verified
    jwt.verify(token, (process.env.SECRET_STRING), (err) => {
        if (err) {
            return res.status(400).json({ message: 'Anda tidak memiliki hak untuk mengakses request ini!' });
        }
        return next();
    });
    return 0;
};

module.exports = { requireAuth };