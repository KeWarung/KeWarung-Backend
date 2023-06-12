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
    getProductByStok,
    getProductByName,
    editProductById,
    deleteProductById,
    getAllOrders,
    getOrderById,
    addOrder,
    getReport,
    login,
    logout,
    
} = require('./handler');

const routes = express.Router();

// routes.use('/', swaggerUi.serve);
// routes.get('/', swaggerUi.setup(swaggerDocument));

routes.get('/users', getAllUsers);
routes.post('/users', signupPost); 

routes.get('/users/:id', requireAuth, getUserById); 
routes.put('/users/:id', requireAuth, editUserById);  
routes.delete('/users/:id', requireAuth, deleteUserById); 

routes.get('/products', requireAuth, getAllProducts);
routes.post('/products', requireAuth, addProducts);

routes.get('/products/:id', requireAuth, getProductById); 
routes.get('/products-users/:id', requireAuth, getProductByIdUser); 
routes.get('/products-stock/:id', requireAuth, getProductByStok);
routes.get('/products-name/:id&:idUser', requireAuth, getProductByName);
routes.put('/products/:id', requireAuth, editProductById); 
routes.delete('/products/:id', requireAuth, deleteProductById); 

routes.get('/orders', requireAuth, getAllOrders); 
routes.post('/orders/:idUser&:idProduct', requireAuth, addOrder);
routes.get('/orders/:id', requireAuth, getOrderById); 

routes.get('/report/:tgl&:tahun&:idUser', requireAuth, getReport)

routes.post('/login', login); 
routes.post('/logout', logout); 

module.exports = routes;
