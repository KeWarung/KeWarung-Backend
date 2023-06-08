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
    addProducts,
    getProductById,
    getProductByIdUser,
    editProductById,
    deleteProductById,
    getAllOrders,
    getOrderById,
    getOrderByDate,
    login,
    logout,
    
} = require('./handler');

const routes = express.Router();

// routes.use('/', swaggerUi.serve);
// routes.get('/', swaggerUi.setup(swaggerDocument));

routes.get('/users', getAllUsers);
routes.post('/users', signupPost); 

routes.get('/users/:id', getUserById); // Token tidak terdeteksi, harap login terlebih dahulu!
routes.put('/users/:id', requireAuth, editUserById); // Token tidak terdeteksi, harap login terlebih dahulu! 
routes.delete('/users/:id', deleteUserById); // Token tidak terdeteksi, harap login terlebih dahulu!

routes.get('/products', getAllProducts);
routes.post('/products', addProducts)

routes.get('/products/:id', getProductById); // Token tidak terdeteksi, harap login terlebih dahulu!
routes.get('products/:iduser', getProductByIdUser); // still development
// routes.get('/products/:stok', requireAuth, getProductByStok); // still development
routes.put('/products/:id', editProductById); // Token tidak terdeteksi, harap login terlebih dahulu!
routes.delete('/products/:id', deleteProductById); // Why id product not delete?

routes.get('/orders', getAllOrders); //still development
// routes.post('/orders', addOrder);

routes.get('/orders/:id', getOrderById); //Token tidak terdeteksi, harap login terlebih dahulu!
routes.get('/orders/:date', getOrderByDate); //still development
// routes.put('/orders', requireAuth, editOder); //still development
// routes.delete('/orders', requireAuth, deleteOrder); //still development

routes.post('/login', login); // secretOrPrivateKey must have a value

routes.post('/logout', logout); 

module.exports = routes;