const express = require("express");
const router = express.Router();

const db = require("../db/index"); // 数据库函数

router.getInfobyDate = function (req, res) {
  const queryStr = req.query.date; //前端query中包含了date，格式为时间戳(ms) 数字型
  const statusStr = req.query.studentStatus; // 学生的在校状态 数字型
  const sqlStr = "select * from student_info";
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
        // 判断是否为同一天：取出当前时间戳和对比的时间戳，格式化为当天0时0分0秒的时间戳，如果相等则是同一天
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
          // 说明是同一天，则返回该数据即可 results是个数组，其中内部均为对象，以下值均是附加属性
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
router.getTempList = function (req, res) {
  const reqStr = req.query.idcard; // 前端query中包含了idcard
  const sqlStr = "select temperatureList from student_info where idcard = ?";
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

// 当教师想要查看在册学生信息时，请求该接口
router.getRegistryStudentInfo = function (req, res) {
  // 默认返回去的是学生最近的测温记录
  const queryStr = req.query.conductorName;
  const sqlStr = "select * from student_info where conductor = ?";
  db.query(sqlStr, queryStr, (err, results) => {
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
      studentData: results,
    });
  });
};

module.exports = router;
