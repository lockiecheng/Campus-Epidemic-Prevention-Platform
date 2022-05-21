const express = require("express");
const router = express.Router();

const db = require("../db/index");

router.getFootprintInfo = function (req, res) {
  const queryStr = req.query.idcard;
  const identification = req.query.identification; // 判断是什么身份请求后端数据
  const tableName =
    identification == 1 ? "teacher_footprint_info": "student_footprint_info";
  const sqlStr = `select * from ${tableName} where idcard = ?`;
  db.query(sqlStr, [queryStr], (err, results) => {
    if (err)
      return res.send({
        status: 1,
        msg: err.message,
      });
    if (results.length === 0)
      return res.send({
        status: 1,
        msg: "查询为空",
      });
    return res.send({
      status: 0,
      msg: "查询成功",
      footprintInfo: results[0],
    });
  });
};

module.exports = router;
