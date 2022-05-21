const express = require("express");
const router = express.Router();

const db = require("../db/index"); // 数据库函数

router.getTeacherInfoByDate = function (req, res) {
  const queryStr = req.query.date; //前端query中包含了date，格式为时间戳(ms) 数字型
  const statusStr = req.query.teacherStatus; // 学生的在校状态 数字型
  const sqlStr = "select * from teacher_info";
  db.query(sqlStr, function (err, results) {
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
    var resultsByDate = [];
    for (var i = 0; i < results.length; i++) {
      results[i].temperatureList = JSON.parse(results[i].temperatureList);
      for (var j = 0; j < results[i].temperatureList.length; j++) {
        if (
          new Date(Number(results[i].temperatureList[j].temMeaTime)).setHours(
            // mysql中的temperature属性内部JSON key-value，value是字符型
            0,
            0,
            0,
            0
          ) == new Date(Number(queryStr)).setHours(0, 0, 0, 0) && // queryStr是数字型的时间戳
          Number(results[i].temperatureList[j].isOnschool) == statusStr // 取出当前特定学生状态的数据
        ) {
          results[i].isTemMea = Number(results[i].temperatureList[j].isTemMea);
          results[i].isOnschool = Number(
            results[i].temperatureList[j].isOnschool
          );
          results[i].temperature = Number(
            results[i].temperatureList[j].temperature
          );
          results[i].temMeaTime = Number(
            results[i].temperatureList[j].temMeaTime
          );
          resultsByDate.push(results[i]); // 返回的均是数字型
        }
      }
    }
    return res.send({
      status: 0,
      msg: "查询成功",
      resultsByDate: resultsByDate,
    });
  });
};

// 查询tempList的数据，为绘制折线图提供数据
router.getTeacherTempList = function (req, res) {
  const reqStr = req.query.idcard; // 前端query中包含了idcard
  const sqlStr = "select temperatureList from teacher_info where idcard = ?";
  db.query(sqlStr, reqStr, function (err, results) {
    if (err)
      return res.send({
        status: 1,
        msg: err.message,
      });
    if (results.length === 0)
      return res.send({
        status: 1,
        msg: "查询不到数据",
      });
    return res.send({
      status: 0,
      msg: "数据查询成功",
      tempList: results,
    });
  });
};

module.exports = router;
