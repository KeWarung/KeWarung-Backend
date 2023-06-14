const { nanoid } = require('nanoid');
const { Storage } = require('@google-cloud/storage');
const fs = require('fs-extra');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// const ffmpeg = require('fluent-ffmpeg');
const axios = require('axios');
const db = require('./database');
require('dotenv').config();

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

    const validateEmail = (email) => {
        return email.match(
          /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };

    if(!validateEmail(email)){
        const response = res.send({
            status: 'Gagal',
            message: 'Alamat email tidak valid.',
        });
        response.status(400);
        return response;
    }  

    const [rows] = await db.promise().query(`SELECT * FROM tb_user WHERE email = '${req.body.email}'`);
    if (rows.length !== 0) {
        return res.status(500).json({ message: 'Email telah digunakan' });
    }

    // Password validation
    if (password === '') {
        const response = res.send({
            status: 'Gagal',
            message: 'Password tidak boleh kosong.',
        });
        response.status(400);
        return response;
    }

    // Nama_toko validation
    if (nama_toko === '') {
        const response = res.send({
            status: 'Gagal',
            message: 'Nama toko tidak boleh kosong',
        });
        response.status(400);
        return response;
    }

    // Password Encrypt    
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

    const validateEmail = (email) => {
        return email.match(
          /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
    };

    if(!validateEmail(email)){
        const response = res.send({
            status: 'Gagal',
            message: 'Alamat email tidak valid.',
        });
        response.status(400);
        return response;
    }  

    // Password validation
    if (password === '') {
        const response = res.send({
            status: 'Gagal',
            message: 'Password tidak boleh kosong.',
        });
        response.status(400);
        return response;
    }

    // Nama_toko validation
    if (nama_toko === '') {
        const response = res.send({
            status: 'Gagal',
            message: 'Nama toko tidak boleh kosong',
        });
        response.status(400);
        return response;
    }

    // Check if the id is exist in database.
    const [rows] = await db.promise().query('SELECT * FROM tb_user WHERE id_user = ?', [req.params.id]);
    if (rows.length === 0) {
        return res.status(404).json({ message: 'ID user tidak dapat ditemukan!' });
    }

    // Check if the email is not used by other user.
    const [check] = await db.promise().query('SELECT * FROM tb_user WHERE email = ?', [req.body.email]);
    if (check.length === 0) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        await db.promise().query('UPDATE tb_user SET foto_toko = ? WHERE id_user = ?', [foto_toko, req.params.id]);
        return res.status(200).json(
            { message: 'Data telah diperbarui.', id: req.params.id },
        );
    }

    // Check if the email is already used by other user.
    if (check.rows !== 0 && check[0].id !== req.params.id) {
        return res.status(500).json({ message: 'Email sudah digunakan!' });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.promise().query('UPDATE tb_user SET foto_toko = ? WHERE id_user = ?', [foto_toko, req.params.id]);
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
        foto,
    } = req.body;

    // Nama produk validation
    if (nama_produk === '') {
        const response = res.send({
            status: 'Gagal',
            message: 'Nama produk tidak boleh kosong.',
        });
        response.status(400);
        return response;
    }

    // Harga validation
    if (harga === '') {
        const response = res.send({
            status: 'Gagal',
            message: 'Harga produk tidak boleh kosong.',
        });
        response.status(400);
        return response;
    }

    // Stok validation
    if (stok === '') {
        const response = res.send({
            status: 'Gagal',
            message: 'Stok tidak boleh kosong.',
        });
        response.status(400);
        return response;
    }

    const id_product = nanoid(16);

    await db.promise().query(`INSERT INTO tb_produk(id_produk,id_user,nama_produk,harga,stok, foto) VALUES('${id_product}', '${req.params.idUser}', '${nama_produk}', '${harga}', '${stok}', '${foto}')`);

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

exports.getProductByIdUser = async (req, res) => {
    const [rows] = await db.promise().query('SELECT * FROM tb_produk WHERE id_user = ?', [req.params.id]);

    if (rows.length === 0) {
        return res.status(404).json({ message: 'ID produk dengan ID User tersebut tidak dapat ditemukan!' });
    }

    const response = res.status(200).json({ message: 'Data ditemukan. ', data: rows });
    return response;
};

exports.getProductByStok = async (req, res) => {
    const [rows] = await db.promise().query('SELECT * FROM tb_produk WHERE stok < ? ', [req.params.id]);

    if (rows.length === 0) {
        return res.status(404).json({ message: 'Tidak ada produk dengan stok tersebut!' });
    }

    const response = res.status(200).json({ message: 'Data ditemukan. ', data: rows[0] });
    return response;
};

exports.getProductByName = async (req, res) => {
    const sql ="SELECT * FROM tb_produk WHERE nama_produk LIKE ? AND id_user = ? ";
    const [rows] = await db.promise().query(sql, [req.params.id, req.params.idUser]);

    if (rows.length === 0) {
        return res.status(404).json({ message: 'Produk tidak ditemukan.' });
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

    // Nama produk validation
    if (nama_produk === '') {
        const response = res.send({
            status: 'Gagal',
            message: 'Nama produk tidak boleh kosong.',
        });
        response.status(400);
        return response;
    }

    // Harga validation
    if (harga === '') {
        const response = res.send({
            status: 'Gagal',
            message: 'Harga produk tidak boleh kosong.',
        });
        response.status(400);
        return response;
    }

    // Check if the id is exist in database.
    const [rows] = await db.promise().query('SELECT * FROM tb_produk WHERE id_produk = ?', [req.params.id]);
    if (rows.length === 0) {
        return res.status(404).json({ message: 'ID produk tidak dapat ditemukan!' });
    }

    // Check if the username is not used by other user.
    const [check] = await db.promise().query('SELECT * FROM tb_produk WHERE nama_produk = ?', [req.body.nama_produk]);
    if (check.length === 0) {

        await db.promise().query('UPDATE tb_produk SET nama_produk = ?, harga = ?,  stok = ?, foto = ? WHERE id_produk = ?', [nama_produk, harga, stok, foto_produk, req.params.id]);
        return res.status(200).json(
            { message: 'Data telah diperbarui.', id: req.params.id },
        );
    }

    // Check if the username is already used by other user.
    if (check.rows !== 0 && check[0].id !== req.params.id) {
        return res.status(500).json({ message: 'Nama produk sudah digunakan!' });
    }

    await db.promise().query('UPDATE tb_produk SET nama_produk = ?, harga = ?,  stok = ?, foto = ? WHERE id_produk = ?', [nama_produk, harga, stok, foto_produk, req.params.id_product]);
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

exports.addOrder = async (req, res) => {
    const {
        tgl_order,
        harga,
        qty,
        status,
        total,
        subtotal,
    } = req.body;

    // Tanggal Order Validation
    if (tgl_order === undefined) {
        const response = res.send({
            status: 'Gagal',
            message: 'Tanggal produk tidak boleh kosong.',
        });
        response.status(400);
        return response;
    }

    // Harga Validation
    if (harga === 0) {
        const response = res.send({
            status: 'Gagal',
            message: 'Harga tidak boleh kosong.',
        });
        response.status(400);
        return response;
    }

    // Qty Order Validation
    if (qty === 0) {
        const response = res.send({
            status: 'Gagal',
            message: 'Jumlah pembelian produk tidak boleh kosong.',
        });
        response.status(400);
        return response;
    }

    const id_order = nanoid(16);
    const id_detailorder = nanoid(16);

    await db.promise().query(`INSERT INTO tb_order VALUES('${id_order}', '${req.params.idUser}', '${tgl_order}', '${status}', '${total}')`) ;
    await db.promise().query(`INSERT INTO tb_detailorder VALUES('${id_detailorder}', '${id_order}', '${qty}', '${req.params.idProduct}', '${subtotal}') `);

    const response = res.send({
        status: 'Sukses',
        message: 'Order baru berhasil ditambahkan.',
        data: {
            orderId: id_order,
            tglOrder: tgl_order,
            total: total,
        },
    });
    response.status(201);
    return response;
};

exports.getAllOrders = async (req, res) => {
    const result = await db.promise().query('SELECT * FROM tb_order INNER JOIN tb_detailorder ON tb_order.id_order = tb_detailorder.id_order');
    res.send(result[0]);
};

exports.getOrderById = async (req, res) => {

    const [rows] = await db.promise().query('SELECT * FROM tb_order INNER JOIN tb_detailorder ON tb_order.id_order = tb_detailorder.id_order WHERE tb_order.id_order = ?', [req.params.id]);

    if (rows.length === 0) {
        return res.status(404).json({ message: 'ID order tidak dapat ditemukan!' });
    }

    const response = res.status(200).json({ message: 'Data ditemukan. ', data: rows[0] });
    return response;
};

exports.getReport = async (req, res) => {

    const [rows] = await db.promise().query('SELECT * FROM tb_order INNER JOIN tb_detailorder ON tb_order.id_order = tb_detailorder.id_order WHERE month(tb_order.tgl_order) = ? AND year(tb_order.tgl_order) AND tb_order.id_user = ?', [req.params.tgl, req.params.tahun, req.params.idUser]);

    if (rows.length === 0) {
        return res.status(404).json({ message: 'Data laporan tidak ada!' });
    }

    const response = res.status(200).json({ message: 'Data ditemukan. ', data: rows[0] });
    return response;
};

exports.sendData = async (req, res) => {

    const [rows] = await db.promise().query('SELECT * FROM tb_order INNER JOIN tb_detailorder ON tb_order.id_order = tb_detailorder.id_order WHERE month(tb_order.tgl_order) = ? AND year(tb_order.tgl_order) AND tb_order.id_user = ? INTO OUTFILE "/path/to/file.csv"', [req.params.tgl, req.params.tahun, req.params.idUser]);
    if (rows.length === 0) {
        return res.status(404).json({ message: 'Data laporan tidak ada!' });
    }

    const response = res.status(200).json({ message: 'Data ditemukan. ', data: rows[0] });
    return response;
    const csvData = $.csv.fromObjects(rows);
    console.log(csvData);
    
    
}

exports.login = async (req, res) => {
    const {
        email,
        password,
    } = req.body;

    
    // Password validation
    if (password === '') {
        const response = res.send({
            status: 'Gagal',
            message: 'Password tidak boleh kosong.',
        });
        response.status(400);
        return response;
    }

    const [rows] = await db.promise().query(`SELECT * FROM tb_user WHERE email = '${req.body.email}'`);
    if (rows.length !== 0) {

        const auth =bcrypt.compareSync(password, rows[0].password);
        console.log(password);
        console.log(rows[0].password);
        console.log(bcrypt.compareSync(password, rows[0].password));

        if (auth) {
            const token = createToken(rows[0].id);
            res.cookie('jwt', token, { httpOnly: false, maxAge: maxExpire * 1000 });
            const response = res.status(200).json({
                message: 'Berhasil Login.',
                user_id: rows[0].id_user,
                token: token,
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
