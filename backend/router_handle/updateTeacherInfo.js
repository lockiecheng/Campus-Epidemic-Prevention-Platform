const express = require("express");
const router = express.Router();

const db = require("../db/index"); // 导入db模块

router.updateTeacherInfo = function (req, res) {
  const body = req.body;
  // 更新temperatureList中的数据，主要是isOnschool的状态进行更新
  const updateStr = `update teacher_info set temperatureList = 
  JSON_REPLACE(
  temperatureList,
  REPLACE(
    REPLACE(
      JSON_SEARCH(
        temperatureList,
        'all',
        '${body.temMeaTime}',
        null,
        '$**.temMeaTime'),
        '"',
        ''
      )
    ,'temMeaTime'
    ,'isOnschool'
  ),
  '${body.isOnschool}') where idcard = '${body.idcard}'`;
  const sqlStr = "select * from teacher_info where idcard = ?";
  db.query(sqlStr, body.idcard, function (err, results) {
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
    // 查询到结果后进行判断
    db.query(updateStr, function (err, results) {
      if (err)
        return res.send({
          status: 1,
          msg: err.message,
        });
      if (results.affectedRows < 1)
        return res.send({
          status: 1,
          msg: "修改老师在校状态失败",
        });
      return res.send({
        status: 0,
        msg: "修改老师在校状态成功",
      });
    });
  });
};

module.exports = router;
