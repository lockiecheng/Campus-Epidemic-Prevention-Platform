const mysql = require("mysql");

const db = mysql.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "admin123",
  database: "schooll",
});

// 向外共享数据库连接对象
module.exports = db;