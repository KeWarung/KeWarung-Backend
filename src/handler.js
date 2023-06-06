const { nanoid } = require('nanoid');
// const { Storage } = require('@google-cloud/storage');
const fs = require('fs-extra');
// const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// const ffmpeg = require('fluent-ffmpeg');
// const axios = require('axios');
const db = require('./database');
require('dotenv').config();
console.log(process.env.SECRET_STRING) // remove this after you've confirmed it is working

const maxExpire = 3 * 24 * 60 * 60;
const createToken = (id) => jwt.sign({ id }, process.env.SECRET_STRING, {
    expiresIn: maxExpire,
});

exports.getAllUsers = async (req, res) => {
    const result = await db.promise().query('SELECT * FROM tb_user');
    res.send(result[0]);
};

exports.signupPost = async (req, res) => {
    const {
        email,
        password,
        nama_toko,
    } = req.body;

    const id = nanoid(16);

    // Email validation
    if (email === '') {
        const response = res.send({
            status: 'Gagal',
            message: 'Email tidak boleh kosong.',
        });
        response.status(400);
        return response;
    }

    // if (email.length < 15) {
    //     const response = res.send({
    //         status: 'Gagal',
    //         message: 'Panjang email harus 15 karakter atau lebih!',
    //     });
    //     response.status(400);
    //     return response;
    // }

    // Password validation
    // if (password === '') {
    //     const response = res.send({
    //         status: 'Gagal',
    //         message: 'Password tidak boleh kosong.',
    //     });
    //     response.status(400);
    //     return response;
    // }

    // if (password.length < 6) {
    //     const response = res.send({
    //         status: 'Gagal',
    //         message: 'Panjang karakter password setidaknya 6 karakter atau lebih.',
    //     });
    //     response.status(400);
    //     return response;
    // }

    // Nama_toko validation
    if (nama_toko === '') {
        const response = res.send({
            status: 'Gagal',
            message: 'Nama toko tidak boleh kosong',
        });
        response.status(400);
        return response;
    }

    // if (nama_toko.length < 4) {
    //     const response = res.send({
    //         status: 'Gagal',
    //         message: 'Panjang karakter nama toko setidaknya 6 karakter atau lebih.',
    //     });
    //     response.status(400);
    //     return response;
    // }

    const [rows] = await db.promise().query(`SELECT * FROM tb_user WHERE email = '${req.body.email}'`);
    if (rows.length !== 0) {
        return res.status(500).json({ message: 'Email telah digunakan' });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.promise().query(`INSERT INTO tb_user(id_user,email,password,nama_toko) VALUES('${id}', '${email}', '${hashedPassword}', '${nama_toko}')`);

    const response = res.send({
        status: 'Sukses',
        message: 'User baru berhasil ditambahkan.',
        data: {
            userId: id,
        },
    });
    response.status(201);
    return response;
};

exports.getUserById = async (req, res) => {
    const [rows] = await db.promise().query('SELECT * FROM tb_user WHERE id_user = ?', [req.params.id]);

    if (rows.length === 0) {
        return res.status(404).json({ message: 'ID user tidak dapat ditemukan!' });
    }

    const response = res.status(200).json({ message: 'Data ditemukan. ', data: rows[0] });
    return response;
};

exports.editUserById = async (req, res) => {
    const {
        email,
        password,
        nama_toko,
        foto_toko,
    } = req.body;

    // Email validation
    if (email === '') {
        const response = res.send({
            status: 'Gagal',
            message: 'Email tidak boleh kosong.',
        });
        response.status(400);
        return response;
    }
    // if (email.length < 15) {
    //     const response = res.send({
    //         status: 'Gagal',
    //         message: 'Panjang karakter email setidaknya 15 karakter atau lebih!',
    //     });
    //     response.status(400);
    //     return response;
    // }

    // Password validation
    if (password === '') {
        const response = res.send({
            status: 'Gagal',
            message: 'Password tidak boleh kosong.',
        });
        response.status(400);
        return response;
    }
    // if (password.length < 6) {
    //     const response = res.send({
    //         status: 'Gagal',
    //         message: 'Panjang karakter password setidaknya 6 karakter atau lebih!',
    //     });
    //     response.status(400);
    //     return response;
    // }
    // Nama toko Validation
    if (nama_toko === '') {
        const response = res.send({
            status: 'Gagal',
            message: 'Nama toko tidak boleh kosong',
        });
        response.status(400);
        return response;
    }
    // if (nama_toko.length < 4) {
    //     const response = res.send({
    //         status: 'Gagal',
    //         message: 'Panjang karakter nama toko setidaknya 4 karakter atau lebih.',
    //     });
    //     response.status(400);
    //     return response;
    // }

    // Check if the id is exist in database.
    const [rows] = await db.promise().query('SELECT * FROM tb_user WHERE id_user = ?', [req.params.id]);
    if (rows.length === 0) {
        return res.status(404).json({ message: 'ID user tidak dapat ditemukan!' });
    }

    // Check if the username is not used by other user.
    const [check] = await db.promise().query('SELECT * FROM tb_user WHERE email = ?', [req.body.email]);
    if (check.length === 0) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        await db.promise().query('UPDATE tb_user SET email = ?, password = ?,  nama_toko = ?, foto_toko = ? WHERE id_user = ?', [email, hashedPassword, nama_toko, foto_toko, req.params.id]);
        return res.status(200).json(
            { message: 'Data telah diperbarui.', id: req.params.id },
        );
    }

    // Check if the username is already used by other user.
    if (check.rows !== 0 && check[0].id !== req.params.id) {
        return res.status(500).json({ message: 'Email sudah digunakan!' });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.promise().query('UPDATE tb_user SET email = ?, password = ?,  nama_toko = ? foto_toko = ? WHERE id_user = ?', [email, hashedPassword, nama_toko, req.params.id]);
    return res.status(200).json(
        { message: 'Data telah diperbarui.', id: req.params.id },
    );
};

exports.deleteUserById = async (req, res) => {
    const [rows] = await db.promise().query('SELECT * FROM tb_user WHERE id_user = ?', [req.params.id]);

    // Check if the id is found in database or not
    if (rows.length === 0) {
        return res.status(404).json({ message: 'ID user tidak ditemukan.' });
    }

    db.promise().query('DELETE from tb_user WHERE id_user = ?', [req.params.id]);
    return res.status(200).json({ message: 'Data user telah dihapus', data: rows });
};

exports.getAllProducts = async (req, res) => {
    const result = await db.promise().query('SELECT * FROM tb_produk');
    res.send(result[0]);
};

exports.addProducts = async (req, res) => {
    const {
        nama_produk,
        harga,
        stok,
        foto_produk,
    } = req.body;

    const id_product = nanoid(16);

    
    const [rows] = await db.promise().query(`SELECT * FROM tb_produk WHERE nama_produk = '${req.body.nama_produk}'`);
    if (rows.length !== 0) {
        return res.status(500).json({ message: 'Nama produk sudah ada' });
    }

    await db.promise().query(`INSERT INTO tb_produk(id_produk,id_user,nama_produk,harga,stok, foto_toko) VALUES('${id_product}', '${id_user}', '${nama_produk}', '${harga}', '${stok}'), '${foto_produk}'`);

    const response = res.send({
        status: 'Sukses',
        message: 'Produk baru berhasil ditambahkan.',
        data: {
            produkId: id_product,
        },
    });
    response.status(201);
    return response;
};


exports.getProductById = async (req, res) => {

    const [rows] = await db.promise().query('SELECT * FROM tb_produk WHERE id_produk = ?', [req.params.id]);

    if (rows.length === 0) {
        return res.status(404).json({ message: 'ID produk tidak dapat ditemukan!' });
    }

    const response = res.status(200).json({ message: 'Data ditemukan. ', data: rows[0] });
    return response;
};

exports.getProductByIdUser = async () => {
    const [rows] = await db.promise().query('SELECT * FROM tb_produk WHERE id_user = ?', [req.params.id]);

    if (rows.length === 0) {
        return res.status(404).json({ message: 'ID produk dengan ID User tersebut tidak dapat ditemukan!' });
    }

    const response = res.status(200).json({ message: 'Data ditemukan. ', data: rows[0] });
    return response;
};

exports.editProductById = async (req, res) => {
    const {
        // id_user,
        nama_produk,
        harga,
        stok,
        foto_produk,
    } = req.body;

    
    // Check if the id is exist in database.
    const [rows] = await db.promise().query('SELECT * FROM tb_produk WHERE id_product = ?', [req.params.id]);
    if (rows.length === 0) {
        return res.status(404).json({ message: 'ID produk tidak dapat ditemukan!' });
    }

    // Check if the username is not used by other user.
    const [check] = await db.promise().query('SELECT * FROM tb_produk WHERE nama_produk = ?', [req.body.nama_produk]);
    if (check.length === 0) {

        await db.promise().query('UPDATE tb_produk SET nama_produk = ?, harga = ?,  stok = ?, foto_produk = ? WHERE id_produk = ?', [nama_produk, harga, stok, foto_produk, req.params.id]);
        return res.status(200).json(
            { message: 'Data telah diperbarui.', id: req.params.id },
        );
    }

    // Check if the username is already used by other user.
    if (check.rows !== 0 && check[0].id !== req.params.id) {
        return res.status(500).json({ message: 'Nama produk sudah digunakan!' });
    }

    await db.promise().query('UPDATE tb_produk SET nama_produk = ?, harga = ?,  stok = ?, foto_produk = ? WHERE id_produk = ?', [nama_produk, harga, stok, foto_produk, req.params.id_product]);
    return res.status(200).json(
        { message: 'Data telah diperbarui.', id: req.params.id },
    );
};

exports.deleteProductById = async (req, res) => {
    const [rows] = await db.promise().query('SELECT * FROM tb_produk WHERE id_produk = ?', [req.params.id]);
    console.log(req.params.id);
    // Check if the id is found in database or not
    if (rows.length === 0) {
        return res.status(404).json({ message: 'ID produk tidak ditemukan.' });
    }

    db.promise().query('DELETE from tb_produk WHERE id_produk = ?', [req.params.id_product]);
    return res.status(200).json({ message: 'Data produk telah dihapus', data: rows });
};

exports.addProducts = async (req, res) => {
    const {
        nama_produk,
        harga,
        stok,
        foto_produk,
    } = req.body;

    const id_product = nanoid(16);

    
    const [rows] = await db.promise().query(`SELECT * FROM tb_produk WHERE nama_produk = '${req.body.nama_produk}'`);
    if (rows.length !== 0) {
        return res.status(500).json({ message: 'Nama produk sudah ada' });
    }

    await db.promise().query(`INSERT INTO tb_produk(id_produk,id_user,nama_produk,harga,stok, foto_toko) VALUES('${id_product}', '${id_user}', '${nama_produk}', '${harga}', '${stok}'), '${foto_produk}'`);

    const response = res.send({
        status: 'Sukses',
        message: 'Produk baru berhasil ditambahkan.',
        data: {
            produkId: id_product,
        },
    });
    response.status(201);
    return response;
};

exports.getAllOrders = async (req, res) => {
    const result = await db.promise().query('SELECT * FROM tb_order INNER JOIN tb_detailorder ON tb_order.id_order = tb_detailorder.id_order');
    res.send(result[0]);
};

exports.login = async (req, res) => {
    const {
        email,
        password,
    } = req.body;

    if (email === '') {
        const response = res.send({
            status: 'Gagal',
            message: 'Email tidak boleh kosong',
        });
        response.status(400);
        return response;
    }
    // if (email.length < 15) {
    //     const response = res.send({
    //         status: 'Gagal',
    //         message: 'Panjang karakter email setidaknya 15 karakter atau lebih!',
    //     });
    //     response.status(400);
    //     return response;
    // }
    if (password === '') {
        const response = res.send({
            status: 'Gagal',
            message: 'Password tidak boleh kosong',
        });
        response.status(400);
        return response;
    }
    // if (password.length < 6) {
    //     const response = res.send({
    //         status: 'Gagal',
    //         message: 'Panjang karakter password setidaknya 6 karakter atau lebih!',
    //     });
    //     response.status(400);
    //     return response;
    // }

    const [rows] = await db.promise().query(`SELECT * FROM tb_user WHERE email = '${req.body.email}'`);
    if (rows.length !== 0) {

        const auth =bcrypt.compareSync(password, rows[0].password);
        console.log(password);
        console.log(rows[0].password);
        console.log(bcrypt.compareSync(password, rows[0].password));

        if (auth) {
            const token = createToken(rows[0].id);
            console.log(token);
            res.cookie('jwt', token, { httpOnly: false, maxAge: maxExpire * 1000 });
            const response = res.status(200).json({
                message: 'Berhasil Login.',
                user_id: rows[0].id_user,
            });
            return response;
        }
        const response = res.status(404).json({ message: 'Password salah!' });
        return response;
    }
    const response = res.status(404).json({ message: 'Email tidak ditemukan!' });
    return response;
};

exports.logout = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    const response = res.status(200).json({ message: 'Anda telah logout.' });
    return response;
};
