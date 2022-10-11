const mysql = require('mysql');

const db = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "",
    database: "thesis_v2_db"
})

module.exports = db;