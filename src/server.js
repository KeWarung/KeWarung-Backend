// import express
const express = require("express");
const cors = require('cors');
const cookieParser = require('cookie-parser');
const routes = require('./routes');

// use port
const port = 8080;
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({
    extended: true,
}));

//fire it up
app.use(routes);

app.listen(
    port,
    () => console.log(`It's alive on http://localhost:${port}`)
)
