const express = require('express');
// const swaggerUi = require('swagger-ui-express');
// const swaggerDocument = require('../docs/kewarung-openapi.json');

const { requireAuth } = require('./middlewares');

const {
    getAllUsers,
    signupPost,
    getUserById,
    editUserById,
    deleteUserById,
    getAllProducts,
    getProductById,
    editProductById,
    deleteProductById,
    login,
    logout,
} = require('./handler');

const routes = express.Router();

// routes.use('/', swaggerUi.serve);
// routes.get('/', swaggerUi.setup(swaggerDocument));

routes.get('/users', getAllUsers);
routes.post('/users', signupPost); 

routes.get('/users/:id', requireAuth, getUserById); // Token tidak terdeteksi, harap login terlebih dahulu!
// routes.put('/users/:id', requireAuth, editUserById); // still development
// routes.delete('/users/:id', requireAuth, deleteUserById); //still development

routes.get('/products', getAllProducts);

// routes.get('/products/:id', requireAuth, getProductById); // still development
// routes.get('/products/:iduser', requireAuth, getProductByIdUser); // still development
// routes.get('/products/:stok', requireAuth, getProductByStok); // still development
// routes.put('/products/:id', requireAuth, editProductById); // still development
// routes.delete('/products/:id', requireAuth, deleteProductById); // still developmecnt

// routes.get('/orders', getAllOrders); //still development

// routes.get('/orders/:id', requireAuth, getOrderById); //still development
// routes.get('/orders/:date', requireAuth, getOrderByDate); //still development

routes.post('/login', login); // Password salah

routes.post('/logout', logout); //TypeError: res.cookie is not a function

module.exports = routes;