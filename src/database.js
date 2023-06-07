// 'use strict';
// // [START cloud_sql_mysql_mysql_connect_unix]
// const mysql = require('promise-mysql');

// // createUnixSocketPool initializes a Unix socket connection pool for
// // a Cloud SQL instance of MySQL.
// const createUnixSocketPool = async config => {
//   // Note: Saving credentials in environment variables is convenient, but not
//   // secure - consider a more secure solution such as
//   // Cloud Secret Manager (https://cloud.google.com/secret-manager) to help
//   // keep secrets safe.
//   return mysql.createPool({
//     user: process.env.DB_USER, // e.g. 'my-db-user'
//     password: process.env.DB_PASS, // e.g. 'my-db-password'
//     database: process.env.DB_NAME, // e.g. 'my-database'
//     socketPath: process.env.INSTANCE_UNIX_SOCKET, // e.g. '/cloudsql/project:region:instance'
//     // Specify additional properties here.
//     ...config,
//   });
// };
// // [END cloud_sql_mysql_mysql_connect_unix]
// module.exports = createUnixSocketPool;




//----------------------------------------//
const mysql = require('mysql2');
require('dotenv').config();

module.exports = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,

//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'kewarung_db',
});
